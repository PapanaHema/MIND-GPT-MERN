/* eslint-env node */
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await connectDatabase();
    app.listen(env.port, () => console.log(`Backend running at http://localhost:${env.port}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
