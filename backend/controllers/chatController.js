import { generateMindGptResponse } from "../services/geminiService.js";
import { validateMedia } from "../utils/media.js";

export async function sendChat(request, response) {
  const prompt = request.body?.prompt;
  const media = request.body?.media || request.body?.image;
  if (typeof prompt !== "string" || !prompt.trim()) {
    return response.status(400).json({ error: "A prompt is required." });
  }
  if (prompt.length > 10000) {
    return response.status(400).json({ error: "The prompt is too long." });
  }

  const mediaError = validateMedia(media);
  if (mediaError) return response.status(400).json({ error: mediaError });

  try {
    const result = await generateMindGptResponse(prompt.trim(), media);
    return response.json({ text: result.text || "No response was generated." });
  } catch (error) {
    console.error("Gemini API error:", error);
    const overloaded = error.status === 503;
    const quotaExceeded = error.status === 429;
    const message = error.message || "";
    const retryMatch = message.match(/retry in ([0-9.]+)s/i);
    const retrySeconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : null;
    return response.status(quotaExceeded ? 429 : overloaded ? 503 : error.status || 502).json({
      error: error.publicMessage || (quotaExceeded
        ? `MindGPT request limit has been reached.${retrySeconds ? ` Try again in about ${retrySeconds} seconds.` : " Please try again later or check Gemini billing."}`
        : overloaded
          ? "MindGPT is busy right now. Please try again in a moment."
          : "MindGPT could not process the request. Please check the API configuration."),
    });
  }
}
