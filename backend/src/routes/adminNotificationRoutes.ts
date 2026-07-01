import { Router } from "express";

import { getAdminNotificationSummary } from "../controllers/adminNotificationController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("admin", "owner"));

router.get("/summary", getAdminNotificationSummary);

export default router;
