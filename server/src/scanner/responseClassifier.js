const HTML_TYPES = ["text/html", "application/xhtml+xml"];
const CHALLENGE_PATTERNS = [
  /just a moment\.\.\./i,
  /checking your browser/i,
  /cf-chl-/i,
  /cloudflare ray id/i,
  /attention required! \| cloudflare/i,
  /enable javascript and cookies to continue/i
];

export function classifyPrimaryResponse(response) {
  const statusCode = Number(response?.statusCode || 0);
  const contentType = String(response?.headers?.["content-type"] || "").toLowerCase();
  const body = String(response?.body || "");
  const isHtml = HTML_TYPES.some((type) => contentType.includes(type)) || (!contentType && /<!doctype html|<html\b/i.test(body));
  const challengeLike = CHALLENGE_PATTERNS.some((pattern) => pattern.test(body.slice(0, 200000)));

  if (statusCode >= 300 && statusCode < 400) return { representative: false, reason: "unresolved_redirect", isHtml, challengeLike };
  if (statusCode === 401 || statusCode === 403 || statusCode === 429 || statusCode >= 500) return { representative: false, reason: "error_or_access_response", isHtml, challengeLike };
  if (challengeLike) return { representative: false, reason: "challenge_page", isHtml, challengeLike };
  if (!isHtml) return { representative: false, reason: "non_html_response", isHtml, challengeLike };
  if (statusCode < 200 || statusCode >= 300) return { representative: false, reason: "non_success_response", isHtml, challengeLike };
  return { representative: true, reason: "representative_html", isHtml: true, challengeLike: false };
}
