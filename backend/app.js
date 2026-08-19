import express from "express";
import apiRoutes from "./routes/index.js";
import { corsMiddleware } from "./middleware/corsMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const app = express();
app.disable("x-powered-by");
app.use(corsMiddleware);
app.use(express.json({ limit: "22mb" }));
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
