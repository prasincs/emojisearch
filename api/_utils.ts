import { kv } from "@vercel/kv";
import OpenAI from "openai";
import split from "lodash.split";
import emojiList from "emoji.json/emoji-compact.json";

const openai = new OpenAI({
  apiKey: process.env.NUXT_OPENAI_API_KEY,
});

export const generateEmojis = async (prompt: string) => {
  const {
    choices: [{ message }],
  } = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    max_tokens: 256,
    temperature: 0.8,
    top_p: 0.5,
    frequency_penalty: 0.6,
    presence_penalty: 1,
    messages: [
      {
        role: "system",
        content: "Format result as a joined string",
      },
      {
        role: "user",
        content: `Generate up to 10 emojis relevant to the prompt: "${prompt}". Do not repeat emojis.`,
      },
    ],
  });

  const validEmojis = splitEmojis(message.content ?? "").filter(isValidEmoji);

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
