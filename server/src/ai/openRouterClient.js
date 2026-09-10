import { assertOpenRouterEnv, env } from "../config/env.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

function parseRetryAfter(value) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOpenRouter({ messages, model, responseFormat }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.openRouterTimeoutMs);
  const headers = { Authorization: `Bearer ${env.openRouterApiKey}`, "Content-Type": "application/json" };
  if (env.openRouterReferer) headers["HTTP-Referer"] = env.openRouterReferer;
  if (env.openRouterTitle) headers["X-Title"] = env.openRouterTitle;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({ model, messages, temperature: 0.2, response_format: responseFormat })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(payload?.error?.message || `OpenRouter request failed with status ${response.status}.`);
      error.status = response.status;
      error.retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
      throw error;
    }
    return { model: payload?.model || model, content: payload?.choices?.[0]?.message?.content || "", usage: payload?.usage || null };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("OpenRouter request timed out.");
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callOpenRouter({ messages, model = env.openRouterModel, responseFormat }) {
  assertOpenRouterEnv();
  let lastError;

  for (let attempt = 0; attempt <= env.openRouterMaxRetries; attempt += 1) {
    try {
      return await requestOpenRouter({ messages, model, responseFormat });
    } catch (error) {
      lastError = error;
      if (!RETRYABLE.has(error.status) || attempt >= env.openRouterMaxRetries) throw error;

      const exponential = Math.min(env.openRouterRetryMaxDelayMs, env.openRouterRetryBaseDelayMs * (2 ** attempt));
      const requestedDelay = error.retryAfterMs ?? exponential;
      // A long provider-imposed wait is better handled by the deterministic
      // fallback than by holding the user's HTTP request open.
      if (requestedDelay > env.openRouterRetryMaxDelayMs) throw error;
      const jitter = Math.floor(Math.random() * Math.min(250, Math.max(1, exponential / 4)));
      await sleep(Math.max(exponential, requestedDelay) + jitter);
    }
  }

  throw lastError;
}
