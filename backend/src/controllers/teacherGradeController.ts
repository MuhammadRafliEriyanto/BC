import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import { AcademicGrade } from "../models/AcademicGrade";
import { ClassTask } from "../models/ClassTask";
import { TaskGrade } from "../models/TaskGrade";
import asyncHandler from "../utils/asyncHandler";
import { AppError, sendSuccess } from "../utils/apiResponse";
import {
  getTeacherClassTaskGrades,
  normalizeTaskGradeStatus,
  normalizeText,
  syncTeacherTaskMetrics,
  toPublicTaskGrade,
} from "../utils/classroomLearning";
import { getNextPublicId } from "../utils/publicId";
import {
  getAcademicGradeScheme,
  getCurrentAcademicPeriod,
  toPublicAcademicGrade,
} from "../utils/academicGrade";
import { resolveTeacherClassDetailContext } from "./teacherScheduleController";

type UpsertTaskGradeBody = {
  taskId?: string;
  studentId?: string;
  score?: number | string;
  note?: string;
  status?: string;
};

function normalizeScore(value: number | string | undefined) {
  const parsedValue =
    typeof value === "number" ? value : Number.parseFloat(normalizeText(value));

  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 100) {
    return null;
  }

  return Math.round(parsedValue);
}

async function findTeacherTaskByParam(
  taskId: string,
  classId: string,
  teacherId: string,
) {
  return ClassTask.findOne({
    classId,
    teacherId,
    $or: [
      { taskId },
      ...(Types.ObjectId.isValid(taskId) ? [{ _id: taskId }] : []),
    ],
  }).exec();
}

async function findTeacherGradeByParam(
  gradeId: string,
  classId: string,
  teacherId: string,
) {
  return TaskGrade.findOne({
    classId,
    teacherId,
    $or: [
      { gradeId },
      ...(Types.ObjectId.isValid(gradeId) ? [{ _id: gradeId }] : []),
    ],
  }).exec();
}

export const getTeacherClassGrades = asyncHandler(
  async (
    req: Request<{ classId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      next(new AppError(401, "User belum terautentikasi."));
      return;
    }

    const { teacher, classGroup } = await resolveTeacherClassDetailContext(
      req.user._id.toString(),
      req.params.classId,
    );
    const { academicYear, semester } = req.query;

    const academicGradeQuery: any = {
      teacherId: teacher._id,
      classId: classGroup.item.id,
    };

    if (academicYear) academicGradeQuery.academicYear = String(academicYear);
    if (semester) academicGradeQuery.semester = String(semester);

    const [grades, academicGrades] = await Promise.all([
      getTeacherClassTaskGrades(
        teacher._id.toString(),
        classGroup.item.id,
      ),
      AcademicGrade.find(academicGradeQuery)
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean()
        .exec(),
    ]);

    const period = getCurrentAcademicPeriod();
    sendSuccess(res, {
      message: "Data nilai kelas berhasil diambil.",
      data: {
        grades: grades.map(toPublicTaskGrade),
        academicGrades: academicGrades.map(toPublicAcademicGrade),
        scheme: getAcademicGradeScheme(classGroup.className),
        period,
      },
    });
  },
);

export const createTeacherClassGrade = asyncHandler(
  async (
    req: Request<{ classId: string }, Record<string, never>, UpsertTaskGradeBody>,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      next(new AppError(401, "User belum terautentikasi."));
      return;
    }

    const { teacher, classGroup, participants } =
      await resolveTeacherClassDetailContext(
        req.user._id.toString(),
        req.params.classId,
      );
    const taskParam = normalizeText(req.body.taskId);
    const studentId = normalizeText(req.body.studentId);
    const score = normalizeScore(req.body.score);
    const note = normalizeText(req.body.note);
    const status =
      normalizeTaskGradeStatus(req.body.status) ?? "Sudah Dinilai";

    if (!taskParam) {
      next(new AppError(400, "Task ID wajib dikirim."));
      return;
    }

    if (!studentId) {
      next(new AppError(400, "Student ID wajib dikirim."));
      return;
    }

    if (score === null) {
      next(new AppError(400, "Nilai tugas wajib berupa angka 0 sampai 100."));
      return;
    }

    const task = await findTeacherTaskByParam(
      taskParam,
      classGroup.item.id,
      teacher._id.toString(),
    );

    if (!task) {
      next(new AppError(404, "Tugas kelas tidak ditemukan."));
      return;
    }

    const isParticipantInClass = participants.some(
      (participant) =>
        normalizeText(participant.studentId).toLowerCase() ===
        studentId.toLowerCase(),
    );

    if (!isParticipantInClass) {
      next(new AppError(404, "Siswa kelas untuk penilaian tidak ditemukan."));
      return;
    }

    const normalizedTaskId = normalizeText(task.taskId);
    const existingGrade = await TaskGrade.findOne({
      teacherId: teacher._id,
      classId: classGroup.item.id,
      taskId: normalizedTaskId,
      studentId,
    }).exec();

    if (existingGrade) {
      next(
        new AppError(
          409,
          "Nilai tugas siswa untuk tugas ini sudah ada. Gunakan update nilai.",
        ),
      );
      return;
    }

    const gradeId = await getNextPublicId(TaskGrade, "gradeId", "GRD");
    const grade = await TaskGrade.create({
      gradeId,
      teacherId: teacher._id,
      classId: classGroup.item.id,
      taskId: normalizedTaskId,
      studentId,
      score,
      note,
      status,
      gradedAt: status === "Sudah Dinilai" ? new Date() : null,
    });

    await syncTeacherTaskMetrics(
      teacher._id.toString(),
      classGroup.item.id,
      normalizedTaskId,
    );

    sendSuccess(res, {
      statusCode: 201,
      message: "Nilai tugas siswa berhasil disimpan.",
      data: {
        grade: toPublicTaskGrade(grade),
      },
    });
  },
);

