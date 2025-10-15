# 🕵️‍♂️ AI-Powered Emoji Search

Fork of [aleksdotbar/emojisearch](https://github.com/aleksdotbar/emojisearch) with **self-hosted AWS Bedrock support** - no Vercel dependency, 97% cost savings, and full control over your deployment.

## 🚀 What's New in This Fork

### **Self-Hosted & Platform Independent**
- ✅ **No Vercel Required**: Run anywhere - EC2, local, Kubernetes
- ✅ **Standard Node.js**: Migrated from Vercel Edge runtime to Nuxt server routes
- ✅ **Docker/Podman Ready**: Complete containerization with health checks
- ✅ **IAM Role Support**: No API keys needed when running on AWS infrastructure

### **AWS Bedrock Integration**
- 🤖 **Claude 3 Haiku**: Fast, intelligent emoji generation via AWS Bedrock
- 💰 **97% Cost Reduction**: ~$0.04 per 1M searches vs $1.10 with OpenAI
- 🔐 **Secure by Default**: Uses EC2 IAM roles instead of API keys
- 🌍 **Multi-Region**: Supports all AWS regions with Bedrock availability

### **Enhanced Deployment Options**
- 📦 **Production-Ready Docker**: Multi-stage builds, non-root user, health checks
- 🔄 **Easy Migration**: Automated setup scripts for switching AI providers
- 📊 **Better Observability**: Structured logging and error handling
- ⚡ **Optimized Performance**: Improved caching and resource management

## Quick Start

### AWS Bedrock Setup (Recommended - No API Keys!)

```bash
# 1. Run automated setup
chmod +x setup-bedrock.sh
./setup-bedrock.sh

# 2. Build and deploy
podman build -t localhost/emojisearch:latest .
podman-compose up -d

# 3. Access at http://localhost:3000
```

**See [README.bedrock.md](README.bedrock.md) for complete Bedrock setup guide**

### Traditional Setup (OpenAI/Anthropic)

```bash
# Install dependencies
pnpm install

# Configure API key
echo "NUXT_OPENAI_API_KEY=your_key" > .env

# Development
pnpm dev

# Production
pnpm build
node .output/server/index.mjs
```

## Architecture Comparison

### Original (Vercel-Dependent)
```
Vercel Edge Runtime → OpenAI API → $$$
- Tied to Vercel platform
- Edge function limitations
- Higher costs per request
```

### This Fork (Self-Hosted)
```
Your Infrastructure → AWS Bedrock (IAM Role) → $ (97% cheaper!)
- Deploy anywhere (EC2, Docker, Kubernetes)
- Standard Node.js (no platform lock-in)
- Use existing AWS infrastructure
- Scale horizontally
```

## Cost Comparison

| Deployment | AI Provider | Cost per 1M Searches | Notes |
|------------|-------------|---------------------|-------|
| **Original** | OpenAI GPT-4 | **$1.10** | Vercel required |
| **This Fork** | AWS Bedrock (Claude 3 Haiku) | **$0.04** | 97% savings, self-hosted |
| **This Fork** | Anthropic API | $0.04 | API key required |
| **This Fork** | OpenAI | $1.10 | Backward compatible |

## Deployment Options

### Docker/Podman
```bash
podman build -t emojisearch:latest .
podman-compose up -d
```

### AWS EC2
```bash
# Uses IAM role automatically - no credentials needed!
./setup-bedrock.sh
podman-compose up -d
```

### Local Development
```bash
pnpm install
pnpm dev
```

### Kubernetes
```yaml
# See docker-compose.yml for reference configuration
# Requires IAM roles for service accounts (IRSA) for Bedrock
```

## Configuration

### Environment Variables

```bash
# AWS Bedrock (Recommended)
AWS_DEFAULT_REGION=ap-northeast-1  # Or us-east-1, eu-west-1

# Anthropic API (Alternative)
NUXT_ANTHROPIC_API_KEY=your_key

# OpenAI (Original)
NUXT_OPENAI_API_KEY=your_key

# Optional Caching
KV_URL=your_upstash_url
KV_REST_API_TOKEN=your_token
```

## API Usage

```bash
# Search for emojis
curl "http://localhost:3000/api/completion?query=happy"
# Response: ["🙂","😊","😀","😄","😆","😃","☺️","😁","😍","😸"]

curl "http://localhost:3000/api/completion?query=security"
# Response: ["🔒","🔑","🛡️","🕵️‍♂️","🔍","🚨","🔐","🔏"]
```

## Migration Guides

- **From original emojisearch**: Run `./setup-bedrock.sh`
- **From OpenAI to Bedrock**: See [README.bedrock.md](README.bedrock.md)
- **From Anthropic to Bedrock**: See [CLAUDE_MIGRATION.md](CLAUDE_MIGRATION.md)
- **General deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## Key Improvements Over Original

1. **Platform Independence**: No vendor lock-in, runs on any Node.js environment
2. **Cost Efficiency**: 97% cheaper with AWS Bedrock
3. **Security**: IAM role authentication, no long-lived API keys
4. **Deployment Flexibility**: Docker, Kubernetes, systemd, PM2
5. **Better DevEx**: Standard Nuxt server routes, easier to debug and extend
6. **Production Ready**: Health checks, graceful errors, structured logging

## Requirements

- Node.js 20+
- pnpm 8.15.9+
- Docker/Podman (for containerized deployment)
- AWS account with Bedrock access (for Bedrock option)

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck
```

## License

MIT

## Credits

**Original Project**: [aleksdotbar/emojisearch](https://github.com/aleksdotbar/emojisearch) by Alexander Barkhatov

**This Fork**: AWS Bedrock integration, self-hosting support, and cost optimization by Prasanna Gautam

## Contributing

Contributions welcome! This fork focuses on:
- Self-hosting improvements
- Cost optimization
- Platform independence
- Enterprise deployment features

## Support

- 📖 [Bedrock Setup Guide](README.bedrock.md)
- 🔄 [Migration Guides](CLAUDE_MIGRATION.md)
- 🐛 Issues: Please open an issue for bugs or feature requests
- 💬 Discussions: For questions and community support
