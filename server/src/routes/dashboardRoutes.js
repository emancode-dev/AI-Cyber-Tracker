import { Router } from "express";
import { dashboardSummaryController } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth));
router.get("/summary", asyncHandler(dashboardSummaryController));

export default router;
