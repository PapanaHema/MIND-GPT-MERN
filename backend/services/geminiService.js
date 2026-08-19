import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

export async function generateMindGptResponse(prompt, media) {
  if (!env.geminiApiKey) {
    const error = new Error("GEMINI_API_KEY is not configured on the server.");
    error.status = 500;
    error.publicMessage = error.message;
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const contents = media
    ? [{ inlineData: { mimeType: media.mimeType, data: media.data } }, { text: prompt }]
    : prompt;
  const generate = (model) => ai.models.generateContent({
    model,
    contents,
    config: { temperature: 0.9, maxOutputTokens: 2048 },
  });

  try {
    return await generate(env.geminiModel);
  } catch (error) {
    const canFallback = [429, 503].includes(error.status)
      && env.geminiModel !== env.geminiFallbackModel;
    if (!canFallback) {
      throw error;
    }
    console.warn(`${env.geminiModel} returned ${error.status}; retrying with ${env.geminiFallbackModel}.`);
    return generate(env.geminiFallbackModel);
  }
}
