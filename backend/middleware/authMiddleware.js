import { verifyToken } from "../utils/token.js";

export function authenticate(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return response.status(401).json({ error: "Please log in to continue." });
  }
  try {
    request.user = verifyToken(token);
    return next();
  } catch {
    return response.status(401).json({
      error: "Your session has expired. Please log in again.",
    });
  }
}
