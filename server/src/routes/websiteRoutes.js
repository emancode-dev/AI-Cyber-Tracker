import { Router } from "express";
import {
  createWebsiteController,
  deleteWebsiteController,
  getWebsiteController,
  getWebsiteHistoryController,
  getWebsiteFindingHistoryController,
  listWebsitesController,
  updateWebsiteController
} from "../controllers/websiteController.js";
import { startScanController } from "../controllers/scanController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireWebsiteOwnership } from "../middleware/requireOwnership.js";
import { scanRateLimit } from "../middleware/rateLimit.js";
import { requireTrustedWriter } from "../middleware/requireTrustedWriter.js";
import {
  validateScanStartBody,
  validateWebsiteBody,
  validateWebsitePatch
} from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(listWebsitesController));
router.get(
  "/:id",
  asyncHandler(requireWebsiteOwnership),
  asyncHandler(getWebsiteController)
);
router.get("/:id/history", asyncHandler(requireWebsiteOwnership), asyncHandler(getWebsiteHistoryController));
router.get("/:id/finding-history", asyncHandler(requireWebsiteOwnership), asyncHandler(getWebsiteFindingHistoryController));
router.post("/", validateWebsiteBody, requireTrustedWriter, asyncHandler(createWebsiteController));
router.patch(
  "/:id",
  asyncHandler(requireWebsiteOwnership),
  validateWebsitePatch,
  asyncHandler(updateWebsiteController)
);
router.delete(
  "/:id",
  asyncHandler(requireWebsiteOwnership),
  asyncHandler(deleteWebsiteController)
);
router.post(
  "/:id/scans",
  asyncHandler(requireWebsiteOwnership),
  validateScanStartBody,
  requireTrustedWriter,
  asyncHandler(scanRateLimit),
  asyncHandler(startScanController)
);

export default router;
