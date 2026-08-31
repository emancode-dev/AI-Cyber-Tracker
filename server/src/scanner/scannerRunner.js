import { scanHttp } from "./httpScanner.js";
import { scanHeaders } from "./headerScanner.js";
import { scanCookies } from "./cookieScanner.js";
import { scanTls } from "./tlsScanner.js";
import { scanMetadata } from "./metadataScanner.js";
import { normalizeFindings } from "./normalizeFindings.js";

export async function runPassiveScanner(rawUrl) {
  const { response, findings: httpFindings } = await scanHttp(rawUrl);
  const [tlsFindings, metadataFindings] = await Promise.all([
    scanTls(response.finalUrl),
    scanMetadata(response.finalUrl, response.body)
  ]);
  const findings = normalizeFindings([
    httpFindings,
    scanHeaders(response.headers, response.finalUrl),
    scanCookies(response.headers),
    tlsFindings,
    metadataFindings
  ]);

  return {
    target: {
      initialUrl: response.initialUrl,
      finalUrl: response.finalUrl,
      statusCode: response.statusCode,
      redirectCount: response.redirects.length
    },
    findings
  };
}
