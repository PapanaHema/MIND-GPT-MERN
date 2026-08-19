import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url), quiet: true });

export const env = {
  port: Number(process.env.PORT) || 8999,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || "change-this-development-secret",
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite",
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
