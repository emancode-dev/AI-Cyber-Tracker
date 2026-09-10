import { HttpError } from "../utils/HttpError.js";

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateWebsiteBody(req, _res, next) {
  const { name, url, authorizationConfirmed } = req.body || {};
  const details = {};

  if (typeof name !== "string" || !name.trim()) {
    details.name = "Website name is required.";
  }

  if (typeof url !== "string" || !isHttpUrl(url.trim())) {
    details.url = "Enter a complete http:// or https:// URL.";
  }

  if (authorizationConfirmed !== true) {
    details.authorizationConfirmed =
      "Explicit ownership/authorization confirmation is required.";
  }

  if (Object.keys(details).length) {
    return next(
      new HttpError(
        400,
        "Website data is invalid.",
        "VALIDATION_ERROR",
        details
      )
    );
  }

  next();
}

export function validateWebsitePatch(req, _res, next) {
  const { name, url } = req.body || {};
  const details = {};

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    details.name = "Website name cannot be empty.";
  }

  if (url !== undefined && (typeof url !== "string" || !isHttpUrl(url.trim()))) {
    details.url = "Enter a complete http:// or https:// URL.";
  }

  if (Object.keys(details).length) {
    return next(
      new HttpError(
        400,
        "Website update is invalid.",
        "VALIDATION_ERROR",
        details
      )
    );
  }

  next();
}

export function validateScanStartBody(req, _res, next) {
  if (req.body?.authorizationConfirmed !== true) {
    return next(
      new HttpError(
        400,
        "Confirm that you own this website or have explicit permission to assess it before starting a scan.",
        "SCAN_AUTHORIZATION_REQUIRED"
      )
    );
  }
  next();
}

export function validateAnswerSubmission(req, _res, next) {
  const answers = req.body?.answers;
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 25) {
    return next(
      new HttpError(
        400,
        "Submit between 1 and 25 questionnaire answers.",
        "VALIDATION_ERROR"
      )
    );
  }

  for (const answer of answers) {
    if (!answer || typeof answer.code !== "string" || !("value" in answer)) {
      return next(
        new HttpError(
          400,
          "Each answer must include a question code and value.",
          "VALIDATION_ERROR"
        )
      );
    }
  }

  next();
}

export function validateProfilePatch(req, _res, next) {
  const { name, avatarUrl } = req.body || {};
  const details = {};
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)) {
    details.name = "Name must be between 2 and 80 characters.";
  }
  if (avatarUrl !== undefined && avatarUrl !== null) {
    try {
      const parsed = new URL(avatarUrl);
      if (parsed.protocol !== "https:") details.avatarUrl = "Avatar URL must use HTTPS.";
    } catch {
      details.avatarUrl = "Avatar URL is invalid.";
    }
  }
  if (name === undefined && avatarUrl === undefined) details.profile = "Provide a name or avatar update.";
  if (Object.keys(details).length) {
    return next(new HttpError(400, "Profile update is invalid.", "VALIDATION_ERROR", details));
  }
  next();
}
