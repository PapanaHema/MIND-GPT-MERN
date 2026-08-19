/* eslint-env node */
import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { User } from "../models/User.js";

const backendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const usersFile = path.join(backendDir, "data", "users.json");

try {
  await connectDatabase();
  const users = JSON.parse(await fs.readFile(usersFile, "utf8"));
  for (const user of users) {
    await User.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      {
        $set: {
          name: user.name,
          passwordHash: user.passwordHash,
          resetCodeHash: user.resetCodeHash || null,
          resetCodeExpiresAt: user.resetCodeExpiresAt ? new Date(user.resetCodeExpiresAt) : null,
        },
        $setOnInsert: {
          _id: user.id,
          email: user.email.toLowerCase(),
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }
  console.log(`Migrated ${users.length} user(s) to MongoDB.`);
} catch (error) {
  if (error.code === "ENOENT") {
    console.log("No JSON user file found; nothing to migrate.");
  } else {
    console.error("User migration failed:", error.message);
    process.exitCode = 1;
  }
} finally {
  await mongoose.disconnect();
}
