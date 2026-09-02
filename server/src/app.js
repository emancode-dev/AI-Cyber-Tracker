import { assertSupabaseEnv, assertSystemSupabaseEnv, env } from "./config/env.js";
import { createApp } from "./createApp.js";

// The API cannot provide a coherent protected workflow without both the public
// project coordinates (for user-scoped RLS reads) and the backend-only secret
// writer (for trusted assessment state). Fail at startup instead of advertising
// a healthy server that will fail on the first real request.
assertSupabaseEnv();
assertSystemSupabaseEnv();

const app = createApp();

app.listen(env.port, () => {
  console.log(JSON.stringify({
    type: "server_started",
    port: env.port,
    client_origin: env.clientOrigin,
    api_json_limit: env.apiJsonLimit
  }));
});
