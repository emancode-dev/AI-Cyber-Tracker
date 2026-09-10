import express from "express";
import {
  assertSupabaseEnv,
  assertSystemSupabaseEnv
} from "./server/src/config/env.js";
import { createApp } from "./server/src/createApp.js";

// Vercel invokes the exported Express application as a Node.js Function. Keep
// the local listener in server/src/app.js so local development and production
// hosting have separate, unambiguous entry points.
assertSupabaseEnv();
assertSystemSupabaseEnv();

const app = createApp();

// Keep the framework import in this entrypoint so Vercel's Express detector can
// identify it without having to infer dependencies across the server tree.
void express;

export default app;
