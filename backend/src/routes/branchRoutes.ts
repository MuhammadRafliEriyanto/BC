import { Router } from "express";

import {
  createBranch,
  createBranchAdminAccount,
  deleteBranchAdminAccount,
  deleteBranch,
  getBranchAdminAccounts,
  getBranchAdminOptions,
  getBranchById,
  getBranches,
  getPublicBranchOptions,
  resendBranchAdminVerification,
  updateBranchAdminAccount,
  updateBranch,
} from "../controllers/branchController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.get("/public-options", apiKeyMiddleware, getPublicBranchOptions);

router.use(apiKeyMiddleware, protect, authorizeRole("admin", "owner"));

router.get("/admin-options", getBranchAdminOptions);
router.route("/admin-accounts").get(getBranchAdminAccounts).post(createBranchAdminAccount);
router
  .route("/admin-accounts/:id")
  .put(updateBranchAdminAccount)
  .delete(deleteBranchAdminAccount);
router.post("/admin-accounts/:id/resend-verification", resendBranchAdminVerification);
router.route("/").get(getBranches).post(createBranch);
router.route("/:id").get(getBranchById).put(updateBranch).delete(deleteBranch);

export default router;