export const updateTeacherClassGrade = asyncHandler(
  async (
    req: Request<
      { classId: string; gradeId: string },
      Record<string, never>,
      UpsertTaskGradeBody
    >,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      next(new AppError(401, "User belum terautentikasi."));
      return;
    }

    const { teacher, classGroup, participants } =
      await resolveTeacherClassDetailContext(
        req.user._id.toString(),
        req.params.classId,
      );
    const gradeParam = normalizeText(req.params.gradeId);

    if (!gradeParam) {
      next(new AppError(404, "Nilai tugas siswa tidak ditemukan."));
      return;
    }

    const grade = await findTeacherGradeByParam(
      gradeParam,
      classGroup.item.id,
      teacher._id.toString(),
    );

    if (!grade) {
      next(new AppError(404, "Nilai tugas siswa tidak ditemukan."));
      return;
    }

    const nextTaskParam = normalizeText(req.body.taskId) || grade.taskId;
    const nextStudentId = normalizeText(req.body.studentId) || grade.studentId;
    const score =
      req.body.score === undefined ? grade.score : normalizeScore(req.body.score);
    const note =
      req.body.note === undefined ? normalizeText(grade.note) : normalizeText(req.body.note);
    const status =
      req.body.status === undefined
        ? grade.status
        : normalizeTaskGradeStatus(req.body.status);

    if (!nextTaskParam) {
      next(new AppError(400, "Task ID wajib dikirim."));
      return;
    }

    if (!nextStudentId) {
      next(new AppError(400, "Student ID wajib dikirim."));
      return;
    }

    if (score === null) {
      next(new AppError(400, "Nilai tugas wajib berupa angka 0 sampai 100."));
      return;
    }

    if (!status) {
      next(new AppError(400, "Status penilaian tugas tidak valid."));
      return;
    }

    const nextTask = await findTeacherTaskByParam(
      nextTaskParam,
      classGroup.item.id,
      teacher._id.toString(),
    );

    if (!nextTask) {
      next(new AppError(404, "Tugas kelas tidak ditemukan."));
      return;
    }

    const isParticipantInClass = participants.some(
      (participant) =>
        normalizeText(participant.studentId).toLowerCase() ===
        nextStudentId.toLowerCase(),
    );

    if (!isParticipantInClass) {
      next(new AppError(404, "Siswa kelas untuk penilaian tidak ditemukan."));
      return;
    }

    const normalizedTaskId = normalizeText(nextTask.taskId);
    const previousTaskId = normalizeText(grade.taskId);

    const duplicateGrade = await TaskGrade.findOne({
      teacherId: teacher._id,
      classId: classGroup.item.id,
      taskId: normalizedTaskId,
      studentId: nextStudentId,
      _id: {
        $ne: grade._id,
      },
    }).exec();

    if (duplicateGrade) {
      next(
        new AppError(
          409,
          "Nilai untuk siswa dan tugas yang dipilih sudah tersimpan.",
        ),
      );
      return;
    }

    grade.taskId = normalizedTaskId;
    grade.studentId = nextStudentId;
    grade.score = score;
    grade.note = note;
    grade.status = status;
    grade.gradedAt = status === "Sudah Dinilai" ? new Date() : null;
    await grade.save();

    await syncTeacherTaskMetrics(
      teacher._id.toString(),
      classGroup.item.id,
      normalizedTaskId,
    );

    if (previousTaskId && previousTaskId !== normalizedTaskId) {
      await syncTeacherTaskMetrics(
        teacher._id.toString(),
        classGroup.item.id,
        previousTaskId,
      );
    }

    sendSuccess(res, {
      message: "Nilai tugas siswa berhasil diperbarui.",
      data: {
        grade: toPublicTaskGrade(grade),
      },
    });
  },
);
