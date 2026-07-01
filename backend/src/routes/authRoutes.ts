import { Router } from "express";

import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  loginWithGoogle,
  register,
  resetPassword,
  updateMe,
  verifyEmail,
} from "../controllers/authController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware);

router.post("/register", register);
router.post("/login", login);
router.post("/google", loginWithGoogle);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.route("/me").get(protect, getMe).put(protect, updateMe);
router.post("/change-password", protect, changePassword);

export default router;
