import { runPassiveScanner } from "../scanner/scannerRunner.js";
import { commitScanResults, getScan, insertScan, listFindings, listObservations, patchScan } from "../repositories/scanRepository.js";
import { HttpError } from "../utils/HttpError.js";

function publicScannerError(error) {
  if (error instanceof HttpError && error.statusCode < 500) return error.message;
  return "The passive scan could not be completed.";
}

function scanResponse(scan, result) {
  return {
    scan: {
      ...scan,
      status: "waiting_for_answers",
      target_summary: result.target,
      error_message: null
    },
    target: result.target,
    findings: result.findings
  };
}

export async function startScan(readClient, writeClient, website) {
  if (!website.authorization_confirmed) {
    throw new HttpError(403, "This website does not have an active authorization confirmation.", "WEBSITE_NOT_AUTHORIZED");
  }

  const scan = await insertScan(writeClient, website.id, "scanning");
  let scannerFinished = false;
  let result = null;

  try {
    result = await runPassiveScanner(website.url);
    scannerFinished = true;
    const committed = await commitScanResults(writeClient, scan.id, result);
    return scanResponse(committed || scan, result);
  } catch (error) {
    // Once the scanner has produced a complete result, an RPC/network failure may
    // have an ambiguous commit outcome. Re-read before ever marking the scan as
    // failed; if that read also fails, leave recovery to the stale-scan cron job.
    if (scannerFinished) {
      try {
        const current = await getScan(readClient, scan.id);
        if (current?.status === "waiting_for_answers") {
          return scanResponse(current, result);
        }
        if (current?.status === "scanning") {
          await patchScan(writeClient, scan.id, {
            status: "failed",
            error_message: publicScannerError(error),
            completed_at: new Date().toISOString()
          });
        }
      } catch {
        // Preserve the unknown commit state. Scheduled recovery will close a
        // genuinely stale scan without risking corruption of a committed result.
      }
    } else {
      try {
        await patchScan(writeClient, scan.id, {
          status: "failed",
          error_message: publicScannerError(error),
          completed_at: new Date().toISOString()
        });
      } catch {
        // Recovery job handles an unreachable database after scanner failure.
      }
    }
    throw error;
  }
}

export async function readScan(supabase, scanId) {
  const scan = await getScan(supabase, scanId);
  if (!scan) throw new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND");
  const [findings, observations] = await Promise.all([
    listFindings(supabase, scanId),
    listObservations(supabase, scanId)
  ]);
  return { scan, findings, observations };
}
