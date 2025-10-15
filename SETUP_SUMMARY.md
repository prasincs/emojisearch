# Emojisearch Deployment Summary

## What is This?

AI-powered emoji search using OpenAI/Claude to find relevant emojis based on natural language queries.

Example: Query "happy birthday" → Returns 🎂🎉🎁🎈🥳

## Files Created

- `Dockerfile` - Multi-stage Node.js build
- `docker-compose.yml` - Container orchestration
- `.env` - Environment configuration (OpenAI version)
- `.env.claude.example` - Claude API configuration example
- `DEPLOYMENT.md` - Full deployment guide
- `CLAUDE_MIGRATION.md` - Migration guide to Claude API
- `api/_utils.claude.ts` - Claude API implementation

## Quick Start (OpenAI)

```bash
cd /home/ubuntu/emojisearch

# 1. Configure OpenAI API key
echo "NUXT_OPENAI_API_KEY=your_key_here" > .env

# 2. Build and run
podman-compose up -d

# 3. Access at http://localhost:3000
```

## Quick Start (Claude - Recommended for Cost)

```bash
cd /home/ubuntu/emojisearch

# 1. Install Anthropic SDK
pnpm add @anthropic-ai/sdk

# 2. Use Claude version
cp api/_utils.claude.ts api/_utils.ts

# 3. Configure Claude API key
echo "NUXT_ANTHROPIC_API_KEY=your_key_here" > .env

# 4. Build and run
podman-compose up -d

# 5. Access at http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────┐
│  Nuxt.js Frontend (Vue 3)               │
│  - Search input                         │
│  - Emoji results display                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  API Route: /api/completion             │
│  - Rate limiting (optional)             │
│  - Caching (Upstash KV)                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  AI Provider                            │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │  OpenAI     │  │  Claude/Bedrock  │ │
│  │  GPT-4 Nano │  │  Claude 3 Haiku  │ │
│  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

## Port Allocation

- **3000**: Emojisearch web interface
- **8080**: Miniflux (existing)
- **8081**: RSS Reader (existing)
- **8082**: PDF Service (existing)

## Cost Comparison

| Provider | Model | Cost per 1M searches* |
|----------|-------|----------------------|
| OpenAI | GPT-4 Turbo | $1.10 |
| Anthropic | Claude 3 Haiku | $0.04 |
| AWS Bedrock | Claude 3 Haiku | $0.04 |

*Assuming 50 input + 20 output tokens per search

## Next Steps

1. **Get API Key**: Sign up at https://console.anthropic.com/ or https://platform.openai.com/
2. **Optional - Rate Limiting**: Sign up at https://upstash.com/ for KV storage
3. **Deploy**: Follow DEPLOYMENT.md
4. **Migrate to Claude**: Follow CLAUDE_MIGRATION.md (recommended for 97% cost savings)

## Integration with Existing Services

Can be added to your existing docker-compose.production.yml:

```yaml
services:
  # ... existing services (miniflux, rss-reader, pdf-service) ...

  emojisearch:
    build:
      context: /home/ubuntu/emojisearch
      dockerfile: Dockerfile
    image: localhost/emojisearch:latest
    container_name: emojisearch
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NUXT_ANTHROPIC_API_KEY=${NUXT_ANTHROPIC_API_KEY}
    networks:
      - newsletter-network
```
