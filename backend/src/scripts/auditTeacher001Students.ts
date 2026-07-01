import dotenv from "dotenv";
import mongoose from "mongoose";

import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { normalizeCanonicalClassName } from "../utils/studentClass";

dotenv.config({ path: ".env" });

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function sameText(left: unknown, right: unknown) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI tidak ditemukan.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const targetIds = ["001", "TCH001", "GURU001", "TCH-001"];
  const teachers = await Teacher.find({
    $or: [
      { teacherId: { $in: targetIds } },
      { teacherId: /001$/i },
      { teacherId: /001/i },
    ],
  })
    .populate({
      path: "userId",
      model: User,
      select: "nama email loginCode",
    })
    .lean()
    .exec();

  console.log(
    JSON.stringify(
      {
        teacherMatches: teachers.map((teacher: any) => ({
          objectId: teacher._id.toString(),
          teacherId: teacher.teacherId,
          name: teacher.userId?.nama ?? "",
          loginCode: teacher.userId?.loginCode ?? "",
          branch: teacher.branch,
          branches: teacher.branches ?? [],
          subject: teacher.subject,
          classList: teacher.classList,
          status: teacher.status,
        })),
      },
      null,
      2,
    ),
  );

  const activeStudents = await Student.find({ status: "Aktif" })
    .select("studentId branch className status")
    .lean()
    .exec();

  for (const teacher of teachers) {
    const schedules = await Schedule.find({ teacherId: teacher._id })
      .select(
        "scheduleId day time className branch subject room status academicYear semester",
      )
      .lean()
      .exec();

    console.log(
      JSON.stringify(
        {
          teacherId: teacher.teacherId,
          scheduleCount: schedules.length,
          schedules: schedules.map((schedule) => ({
            scheduleId: schedule.scheduleId,
            branch: schedule.branch,
            className: schedule.className,
            subject: schedule.subject,
            day: schedule.day,
            time: schedule.time,
            academicYear: schedule.academicYear,
            semester: schedule.semester,
          })),
        },
        null,
        2,
      ),
    );

    for (const schedule of schedules) {
      const scheduleBranch = normalizeText(schedule.branch);
      const scheduleClassName = normalizeText(schedule.className);
      const canonicalClassName = normalizeCanonicalClassName(scheduleClassName);

      const sameClassAllBranches = activeStudents.filter(
        (student) =>
          normalizeCanonicalClassName(normalizeText(student.className))?.toLowerCase() ===
          canonicalClassName?.toLowerCase(),
      );
      const exactBranchAndClass = activeStudents.filter(
        (student) =>
          sameText(student.branch, scheduleBranch) &&
          sameText(student.className, scheduleClassName),
      );
      const canonicalBranchAndClass = activeStudents.filter(
        (student) =>
          sameText(student.branch, scheduleBranch) &&
          normalizeCanonicalClassName(normalizeText(student.className))?.toLowerCase() ===
            canonicalClassName?.toLowerCase(),
      );
      const sameClassByBranch = sameClassAllBranches.reduce<Record<string, number>>(
        (acc, student) => {
          const branch = normalizeText(student.branch) || "(kosong)";
          acc[branch] = (acc[branch] ?? 0) + 1;
          return acc;
        },
        {},
      );

      console.log(
        JSON.stringify(
          {
            scheduleId: schedule.scheduleId,
            branch: scheduleBranch,
            className: scheduleClassName,
            canonicalClassName,
            exactBranchAndClassCount: exactBranchAndClass.length,
            canonicalBranchAndClassCount: canonicalBranchAndClass.length,
            sameClassAllBranchesCount: sameClassAllBranches.length,
            sameClassByBranch,
          },
          null,
          2,
        ),
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
