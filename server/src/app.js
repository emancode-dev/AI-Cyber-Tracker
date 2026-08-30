import express from "express";
import { env } from "./config/env.js";
import websiteRoutes from "./routes/websiteRoutes.js";
import { meController } from "./controllers/meController.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { corsMiddleware } from "./middleware/cors.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { asyncHandler } from "./utils/asyncHandler.js";

const app = express();
app.disable("x-powered-by");
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "ai-cyber-tracker-api", supabaseConfigured: Boolean(env.supabaseUrl && env.supabasePublicKey) } }));
app.get("/api/me", asyncHandler(requireAuth), asyncHandler(meController));
app.use("/api/websites", websiteRoutes);

// The public POST /api/websites/:id/scans route is intentionally NOT exposed until Day 21,
// when rate limits, scan authorization wording, request limits, and persistence are added.
app.use(notFoundHandler);
app.use(errorHandler);
app.listen(env.port, () => console.log(JSON.stringify({ type: "server_started", port: env.port, client_origin: env.clientOrigin })));
