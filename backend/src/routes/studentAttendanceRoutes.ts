import { Router } from "express";

import { getMyAttendanceHistory } from "../controllers/studentAttendanceController";
import { scanStudentAttendanceByQr } from "../controllers/teacherAttendanceController";
import apiKeyMiddleware from "../middleware/apiKeyMiddleware";
import authorizeRole from "../middleware/authorizeRole";
import protect from "../middleware/protect";

const router = Router();

router.use(apiKeyMiddleware, protect, authorizeRole("siswa"));

router.get("/me/attendance", getMyAttendanceHistory);
router.post("/me/attendance/scan", scanStudentAttendanceByQr);

export default router;
