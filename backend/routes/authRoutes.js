import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  login,
  removeProfilePicture,
  resetPassword,
  signup,
  updateProfilePicture,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getCurrentUser));
router.put("/profile-picture", authenticate, asyncHandler(updateProfilePicture));
router.delete("/profile-picture", authenticate, asyncHandler(removeProfilePicture));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
export default router;
