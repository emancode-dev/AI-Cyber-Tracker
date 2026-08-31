import { HttpError } from "../utils/HttpError.js";

export function notFoundHandler(req, _res, next) {
  const path = req.path || "/";
  next(
    new HttpError(
      404,
      `No API route matches ${req.method} ${path}`,
      "NOT_FOUND"
    )
  );
}

export function errorHandler(error, req, res, _next) {
  let status = error.statusCode || error.status || 500;
  let code = error.code || "INTERNAL_ERROR";
  let message = error.message || "Something went wrong.";
  let details = error.details || null;

  if (error.type === "entity.too.large") {
    status = 413;
    code = "PAYLOAD_TOO_LARGE";
    message = "The request body is too large.";
    details = null;
  }

  if (status >= 500) {
    console.error(
      JSON.stringify({
        type: "server_error",
        request_id: req?.requestId || null,
        name: error.name,
        code,
        message
      })
    );
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message: status >= 500 ? "Something went wrong on the server." : message,
      ...(details ? { details } : {})
    }
  });
}
