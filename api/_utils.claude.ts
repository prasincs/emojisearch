import { kv } from "@vercel/kv";
import Anthropic from "@anthropic-ai/sdk";
import split from "lodash.split";
import emojiList from "emoji.json/emoji-compact.json";

const anthropic = new Anthropic({
  apiKey: process.env.NUXT_ANTHROPIC_API_KEY || process.env.NUXT_CLAUDE_API_KEY,
});

export const generateEmojis = async (prompt: string) => {
  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",  // Fast and cheap for emoji generation
    max_tokens: 256,
    temperature: 0.8,
    system: "Format result as a joined string of emojis only, no spaces or other characters.",
    messages: [
      {
        role: "user",
        content: `Generate up to 10 emojis relevant to the prompt: "${prompt}". Do not repeat emojis. Return only the emojis with no spaces or other text.`,
      },
    ],
  });

  const content = message.content[0];
  const emojiString = content.type === 'text' ? content.text : "";

  const validEmojis = splitEmojis(emojiString).filter(isValidEmoji);

  return uniq(validEmojis);
};

const key = (prompt: string) => `emojis:${prompt}`;

export const cacheEmojis = async (prompt: string, emojis: Array<string>) => {
  if (emojis.length) {
    await kv.rpush(key(prompt), ...emojis);
  }
};

export const getCachedEmojis = async (prompt: string) => {
  return await kv.lrange(key(prompt), 0, -1);
};

const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

const splitEmojis = (text: string) => (text ? split(text.replace(/\s/g, ""), "") : []);

const isValidEmoji = (emoji: string) => emojiList.includes(emoji);
