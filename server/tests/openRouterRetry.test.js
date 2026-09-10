import test from "node:test";
import assert from "node:assert/strict";

function fakeResponse(status, payload, retryAfter = null) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === "retry-after" ? retryAfter : null },
    json: async () => payload
  };
}

test("OpenRouter retries one short transient 5xx and then succeeds", async () => {
  process.env.OPENROUTER_API_KEY = "test-key-not-real";
  process.env.OPENROUTER_MAX_RETRIES = "1";
  process.env.OPENROUTER_RETRY_BASE_DELAY_MS = "1";
  process.env.OPENROUTER_RETRY_MAX_DELAY_MS = "10";
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return calls === 1
      ? fakeResponse(503, { error: { message: "temporary" } })
      : fakeResponse(200, { model: "test/model", choices: [{ message: { content: "{}" } }] });
  };
  try {
    const { callOpenRouter } = await import(`../src/ai/openRouterClient.js?retry=${Date.now()}`);
    const result = await callOpenRouter({ messages: [], responseFormat: { type: "json_object" } });
    assert.equal(calls, 2);
    assert.equal(result.model, "test/model");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OpenRouter does not hold the request open for a long Retry-After", async () => {
  process.env.OPENROUTER_API_KEY = "test-key-not-real";
  process.env.OPENROUTER_MAX_RETRIES = "1";
  process.env.OPENROUTER_RETRY_BASE_DELAY_MS = "1";
  process.env.OPENROUTER_RETRY_MAX_DELAY_MS = "10";
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return fakeResponse(429, { error: { message: "limited" } }, "60");
  };
  try {
    const { callOpenRouter } = await import(`../src/ai/openRouterClient.js?limit=${Date.now()}`);
    await assert.rejects(() => callOpenRouter({ messages: [], responseFormat: { type: "json_object" } }), /limited/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
