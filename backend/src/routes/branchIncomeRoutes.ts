import { Router } from "express";

import {
  createBranchIncome,
  deleteBranchIncome,
  getBranchIncomeById,
  getBranchIncomes,
  updateBranchIncome,
} from "../controllers/branchIncomeController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("admin", "owner"));

router.route("/").get(getBranchIncomes).post(createBranchIncome);
router
  .route("/:id")
  .get(getBranchIncomeById)
  .put(updateBranchIncome)
  .delete(deleteBranchIncome);

export default router;
