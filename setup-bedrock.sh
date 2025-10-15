#!/bin/bash
set -e

echo "🚀 Setting up Emojisearch with AWS Bedrock (No API Key Required!)"
echo "=================================================================="
echo ""

# Backup original files
echo "📦 Backing up original API implementation..."
cp api/_utils.ts api/_utils.openai.ts.bak

# Use Bedrock versions
echo "🔄 Switching to Bedrock implementation..."
cp api/_utils.bedrock.ts api/_utils.ts

# Install dependencies (if needed)
echo "📥 Installing dependencies with pnpm..."
pnpm install

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# AWS Bedrock Configuration
# No API key needed - uses EC2 IAM role!
AWS_DEFAULT_REGION=us-east-1

# Optional: Upstash KV for caching (leave empty to disable)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify IAM role has bedrock:InvokeModel permission"
echo "2. Build: podman build -t localhost/emojisearch:latest ."
echo "3. Run: podman-compose up -d"
echo "4. Access: http://localhost:3000"
echo ""
echo "💰 Cost: ~$0.04 per 1M emoji searches (97% cheaper than OpenAI!)"
echo "🔐 Security: No API keys - uses IAM role authentication"
