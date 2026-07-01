import mongoose, { Types } from "mongoose";

import "../config/env";
import { AttendanceSession } from "../models/AttendanceSession";
import { Branch } from "../models/Branch";
import { ClassTask } from "../models/ClassTask";
import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import {
  ADMIN_SCHEDULE_DAY_OPTIONS,
  ADMIN_SCHEDULE_TIME_SLOT_OPTIONS,
} from "../utils/adminDashboardConfig";
import { normalizeCanonicalClassName } from "../utils/studentClass";

type ScriptOptions = {
  apply: boolean;
  fillEmptyBranch: string;
};

type ScheduleLean = {
  scheduleId: string;
  day: string;
  time: string;
  className: string;
  teacherId:
    | Types.ObjectId
    | {
        _id?: Types.ObjectId;
        teacherId?: string;
        branch?: string;
      }
    | null;
};

const scheduleDayOrderMap = new Map(
  ADMIN_SCHEDULE_DAY_OPTIONS.map((day, index) => [day.toLowerCase(), index]),
);
const scheduleTimeOrderMap = new Map(
  ADMIN_SCHEDULE_TIME_SLOT_OPTIONS.map((time, index) => [time.toLowerCase(), index]),
);

function parseOptions(argv: string[]): ScriptOptions {
  const fillEmptyBranchArgument = argv.find((argument) =>
    argument.startsWith("--fill-empty-branch="),
  );

  return {
    apply: argv.includes("--apply"),
    fillEmptyBranch: normalizeText(fillEmptyBranchArgument?.split("=")[1]),
  };
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function slugify(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildStableClassId(teacherPublicId: string, branch: string, className: string) {
  return `class-${slugify(teacherPublicId) || "guru"}-${
    slugify(branch) || "cabang"
  }-${slugify(className) || "kelas"}`;
}

function getTeacherObjectId(schedule: ScheduleLean): string {
  const teacherId = schedule.teacherId;

  if (!teacherId) {
    return "";
  }

  if (teacherId instanceof Types.ObjectId) {
    return teacherId.toString();
  }

  return teacherId._id?.toString() ?? "";
}

function getTeacherPublicId(schedule: ScheduleLean): string {
  const teacherId = schedule.teacherId;

  if (!teacherId || teacherId instanceof Types.ObjectId) {
    return "";
  }

  return normalizeText(teacherId.teacherId);
}

function getTeacherBranch(schedule: ScheduleLean): string {
  const teacherId = schedule.teacherId;

  if (!teacherId || teacherId instanceof Types.ObjectId) {
    return "";
  }

  return normalizeText(teacherId.branch);
}

function getScheduleDayOrder(day: string) {
  return scheduleDayOrderMap.get(normalizeText(day).toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
}

function getScheduleTimeOrder(time: string) {
  return (
    scheduleTimeOrderMap.get(normalizeText(time).toLowerCase()) ??
    Number.MAX_SAFE_INTEGER
  );
}

function sortSchedules(schedules: ScheduleLean[]) {
  return [...schedules].sort((left, right) => {
    const dayDifference = getScheduleDayOrder(left.day) - getScheduleDayOrder(right.day);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    const timeDifference =
      getScheduleTimeOrder(left.time) - getScheduleTimeOrder(right.time);

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return left.scheduleId.localeCompare(right.scheduleId, "id-ID");
  });
}

function buildTeacherScheduleSummary(schedules: ScheduleLean[]) {
  const sortedSchedules = sortSchedules(schedules);
  const visibleSchedules = sortedSchedules
    .slice(0, 3)
    .map((schedule) => `${schedule.day} ${schedule.time}`);
  const hiddenCount = Math.max(sortedSchedules.length - visibleSchedules.length, 0);

  if (hiddenCount > 0) {
    visibleSchedules.push(`+${hiddenCount} jadwal`);
  }

  return visibleSchedules.join("; ") || "-";
}

async function cleanupStudents(options: ScriptOptions) {
  const students = await Student.find()
    .select("studentId className branch userId")
    .populate({ path: "userId", model: User, select: "nama" })
    .sort({ studentId: 1 })
    .exec();
  const updates = students
    .map((student) => {
      const canonicalClassName = normalizeCanonicalClassName(student.className);

      if (!canonicalClassName || student.className === canonicalClassName) {
        return null;
      }

      return {
        id: student._id,
        studentId: student.studentId,
        name:
          student.userId &&
          typeof student.userId === "object" &&
          "nama" in student.userId
            ? normalizeText(String(student.userId.nama))
            : "",
        from: student.className,
        to: canonicalClassName,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const emptyBranchCount = students.filter(
    (student) => !normalizeText(student.branch),
  ).length;
  const branchUpdates = options.fillEmptyBranch
    ? students
        .filter((student) => !normalizeText(student.branch))
        .map((student) => ({
          id: student._id,
          studentId: student.studentId,
          branch: options.fillEmptyBranch,
        }))
    : [];

  if (updates.length > 0) {
    console.table(
      updates.map((update) => ({
        "ID Siswa": update.studentId,
        Nama: update.name,
        Dari: update.from,
        Ke: update.to,
      })),
    );
  }

  if (branchUpdates.length > 0) {
    const branch = await Branch.findOne({
      name: options.fillEmptyBranch,
      status: "Aktif",
    })
      .select("name")
      .lean()
      .exec();

    if (!branch) {
      throw new Error(
        `Cabang ${options.fillEmptyBranch} tidak ditemukan atau tidak aktif.`,
      );
    }

    console.table(
      branchUpdates.map((update) => ({
        "ID Siswa": update.studentId,
        "Cabang baru": update.branch,
      })),
    );
  }

  if (options.apply) {
    for (const update of updates) {
      await Student.updateOne(
        { _id: update.id },
        { $set: { className: update.to } },
      ).exec();
    }

    for (const update of branchUpdates) {
      await Student.updateOne(
        { _id: update.id },
        { $set: { branch: update.branch } },
      ).exec();
    }
  }

  return {
    totalStudents: students.length,
    normalizedClassCount: updates.length,
    filledBranchCount: branchUpdates.length,
    emptyBranchCountAfterCleanup: options.fillEmptyBranch
      ? Math.max(emptyBranchCount - branchUpdates.length, 0)
      : emptyBranchCount,
  };
}

async function syncTeacherSummaries(apply: boolean) {
  const [teachers, schedules] = await Promise.all([
    Teacher.find()
      .populate({ path: "userId", model: User, select: "nama" })
      .sort({ teacherId: 1 })
      .exec(),
    Schedule.find()
      .select("scheduleId day time className teacherId")
      .populate<{ teacherId: { _id: Types.ObjectId; teacherId: string; branch: string } }>({
        path: "teacherId",
        select: "teacherId branch",
      })
      .lean()
      .exec() as Promise<ScheduleLean[]>,
  ]);
  const schedulesByTeacherId = new Map<string, ScheduleLean[]>();

  for (const schedule of schedules) {
    const teacherObjectId = getTeacherObjectId(schedule);

    if (!teacherObjectId) {
      continue;
    }

    schedulesByTeacherId.set(teacherObjectId, [
      ...(schedulesByTeacherId.get(teacherObjectId) ?? []),
      schedule,
    ]);
  }

  const updates = teachers.map((teacher) => {
    const ownedSchedules = schedulesByTeacherId.get(teacher._id.toString()) ?? [];
    const activeClasses = new Set(
      ownedSchedules.map((schedule) => normalizeText(schedule.className)).filter(Boolean),
    ).size;
    const scheduleSummary = buildTeacherScheduleSummary(ownedSchedules);

    return {
      id: teacher._id,
      teacherId: teacher.teacherId,
      name:
        teacher.userId &&
        typeof teacher.userId === "object" &&
        "nama" in teacher.userId
          ? normalizeText(String(teacher.userId.nama))
          : "",
      fromSchedule: teacher.schedule,
      toSchedule: scheduleSummary,
      fromActiveClasses: teacher.activeClasses,
      toActiveClasses: activeClasses,
      changed:
        teacher.schedule !== scheduleSummary ||
        teacher.activeClasses !== activeClasses,
    };
  });
  const changedUpdates = updates.filter((update) => update.changed);

  if (changedUpdates.length > 0) {
    console.table(
      changedUpdates.map((update) => ({
        Guru: `${update.teacherId} - ${update.name}`,
        "Kelas aktif": `${update.fromActiveClasses} -> ${update.toActiveClasses}`,
        "Jadwal baru": update.toSchedule,
      })),
    );
  }

  if (apply) {
    for (const update of changedUpdates) {
      await Teacher.updateOne(
        { _id: update.id },
        {
          $set: {
            activeClasses: update.toActiveClasses,
            schedule: update.toSchedule,
          },
        },
      ).exec();
    }
  }

  return {
    totalTeachers: teachers.length,
    updatedTeacherCount: changedUpdates.length,
  };
}

async function auditLearningRecordsOutsideSchedules() {
  const schedules = (await Schedule.find()
    .select("scheduleId className teacherId")
    .populate<{ teacherId: { _id: Types.ObjectId; teacherId: string; branch: string } }>({
      path: "teacherId",
      select: "teacherId branch",
    })
    .lean()
    .exec()) as ScheduleLean[];
  const validClassIds = new Set(
    schedules
      .map((schedule) => {
        const teacherPublicId = getTeacherPublicId(schedule);
        const branch = getTeacherBranch(schedule);

        if (!teacherPublicId) {
          return "";
        }

        return buildStableClassId(teacherPublicId, branch, schedule.className);
      })
      .filter(Boolean),
  );
  const [tasks, attendanceSessions] = await Promise.all([
    ClassTask.find().select("taskId classId className subject title").lean().exec(),
    AttendanceSession.find()
      .select("sessionId classId className subject date status")
      .lean()
      .exec(),
  ]);
  const orphanTasks = tasks.filter(
    (task) => !validClassIds.has(normalizeText(task.classId)),
  );
  const orphanSessions = attendanceSessions.filter(
    (session) => !validClassIds.has(normalizeText(session.classId)),
  );

  if (orphanTasks.length > 0 || orphanSessions.length > 0) {
    console.table([
      ...orphanTasks.map((task) => ({
        Tipe: "Tugas",
        ID: normalizeText(task.taskId),
        ClassId: normalizeText(task.classId),
        Kelas: normalizeText(task.className),
        Mapel: normalizeText(task.subject),
        Detail: normalizeText(task.title),
      })),
      ...orphanSessions.map((session) => ({
        Tipe: "Absensi",
        ID: normalizeText(session.sessionId),
        ClassId: normalizeText(session.classId),
        Kelas: normalizeText(session.className),
        Mapel: normalizeText(session.subject),
        Detail: `${normalizeText(session.date)} ${normalizeText(session.status)}`,
      })),
    ]);
  }

  return {
    orphanTaskCount: orphanTasks.length,
    orphanAttendanceSessionCount: orphanSessions.length,
  };
}

async function run() {
  const options = parseOptions(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI as string);

  console.log(`[cleanup-schedule-data] action=${options.apply ? "apply" : "dry-run"}`);

  const studentSummary = await cleanupStudents(options);
  const teacherSummary = await syncTeacherSummaries(options.apply);
  const learningAudit = await auditLearningRecordsOutsideSchedules();

  console.log(
    JSON.stringify(
      {
        students: studentSummary,
        teachers: teacherSummary,
        learningAudit,
      },
      null,
      2,
    ),
  );

  if (!options.apply) {
    console.log("Dry-run selesai. Jalankan dengan --apply untuk menyimpan cleanup.");
  }
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
