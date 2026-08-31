import { runPassiveScanner } from "../scanner/scannerRunner.js";
import {
  getScan,
  insertFindings,
  insertScan,
  listFindings,
  patchScan
} from "../repositories/scanRepository.js";
import { HttpError } from "../utils/HttpError.js";

function publicScannerError(error) {
  if (error instanceof HttpError && error.statusCode < 500) {
    return error.message;
  }
  return "The passive scan could not be completed.";
}

export async function startScan(supabase, website) {
  if (!website.authorization_confirmed) {
    throw new HttpError(
      403,
      "This website does not have an active authorization confirmation.",
      "WEBSITE_NOT_AUTHORIZED"
    );
  }

  const scan = await insertScan(supabase, website.id, "scanning");

  try {
    const result = await runPassiveScanner(website.url);
    const findings = await insertFindings(supabase, scan.id, result.findings);
    const updated = await patchScan(supabase, scan.id, {
      status: "waiting_for_answers",
      error_message: null
    });

    return {
      scan: updated,
      target: result.target,
      findings
    };
  } catch (error) {
    await patchScan(supabase, scan.id, {
      status: "failed",
      error_message: publicScannerError(error),
      completed_at: new Date().toISOString()
    });
    throw error;
  }
}

export async function readScan(supabase, scanId) {
  const scan = await getScan(supabase, scanId);
  if (!scan) {
    throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  }
  const findings = await listFindings(supabase, scanId);
  return { scan, findings };
}
