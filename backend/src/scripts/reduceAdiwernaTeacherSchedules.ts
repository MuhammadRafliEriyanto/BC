import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import mongoose from "mongoose";

import "../config/env";
import { Schedule } from "../models/Schedule";
import { Teacher } from "../models/Teacher";

const TARGET_ADIWERNA_SCHEDULE_COUNT = 20;
const SCHEDULE_IDS_TO_REMOVE = [
  "SCH-031",
  "SCH-032",
  "SCH-051",
  "SCH-030",
  "SCH-052",
  "SCH-050",
] as const;

async function loadAuditRows() {
  const teachers = await Teacher.find({
    teacherId: {
      $in: Array.from({ length: 13 }, (_, index) =>
        `TCH-${String(index + 1).padStart(3, "0")}`,
      ),
    },
    status: "Aktif",
  })
    .select("_id teacherId")
    .sort({ teacherId: 1 })
    .lean()
    .exec();
  const schedules = await Schedule.find({
    teacherId: { $in: teachers.map((teacher) => teacher._id) },
  })
    .select("scheduleId teacherId branch className day time room subject status")
    .sort({ scheduleId: 1 })
    .lean()
    .exec();

  return teachers.map((teacher) => {
    const teacherSchedules = schedules.filter(
      (schedule) => schedule.teacherId.toString() === teacher._id.toString(),
    );

    return {
      teacher,
      slawiCount: teacherSchedules.filter((schedule) => schedule.branch === "Slawi").length,
      adiwernaCount: teacherSchedules.filter(
        (schedule) => schedule.branch === "Adiwerna",
      ).length,
    };
  });
}

async function validateReduction() {
  const currentAdiwernaCount = await Schedule.countDocuments({ branch: "Adiwerna" });
  const schedulesToRemove = await Schedule.find({
    scheduleId: { $in: SCHEDULE_IDS_TO_REMOVE },
  })
    .select("scheduleId teacherId branch className day time room subject status")
    .sort({ scheduleId: 1 })
    .lean()
    .exec();

  if (currentAdiwernaCount !== 26) {
    throw new Error(
      `Jadwal Adiwerna saat ini ${currentAdiwernaCount}, bukan 26. Pengurangan dibatalkan.`,
    );
  }

  if (schedulesToRemove.length !== SCHEDULE_IDS_TO_REMOVE.length) {
    throw new Error("Sebagian jadwal target pengurangan tidak ditemukan.");
  }

  if (schedulesToRemove.some((schedule) => schedule.branch !== "Adiwerna")) {
    throw new Error("Ada jadwal target yang bukan milik cabang Adiwerna.");
  }

  if (currentAdiwernaCount - schedulesToRemove.length !== TARGET_ADIWERNA_SCHEDULE_COUNT) {
    throw new Error("Rencana pengurangan tidak menghasilkan tepat 20 jadwal Adiwerna.");
  }

  const auditRows = await loadAuditRows();

  for (const row of auditRows) {
    const removalCount = schedulesToRemove.filter(
      (schedule) => schedule.teacherId.toString() === row.teacher._id.toString(),
    ).length;

    if (row.slawiCount < 1 || row.adiwernaCount - removalCount < 1) {
      throw new Error(
        `Pengurangan membuat ${row.teacher.teacherId} tidak memiliki jadwal di salah satu cabang.`,
      );
    }
  }

  return { schedulesToRemove, auditRows };
}

async function writeBackup(
  validation: Awaited<ReturnType<typeof validateReduction>>,
) {
  const backupDirectory = path.resolve(process.cwd(), "storage", "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(
    backupDirectory,
    `adiwerna-schedule-reduction-${timestamp}.json`,
  );

  await mkdir(backupDirectory, { recursive: true });
  await writeFile(
    backupPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        migration: "reduce-adiwerna-teacher-schedules-to-20-v1",
        targetAdiwernaScheduleCount: TARGET_ADIWERNA_SCHEDULE_COUNT,
        schedules: validation.schedulesToRemove,
      },
      null,
      2,
    ),
    "utf8",
  );

  return backupPath;
}

async function run() {
  const apply = process.argv.includes("--apply");
  await mongoose.connect(process.env.MONGO_URI as string);

  try {
    const validation = await validateReduction();
    const teacherIdByObjectId = new Map(
      validation.auditRows.map(({ teacher }) => [
        teacher._id.toString(),
        teacher.teacherId,
      ]),
    );

    console.table(
      validation.schedulesToRemove.map((schedule) => ({
        Jadwal: schedule.scheduleId,
        Guru: teacherIdByObjectId.get(schedule.teacherId.toString()) ?? "-",
        Kelas: schedule.className,
        Hari: schedule.day,
        Jam: schedule.time,
      })),
    );

    if (!apply) {
      console.log("Dry-run valid. Jadwal Adiwerna akan berkurang dari 26 menjadi 20.");
      return;
    }

    const backupPath = await writeBackup(validation);
    const result = await Schedule.deleteMany({
      scheduleId: { $in: SCHEDULE_IDS_TO_REMOVE },
    }).exec();

    if (result.deletedCount !== SCHEDULE_IDS_TO_REMOVE.length) {
      throw new Error(`Jadwal yang terhapus hanya ${result.deletedCount}.`);
    }

    const remainingAdiwernaCount = await Schedule.countDocuments({ branch: "Adiwerna" });

    if (remainingAdiwernaCount !== TARGET_ADIWERNA_SCHEDULE_COUNT) {
      throw new Error(`Jadwal Adiwerna tersisa ${remainingAdiwernaCount}, bukan 20.`);
    }

    console.log(`Backup tersimpan: ${backupPath}`);
    console.log(`Jadwal Adiwerna sekarang: ${remainingAdiwernaCount}.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
