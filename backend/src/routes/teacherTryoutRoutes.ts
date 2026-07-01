import { Router } from "express";

import {
  createMyTeacherTryoutQuestion,
  createMyTeacherTryout,
  deleteMyTeacherTryoutQuestion,
  deleteMyTeacherTryout,
  getMyTeacherTryoutQuestions,
  getMyTeacherTryoutDetail,
  getMyTeacherTryoutResults,
  getMyTeacherTryouts,
  uploadMyTeacherTryoutQuestionsFromXlsx,
  updateMyTeacherTryoutQuestion,
  updateMyTeacherTryout,
} from "../controllers/teacherTryoutController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("guru"));

router.route("/me/tryouts").get(getMyTeacherTryouts).post(createMyTeacherTryout);
router
  .route("/me/tryouts/:tryoutId")
  .get(getMyTeacherTryoutDetail)
  .patch(updateMyTeacherTryout)
  .delete(deleteMyTeacherTryout);
router
  .route("/me/tryouts/:tryoutId/questions")
  .get(getMyTeacherTryoutQuestions)
  .post(createMyTeacherTryoutQuestion);
router.post(
  "/me/tryouts/:tryoutId/questions/xlsx",
  uploadMyTeacherTryoutQuestionsFromXlsx,
);
router.get("/me/tryouts/:tryoutId/results", getMyTeacherTryoutResults);
router
  .route("/me/tryouts/:tryoutId/questions/:questionId")
  .patch(updateMyTeacherTryoutQuestion)
  .delete(deleteMyTeacherTryoutQuestion);

export default router;
