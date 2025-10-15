import { kv } from "@vercel/kv";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import split from "lodash.split";
import emojiList from "emoji.json/emoji-compact.json";

// Bedrock client will use IAM role automatically when running on EC2
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-northeast-1"
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
      system: "Format result as a joined string of emojis only, no spaces or other characters.",
      messages: [
        {
          role: "user",
          content: `Generate up to 10 emojis relevant to the prompt: "${prompt}". Do not repeat emojis. Return only the emojis with no spaces or other text.`,
        },
      ],
    }),
  });

  const response = await bedrock.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  const emojiString = responseBody.content[0].text;
  const validEmojis = splitEmojis(emojiString).filter(isValidEmoji);

  return uniq(validEmojis);
};

const key = (prompt: string) => `emojis:${prompt}`;

export const cacheEmojis = async (prompt: string, emojis: Array<string>) => {
  if (emojis.length) {
    try {
      await kv.rpush(key(prompt), ...emojis);
    } catch (error) {
      // Gracefully handle KV errors if Upstash is not configured
      console.warn("KV cache unavailable:", error);
    }
  }
};

export const getCachedEmojis = async (prompt: string) => {
  try {
    return await kv.lrange(key(prompt), 0, -1);
  } catch (error) {
    // Return empty array if KV is not configured
    console.warn("KV cache unavailable:", error);
    return [];
  }
};

const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

const splitEmojis = (text: string) => (text ? split(text.replace(/\s/g, ""), "") : []);

const isValidEmoji = (emoji: string) => emojiList.includes(emoji);
