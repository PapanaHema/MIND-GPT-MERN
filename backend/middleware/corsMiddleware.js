import cors from "cors";
import { env } from "../config/env.js";

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    const error = new Error("Origin is not allowed by CORS.");
    error.status = 403;
    callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
