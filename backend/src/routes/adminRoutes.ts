import { Router } from "express";

import { getAdminDashboardConfigData } from "../controllers/adminController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("admin", "owner"));

router.get("/dashboard-config", getAdminDashboardConfigData);

export default router;
