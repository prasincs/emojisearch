# AWS Bedrock Rate Limits & Solutions

## The Problem

You're experiencing **500 errors** because AWS Bedrock has strict default rate limits:

- **Burst capacity**: 10 requests
- **Requests per minute**: Varies by region (typically 5-50 RPM)
- **Tokens per minute**: 50,000-200,000 depending on model

After the burst capacity is exhausted, you'll get throttled until the rate limit window resets.

## Current Status

✅ API now returns **429 (Rate Limited)** instead of 500 for throttling
❌ Default quotas are too low for interactive use
❌ No caching = every search hits Bedrock

## Solutions (Choose One or More)

### 1. Request Quota Increase (Recommended)

**Steps:**
```bash
# Go to AWS Console
1. Navigate to: Service Quotas → AWS Services → Amazon Bedrock
2. Find: "InvokeModel requests per minute - Claude 3 Haiku"
3. Current: 5-10 RPM (default)
4. Request: 100+ RPM (for interactive use)
5. Approval: Usually instant to 24 hours
```

**Check current quotas:**
```bash
aws service-quotas list-service-quotas \
  --service-code bedrock \
  --region ap-northeast-1 \
  --query 'Quotas[?contains(QuotaName, `InvokeModel`)].{Name:QuotaName,Value:Value}'
```

### 2. Enable Upstash KV Caching (Quick Fix)

**Why it helps:**
- Caches emoji results for each query
- Repeat searches = instant response, no Bedrock call
- Dramatically reduces API usage

**Setup:**
```bash
# 1. Sign up at https://upstash.com (free tier: 10K commands/day)

# 2. Create Redis database

# 3. Update .env
KV_REST_API_URL=https://your-db.upstash.io
KV_REST_API_TOKEN=your_token

# 4. Rebuild and restart
podman-compose down
podman build -t localhost/emojisearch:latest .
podman-compose up -d
```

**Cost:** Free tier covers ~1000 unique searches/day

### 3. Implement Client-Side Throttling

Add to your frontend (app.vue or composable):

```typescript
// Debounce search input
const debouncedSearch = useDebounceFn(async (query: string) => {
  try {
    const result = await $fetch('/api/completion', {
      query: { query }
    });
    emojis.value = result;
  } catch (error) {
    if (error.statusCode === 429) {
      // Show user-friendly message
      showError('Too many searches! Please wait a moment.');
      // Retry after delay
      setTimeout(() => debouncedSearch(query), 2000);
    }
  }
}, 500); // Wait 500ms after user stops typing
```

### 4. Switch to On-Demand Provisioning ($$)

For production with high traffic:

```bash
# AWS Console → Bedrock → Provisioned Throughput
- Reserve capacity: $XX/hour (region dependent)
- Guaranteed throughput with no throttling
- Best for: Production apps with steady traffic
```

## Recommended Approach

**For development/personal use:**
1. ✅ Enable Upstash KV cache (free, instant)
2. ✅ Request quota increase to 100 RPM
3. ✅ Add 1-second debounce to search input

**For production:**
1. ✅ Upstash KV cache (or Redis)
2. ✅ Request 500+ RPM quota
3. ✅ Implement exponential backoff
4. ✅ Monitor CloudWatch metrics
5. Consider provisioned throughput if needed

## Testing Your Setup

```bash
# Test without cache (should throttle after 5-10 requests)
for i in {1..15}; do
  curl "http://localhost:3000/api/completion?query=test$i"
  echo
  sleep 1
done

# With cache, repeat searches should be instant
curl "http://localhost:3000/api/completion?query=happy"  # Slow (hits Bedrock)
curl "http://localhost:3000/api/completion?query=happy"  # Fast! (from cache)
```

## Monitoring

Check throttling in CloudWatch:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name ThrottledRequests \
  --dimensions Name=ModelId,Value=anthropic.claude-3-haiku-20240307-v1:0 \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum \
  --region ap-northeast-1
```

## Cost Impact

| Solution | Setup Time | Cost | Throttling Fix |
|----------|-----------|------|----------------|
| Upstash KV Cache | 5 min | Free (10K/day) | 90% reduction |
| Quota Increase | 1-24 hrs | Free | ✅ Eliminates |
| Client Debounce | 15 min | Free | Partial |
| Provisioned Throughput | Instant | $$/hour | ✅ Eliminates |

## Next Steps

1. **Immediate:** Enable Upstash KV cache
2. **Short-term:** Request 100 RPM quota increase
3. **Long-term:** Monitor usage and scale as needed

---

**Current Status:** 429 errors are now properly handled. Users see rate limit message instead of generic error.
