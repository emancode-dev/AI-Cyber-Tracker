import { Router } from "express";
import {
  analyzeScanController,
  deleteAssessmentController,
  generateReportController,
  getReportController,
  getQuestionsController,
  getScanController,
  submitAnswersController
} from "../controllers/scanController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireScanOwnership } from "../middleware/requireScanOwnership.js";
import { validateAnswerSubmission } from "../middleware/validateRequest.js";
import { requireTrustedWriter } from "../middleware/requireTrustedWriter.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth));
router.get("/:id", asyncHandler(requireScanOwnership), asyncHandler(getScanController));
router.get(
  "/:id/questions",
  asyncHandler(requireScanOwnership),
  asyncHandler(getQuestionsController)
);
router.post(
  "/:id/answers",
  asyncHandler(requireScanOwnership),
  validateAnswerSubmission,
  requireTrustedWriter,
  asyncHandler(submitAnswersController)
);
router.post(
  "/:id/analyze",
  asyncHandler(requireScanOwnership),
  requireTrustedWriter,
  asyncHandler(analyzeScanController)
);
router.get("/:id/report", asyncHandler(requireScanOwnership), asyncHandler(getReportController));
router.post("/:id/report", asyncHandler(requireScanOwnership), requireTrustedWriter, asyncHandler(generateReportController));
router.delete("/:id/data", asyncHandler(requireScanOwnership), requireTrustedWriter, asyncHandler(deleteAssessmentController));

export default router;
