import { Router } from "express";

import { getOwnerSearchResults } from "../controllers/ownerSearchController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("owner"));

router.get("/", getOwnerSearchResults);

export default router;
