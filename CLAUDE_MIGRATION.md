# Migrating Emojisearch to Claude API

## Why Migrate to Claude?

- **Cost**: Claude 3 Haiku is significantly cheaper than GPT-4
  - Claude 3 Haiku: $0.25/1M input, $1.25/1M output tokens
  - GPT-4 Turbo: $10/1M input, $30/1M output tokens
- **Quality**: Claude 3 is excellent at following instructions
- **Speed**: Claude 3 Haiku is optimized for fast responses

## Migration Steps

### 1. Install Anthropic SDK

```bash
cd /home/ubuntu/emojisearch
pnpm add @anthropic-ai/sdk
```

### 2. Replace OpenAI with Claude

```bash
# Backup original file
cp api/_utils.ts api/_utils.openai.ts

# Replace with Claude version
cp api/_utils.claude.ts api/_utils.ts
```

### 3. Update Environment Variables

```bash
# Edit .env file
nano .env
```

Replace:
```bash
NUXT_OPENAI_API_KEY=xxx
```

With:
```bash
NUXT_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Rebuild and Deploy

```bash
# Rebuild Docker image
podman build --no-cache -t localhost/emojisearch:latest .

# Restart service
podman-compose down
podman-compose up -d
```

## Using AWS Bedrock (Even Cheaper!)

If you want to use AWS Bedrock instead of Anthropic API directly:

### Update `api/_utils.ts`:

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1"
});

export const generateEmojis = async (prompt: string) => {
  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 256,
      temperature: 0.8,
      system: "Format result as a joined string of emojis only.",
      messages: [{
        role: "user",
        content: `Generate up to 10 emojis for: "${prompt}". No spaces.`
      }]
    })
  });

  const response = await bedrock.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));

  const emojiString = body.content[0].text;
  const validEmojis = splitEmojis(emojiString).filter(isValidEmoji);

  return uniq(validEmojis);
};
```

### Install AWS SDK:
```bash
pnpm add @aws-sdk/client-bedrock-runtime
```

### Environment Variables:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
# Or use IAM role if running on EC2
```

## Cost Comparison

### Example: 1 million emoji searches (avg 50 tokens input, 20 tokens output per search)

**OpenAI GPT-4 Turbo:**
- Input: (1M * 50) / 1M * $10 = $0.50
- Output: (1M * 20) / 1M * $30 = $0.60
- **Total: $1.10**

**Anthropic Claude 3 Haiku:**
- Input: (1M * 50) / 1M * $0.25 = $0.0125
- Output: (1M * 20) / 1M * $1.25 = $0.025
- **Total: $0.0375** (~97% cheaper!)

**AWS Bedrock Claude 3 Haiku:**
- Same pricing as Anthropic
- **Total: $0.0375**
- Plus: No API key management if using IAM roles

## Testing

After migration, test the API:

```bash
curl "http://localhost:3000/api/completion?query=happy"
```

Should return emoji array like: `["😊","😄","🎉","❤️"]`

## Rollback

If you need to rollback to OpenAI:

```bash
cp api/_utils.openai.ts api/_utils.ts
# Update .env back to NUXT_OPENAI_API_KEY
podman-compose down && podman-compose up -d --build
```
