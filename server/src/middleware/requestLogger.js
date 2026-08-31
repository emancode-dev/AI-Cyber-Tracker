import { randomUUID } from "node:crypto";

function pathnameOnly(req) {
  try {
    return new URL(req.originalUrl, "http://local.invalid").pathname;
  } catch {
    return req.path || "/";
  }
}

export function requestLogger(req, res, next) {
  const started = Date.now();
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    // Deliberately do not log Authorization headers, cookies, request bodies,
    // query strings, scanner evidence, questionnaire answers, or AI payloads.
    console.log(
      JSON.stringify({
        type: "http_request",
        request_id: requestId,
        method: req.method,
        path: pathnameOnly(req),
        status: res.statusCode,
        duration_ms: Date.now() - started
      })
    );
  });

  next();
}
