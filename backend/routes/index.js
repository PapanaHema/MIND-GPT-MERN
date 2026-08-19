import { Router } from "express";
import authRoutes from "./authRoutes.js";
import chatRoutes from "./chatRoutes.js";
import healthRoutes from "./healthRoutes.js";

const router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
export default router;
