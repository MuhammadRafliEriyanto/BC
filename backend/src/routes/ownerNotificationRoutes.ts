import { Router } from "express";

import { getOwnerNotificationSummary } from "../controllers/ownerNotificationController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("owner"));

router.get("/summary", getOwnerNotificationSummary);

export default router;
