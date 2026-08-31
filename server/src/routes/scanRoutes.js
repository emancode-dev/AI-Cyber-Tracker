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
  asyncHandler(submitAnswersController)
);
router.post(
  "/:id/analyze",
  asyncHandler(requireScanOwnership),
  asyncHandler(analyzeScanController)
);
router.get("/:id/report", asyncHandler(requireScanOwnership), asyncHandler(getReportController));
router.post("/:id/report", asyncHandler(requireScanOwnership), asyncHandler(generateReportController));
router.delete("/:id/data", asyncHandler(requireScanOwnership), asyncHandler(deleteAssessmentController));

export default router;
