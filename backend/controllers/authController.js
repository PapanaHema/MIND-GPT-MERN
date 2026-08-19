import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { getValidatedEmail } from "../utils/email.js";
import { createToken, publicUser } from "../utils/token.js";

export async function signup(request, response) {
  const name = request.body?.name?.trim();
  const email = getValidatedEmail(response, request.body?.email);
  const password = request.body?.password;
  if (!email) return;
  if (!name || typeof password !== "string") {
    return response.status(400).json({ error: "Name, email, and password are required." });
  }
  if (name.length < 2 || name.length > 100) {
    return response.status(400).json({ error: "Name must be between 2 and 100 characters." });
  }
  if (password.length < 8 || password.length > 128) {
    return response.status(400).json({ error: "Password must be between 8 and 128 characters." });
  }
  if (await User.exists({ email })) {
    return response.status(409).json({ error: "An account with this email already exists." });
  }

  let user;
  try {
    user = await User.create({
      _id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ error: "An account with this email already exists." });
    }
    throw error;
  }
  return response.status(201).json({ token: createToken(user), user: publicUser(user) });
}

export async function login(request, response) {
  const email = getValidatedEmail(response, request.body?.email);
  if (!email) return;
  if (typeof request.body?.password !== "string" || !request.body.password) {
    return response.status(400).json({ error: "Email and password are required." });
  }
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(request.body.password, user.passwordHash))) {
    return response.status(401).json({ error: "Incorrect email or password." });
  }
  return response.json({ token: createToken(user), user: publicUser(user) });
}

export async function getCurrentUser(request, response) {
  const user = await User.findById(request.user.id);
  if (!user) return response.status(401).json({ error: "Account not found." });
  return response.json({ user: publicUser(user) });
}

export async function updateProfilePicture(request, response) {
  const profilePicture = request.body?.profilePicture;
  if (typeof profilePicture !== "string") {
    return response.status(400).json({ error: "A profile picture is required." });
  }
  const match = profilePicture.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return response.status(400).json({ error: "Use a valid JPG, PNG, or WebP image." });
  }
  const sizeInBytes = Math.ceil(match[2].length * 0.75);
  if (sizeInBytes > 2 * 1024 * 1024) {
    return response.status(400).json({ error: "Profile picture must be smaller than 2 MB." });
  }
  const user = await User.findByIdAndUpdate(
    request.user.id,
    { profilePicture },
    { returnDocument: "after", runValidators: true },
  );
  if (!user) return response.status(404).json({ error: "Account not found." });
  return response.json({ user: publicUser(user) });
}

export async function removeProfilePicture(request, response) {
  const user = await User.findByIdAndUpdate(
    request.user.id,
    { profilePicture: null },
    { returnDocument: "after" },
  );
  if (!user) return response.status(404).json({ error: "Account not found." });
  return response.json({ user: publicUser(user) });
}

export async function forgotPassword(request, response) {
  const email = getValidatedEmail(response, request.body?.email);
  if (!email) return;
  const user = await User.findOne({ email }).select("+resetCodeHash +resetCodeExpiresAt");
  if (!user) {
    return response.json({ message: "If that account exists, a reset code has been created." });
  }
  const resetCode = String(crypto.randomInt(100000, 1000000));
  user.resetCodeHash = await bcrypt.hash(resetCode, 10);
  user.resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  console.log(`Password reset code for ${email}: ${resetCode}`);
  return response.json({
    message: "Reset code created. In development, it is shown below.",
    resetCode: env.nodeEnv === "production" ? undefined : resetCode,
  });
}

export async function resetPassword(request, response) {
  const email = getValidatedEmail(response, request.body?.email);
  if (!email) return;
  const code = String(request.body?.code || "").trim();
  const password = request.body?.password;
  if (!code || typeof password !== "string" || password.length < 8 || password.length > 128) {
    return response.status(400).json({
      error: "A valid code and password between 8 and 128 characters are required.",
    });
  }
  const user = await User.findOne({ email }).select(
    "+passwordHash +resetCodeHash +resetCodeExpiresAt",
  );
  const validCode = user?.resetCodeHash
    && user.resetCodeExpiresAt?.getTime() > Date.now()
    && (await bcrypt.compare(code, user.resetCodeHash));
  if (!validCode) {
    return response.status(400).json({ error: "The reset code is invalid or expired." });
  }
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetCodeHash = null;
  user.resetCodeExpiresAt = null;
  await user.save();
  return response.json({ message: "Password updated. You can now log in." });
}
