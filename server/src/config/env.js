function parseInteger(value, fallback) { const parsed = Number.parseInt(value, 10); return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback; }
function parsePorts(value) { return new Set(String(value || "80,443").split(",").map((item) => Number.parseInt(item.trim(), 10)).filter((port) => Number.isInteger(port) && port > 0 && port <= 65535)); }
export const env = {
  port: parseInteger(process.env.PORT, 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabasePublicKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "",
  scannerTimeoutMs: parseInteger(process.env.SCANNER_TIMEOUT_MS, 8000),
  scannerMaxRedirects: parseInteger(process.env.SCANNER_MAX_REDIRECTS, 3),
  scannerMaxResponseBytes: parseInteger(process.env.SCANNER_MAX_RESPONSE_BYTES, 524288),
  scannerAllowedPorts: parsePorts(process.env.SCANNER_ALLOWED_PORTS)
};
export function assertSupabaseEnv() { if (!env.supabaseUrl || !env.supabasePublicKey) throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY) are required on the server."); }
