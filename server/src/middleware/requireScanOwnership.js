import { HttpError } from "../utils/HttpError.js";

export async function requireScanOwnership(req, _res, next) {
  const scanId = req.params.scanId || req.params.id;

  const { data: scan, error: scanError } = await req.supabase
    .from("scans")
    .select("id,website_id,status")
    .eq("id", scanId)
    .maybeSingle();

  if (scanError) {
    return next(
      new HttpError(
        500,
        "Could not verify scan ownership.",
        "OWNERSHIP_CHECK_FAILED"
      )
    );
  }

  if (!scan) {
    return next(new HttpError(404, "Scan not found.", "SCAN_NOT_FOUND"));
  }

  const { data: website, error: websiteError } = await req.supabase
    .from("websites")
    .select("id,user_id,name,url")
    .eq("id", scan.website_id)
    .maybeSingle();

  if (websiteError) {
    return next(
      new HttpError(
        500,
        "Could not verify scan ownership.",
        "OWNERSHIP_CHECK_FAILED"
      )
    );
  }

  if (!website || website.user_id !== req.user.id) {
    return next(
      new HttpError(
        403,
        "You do not have permission to access this scan.",
        "FORBIDDEN"
      )
    );
  }

  req.ownedScan = scan;
  req.ownedScanWebsite = website;
  next();
}
