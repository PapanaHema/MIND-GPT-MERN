import { Router } from "express";
import { sendChat } from "../controllers/chatController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/", authenticate, asyncHandler(sendChat));
export default router;
