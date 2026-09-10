import { env } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";
import { scanHttp } from "./httpScanner.js";
import { scanHeaders } from "./headerScanner.js";
import { scanCookies } from "./cookieScanner.js";
import { scanTls } from "./tlsScanner.js";
import { scanMetadata } from "./metadataScanner.js";
import { normalizeFindings } from "./normalizeFindings.js";
import { buildPrimaryResponseObservations } from "./observationBuilder.js";
import { withScannerSlot } from "./semaphore.js";

async function runScannerCore(rawUrl) {
  const { response, findings: httpFindings, classification } = await scanHttp(rawUrl);
  const [tlsResult, metadataResult] = await Promise.all([
    scanTls(response.finalUrl),
    scanMetadata(response.finalUrl, response.body, { representative: classification.representative })
  ]);
  const findings = normalizeFindings([
    httpFindings,
    scanHeaders(response.headers, response.finalUrl, { representative: classification.representative }),
    scanCookies(response.headers, { representative: classification.representative }),
    tlsResult.findings,
    metadataResult.findings
  ]);
  const observations = [
    ...buildPrimaryResponseObservations(response, classification),
    { kind: "scope", key: "representative_document", status: classification.representative ? "observed" : "inconclusive", source: "response_classifier", details: { reason: classification.reason } },
    { kind: "redirect", key: "redirect_count", status: "observed", source: "redirect_chain", details: { count: response.redirects.length } },
    ...tlsResult.observations,
    ...metadataResult.observations
  ];
  return {
    target: {
      finalProtocol: new URL(response.finalUrl).protocol.replace(":", ""),
      statusCode: response.statusCode,
      redirectCount: response.redirects.length,
      findingCount: findings.length,
      representativeDocument: classification.representative,
      responseClassification: classification.reason
    },
    findings,
    observations
  };
}

export async function runPassiveScanner(rawUrl) {
  // The capacity slot belongs to the underlying scanner work, not the caller's
  // response deadline. If the caller times out first, the work keeps its slot
  // until every bounded network operation settles, preventing hidden
  // over-concurrency after a timeout.
  const scannerWork = withScannerSlot(() => runScannerCore(rawUrl));
  let timer;
  try {
    return await Promise.race([
      scannerWork,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new HttpError(
          504,
          "The overall passive scan exceeded its deadline.",
          "SCANNER_TOTAL_DEADLINE",
          { deadlineMs: env.scannerTotalDeadlineMs }
        )), env.scannerTotalDeadlineMs);
      })
    ]);
  } finally {
    clearTimeout(timer);
    // Avoid an unhandled rejection if the caller's deadline won the race.
    scannerWork.catch(() => {});
  }
}
