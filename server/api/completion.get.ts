import { getCachedEmojis, cacheEmojis, generateEmojis } from "../../api/_utils";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const prompt = (query.query as string)?.trim().toLowerCase();

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing query parameter"
    });
  }

  // Try cache first
  const cachedEmojis = await getCachedEmojis(prompt);

  if (cachedEmojis && cachedEmojis.length > 0) {
    // Generate fresh emojis in background and cache additional ones
    generateEmojis(prompt).then((emojis) => {
      const newEmojis = emojis.filter((emoji) => !cachedEmojis.includes(emoji));
      if (newEmojis.length > 0) {
        cacheEmojis(prompt, newEmojis).catch(() => {});
      }
    }).catch(() => {});

    return cachedEmojis;
  }

  // No cache, generate fresh
  const emojis = await generateEmojis(prompt);

  // Cache for future use
  cacheEmojis(prompt, emojis).catch(() => {});

  return emojis;
});
