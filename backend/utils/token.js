import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture || null,
});

export const createToken = (user) => jwt.sign({
  id: user.id,
  name: user.name,
  email: user.email,
}, env.jwtSecret, {
  expiresIn: "7d",
});

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
