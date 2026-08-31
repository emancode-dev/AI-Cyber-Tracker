import { assertOpenRouterEnv, env } from "../config/env.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

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
      throw error;
    }
    return { model: payload?.model || model, content: payload?.choices?.[0]?.message?.content || "", usage: payload?.usage || null };
  } catch (error) {
    if (error.name === "AbortError") throw new Error("OpenRouter request timed out.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callOpenRouter({ messages, model = env.openRouterModel, responseFormat }) {
  assertOpenRouterEnv();
  try {
    return await requestOpenRouter({ messages, model, responseFormat });
  } catch (error) {
    if (!RETRYABLE.has(error.status)) throw error;
    return requestOpenRouter({ messages, model, responseFormat });
  }
}
