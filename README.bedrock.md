# Emojisearch with AWS Bedrock

AI-powered emoji search using AWS Bedrock (Claude 3 Haiku) - **97% cheaper than OpenAI!**

## Features

- 🤖 **AWS Bedrock Integration**: Uses Claude 3 Haiku via AWS Bedrock
- 🔐 **IAM Role Authentication**: No API keys needed when running on EC2
- 💰 **Cost Effective**: ~$0.04 per 1M searches vs $1.10 with OpenAI
- 🚀 **Fast**: Claude 3 Haiku optimized for speed
- 📦 **Docker Ready**: Complete containerization with Podman/Docker
- 🎯 **Production Ready**: Includes health checks, graceful errors, caching

## Quick Start (AWS Bedrock - Recommended)

### Prerequisites

- AWS account with Bedrock access
- EC2 instance with IAM role OR AWS credentials
- Node.js 20+ and pnpm
- Podman or Docker

### Setup

```bash
# 1. Run the automated setup script
chmod +x setup-bedrock.sh
./setup-bedrock.sh

# 2. Build and run
podman build -t localhost/emojisearch:latest .
podman-compose up -d

# 3. Access the app
open http://localhost:3000
```

### Manual Setup

```bash
# 1. Switch to Bedrock implementation
cp api/_utils.bedrock.ts api/_utils.ts

# 2. Install dependencies (AWS SDK already in package.json)
pnpm install

# 3. Configure environment
cp .env.bedrock.example .env
# Edit .env and set AWS_DEFAULT_REGION

# 4. Build
pnpm build

# 5. Run
node .output/server/index.mjs
```

## AWS Bedrock Configuration

### Option 1: EC2 IAM Role (Recommended)

The app automatically uses the EC2 instance's IAM role. Ensure your IAM role has:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-*"
    }
  ]
}
```

### Option 2: AWS Credentials

Set environment variables:

```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=ap-northeast-1
```

### Model Access

1. Go to AWS Console → Bedrock → Model access
2. Request access to "Claude 3 Haiku"
3. Wait for approval (usually instant)

## API Usage

```bash
# Search for emojis
curl "http://localhost:3000/api/completion?query=happy"
# Returns: ["🙂","😊","😀","😄","😆","😃","☺️","😁","😍","😸"]

curl "http://localhost:3000/api/completion?query=security"
# Returns: ["🔒","🔑","🛡️","🕵️‍♂️","🔍","🚨","🔐","🔏"]
```

## Docker Deployment

### Using Podman

```bash
# Build
podman build -t localhost/emojisearch:latest .

# Run with host network (for IAM role access)
podman run -d \
  --name emojisearch \
  --network host \
  --cap-add NET_ADMIN \
  --cap-add SYS_ADMIN \
  -e AWS_DEFAULT_REGION=ap-northeast-1 \
  localhost/emojisearch:latest

# Or use docker-compose
podman-compose up -d
```

### Using Docker

```bash
docker build -t emojisearch:latest .
docker-compose up -d
```

## Architecture

```
┌─────────────────────────────────────┐
│  Nuxt.js Frontend (Vue 3)          │
│  - Search input                     │
│  - Real-time emoji results          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Server API: /api/completion        │
│  - Query parameter validation       │
│  - Upstash KV caching (optional)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  AWS Bedrock Runtime                │
│  - Claude 3 Haiku model             │
│  - IAM role authentication          │
│  - Region: ap-northeast-1           │
└─────────────────────────────────────┘
```

## Cost Comparison

| Provider | Model | Input Cost | Output Cost | Per 1M Searches* |
|----------|-------|------------|-------------|------------------|
| OpenAI | GPT-4 Turbo | $10/1M tokens | $30/1M tokens | $1.10 |
| AWS Bedrock | Claude 3 Haiku | $0.25/1M tokens | $1.25/1M tokens | **$0.04** |

*Assuming 50 input + 20 output tokens per search

**Savings: 97%** 🎉

## Configuration

### Environment Variables

```bash
# Required
AWS_DEFAULT_REGION=ap-northeast-1    # Or us-east-1, eu-west-1, etc.

# Optional - Upstash KV for caching
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### Supported Regions

Claude 3 Haiku is available in:
- `us-east-1` (N. Virginia)
- `us-west-2` (Oregon)
- `ap-northeast-1` (Tokyo)
- `eu-west-1` (Ireland)
- `eu-central-1` (Frankfurt)

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## HTTPS Access (Optional)

### Using Tailscale Serve

If you're running on a Tailscale-connected machine and want HTTPS access (required for Clipboard API to work over the network):

```bash
# Get your Tailscale hostname
tailscale status --json | jq -r '.Self.DNSName'
# Example output: your-machine.your-tailnet.ts.net.

# Enable HTTPS on your tailnet (secure, private access)
sudo tailscale serve --bg --https 443 3000

# Access via HTTPS
https://your-machine.your-tailnet.ts.net/
```

**Benefits:**
- ✅ Automatic HTTPS with valid certificates
- ✅ Clipboard API works properly (requires secure context)
- ✅ No certificate management needed
- ✅ Accessible only within your Tailscale network

**To disable:**
```bash
sudo tailscale serve --https=443 off
```

**For public access** (outside your tailnet):
```bash
sudo tailscale funnel --bg --https 443 on
```

## Troubleshooting

### "You don't have access to the model"

1. Check model access in AWS Bedrock console
2. Verify IAM role has `bedrock:InvokeModel` permission
3. Confirm you're using a supported region
4. Request access to Claude 3 Haiku model

### Container can't access IAM role

The container needs specific capabilities to access EC2 metadata service:

```yaml
# In docker-compose.yml
network_mode: host
cap_add:
  - NET_ADMIN
  - SYS_ADMIN
```

### Rate limiting errors

Bedrock has default quotas. If you hit rate limits:
1. Request quota increase in AWS Service Quotas
2. Implement exponential backoff
3. Enable Upstash KV caching

### Clipboard not working

The Clipboard API requires a secure context (HTTPS). If clipboard copy isn't working:
1. **Local development**: Access via `http://localhost:3000` (always secure)
2. **Network access**: Use Tailscale Serve for HTTPS (see HTTPS Access section above)
3. **Alternative**: The app includes a fallback using `execCommand` for HTTP, but this may be blocked in some browsers

## Migration Guides

- **From OpenAI**: See [CLAUDE_MIGRATION.md](CLAUDE_MIGRATION.md)
- **From Anthropic API**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **To Bedrock**: Run `./setup-bedrock.sh`

## License

MIT

## Credits

Original project: [emojisearch.fun](https://github.com/prasincs/emojisearch) by Alexander B

AWS Bedrock integration: Prasanna Gautam
