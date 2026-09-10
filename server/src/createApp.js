import express from "express";
import websiteRoutes from "./routes/websiteRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import { env } from "./config/env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json({ limit: env.apiJsonLimit }));

  app.get("/api/health", (_req, res) => res.json({
    success: true,
    data: { status: "ok", service: "ai-cyber-tracker-api" }
  }));

  app.use("/api/me", meRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/websites", websiteRoutes);
  app.use("/api/scans", scanRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
