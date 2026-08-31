import { Router } from "express";
import { meController, updateMeController } from "../controllers/meController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateProfilePatch } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(asyncHandler(requireAuth));
router.get("/", asyncHandler(meController));
router.patch("/", validateProfilePatch, asyncHandler(updateMeController));

export default router;
