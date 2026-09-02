function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePorts(value) {
  return new Set(
    String(value || "80,443")
      .split(",")
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((port) => Number.isInteger(port) && port > 0 && port <= 65535)
  );
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export const env = {
  port: parseInteger(process.env.PORT, 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  apiJsonLimit: process.env.API_JSON_LIMIT || "64kb",

  supabaseUrl: process.env.SUPABASE_URL || "",
  supabasePublicKey:
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "",
  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "",

  scannerTimeoutMs: parseInteger(process.env.SCANNER_TIMEOUT_MS, 8000),
  scannerRequestDeadlineMs: parseInteger(process.env.SCANNER_REQUEST_DEADLINE_MS, 12000),
  scannerTotalDeadlineMs: parseInteger(process.env.SCANNER_TOTAL_DEADLINE_MS, 25000),
  scannerMaxConcurrent: parseInteger(process.env.SCANNER_MAX_CONCURRENT, 4),
  scannerQueueTimeoutMs: parseInteger(process.env.SCANNER_QUEUE_TIMEOUT_MS, 5000),
  scannerMaxRedirects: parseInteger(process.env.SCANNER_MAX_REDIRECTS, 3),
  scannerMaxResponseBytes: parseInteger(
    process.env.SCANNER_MAX_RESPONSE_BYTES,
    524288
  ),
  scannerAllowedPorts: parsePorts(process.env.SCANNER_ALLOWED_PORTS),
  scanRateLimitMax: parseInteger(process.env.SCAN_RATE_LIMIT_MAX, 3),
  scanRateLimitWindowMs: parseInteger(
    process.env.SCAN_RATE_LIMIT_WINDOW_MS,
    10 * 60 * 1000
  ),

  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openRouterModel: process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free",
  openRouterTimeoutMs: parseInteger(process.env.OPENROUTER_TIMEOUT_MS, 30000),
  openRouterMaxRetries: parseInteger(process.env.OPENROUTER_MAX_RETRIES, 1),
  openRouterRetryBaseDelayMs: parseInteger(process.env.OPENROUTER_RETRY_BASE_DELAY_MS, 500),
  openRouterRetryMaxDelayMs: parseInteger(process.env.OPENROUTER_RETRY_MAX_DELAY_MS, 3000),
  openRouterFallbackRetryCooldownMs: parseInteger(process.env.OPENROUTER_FALLBACK_RETRY_COOLDOWN_MS, 60000),
  openRouterReferer: process.env.OPENROUTER_HTTP_REFERER || "",
  openRouterTitle: process.env.OPENROUTER_APP_TITLE || "AI Cyber Tracker",
  openRouterTestEnabled: parseBoolean(process.env.OPENROUTER_TEST_ENABLED, false)
};

export function assertSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabasePublicKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY) are required on the server."
    );
  }
}

export function assertSystemSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabaseSecretKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) are required for trusted assessment writes.");
  }
}

export function assertOpenRouterEnv() {
  if (!env.openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is required for the OpenRouter test call.");
  }
}
