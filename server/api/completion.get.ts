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
  try {
    const emojis = await generateEmojis(prompt);

    // Cache for future use
    cacheEmojis(prompt, emojis).catch(() => {});

    return emojis;
  } catch (error: any) {
    // Handle Bedrock throttling gracefully
    if (error.name === 'ThrottlingException' || error.message?.includes('Too many requests')) {
      throw createError({
        statusCode: 429,
        statusMessage: "Rate limit exceeded. Please wait a moment and try again."
      });
    }
    // Re-throw other errors
    throw error;
  }
});
