import mongoose, { Types } from "mongoose";

import "../config/env";
import { AttendanceRecord } from "../models/AttendanceRecord";
import { AttendanceSession } from "../models/AttendanceSession";
import { ClassMaterial } from "../models/ClassMaterial";
import { ClassTask } from "../models/ClassTask";
import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { getNextPublicId } from "../utils/publicId";
import { normalizeCanonicalClassName } from "../utils/studentClass";

type SeedOptions = {
  apply: boolean;
  meetingCount: 2 | 3;
};

type SeedTeacher = {
  _id: Types.ObjectId;
  teacherId: string;
  branch: string;
};

type SeedSchedule = {
  scheduleId: string;
  teacherId: Types.ObjectId;
  day: string;
  time: string;
  className: string;
  branch: string;
  subject: string;
  room: string;
};

type SeedStudent = {
  _id: Types.ObjectId;
  studentId: string;
  userId: Types.ObjectId;
  branch: string;
  className: string;
};

type ClassGroup = {
  teacher: SeedTeacher;
  classId: string;
  className: string;
  canonicalClassName: string;
  subject: string;
  branch: string;
  schedules: SeedSchedule[];
};

type AttendanceStatus = "Hadir" | "Sakit" | "Izin" | "Alpa";
type LearningLevel = "SD" | "SMP" | "SMA";

const SEED_CUTOFF_DATE = "2026-06-19";
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_INDEX: Record<string, number> = {
  minggu: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
};

const TOPICS: Record<string, Record<LearningLevel, readonly string[]>> = {
  Matematika: {
    SD: [
      "Operasi Hitung dan Soal Cerita",
      "Pecahan, Desimal, dan Persen",
      "Keliling dan Luas Bangun Datar",
    ],
    SMP: [
      "Bilangan dan Bentuk Aljabar",
      "Persamaan Linear Satu Variabel",
      "Perbandingan dan Skala",
    ],
    SMA: [
      "Persamaan dan Fungsi",
      "Sistem Persamaan Linear",
      "Statistika Dasar",
    ],
  },
  "Bahasa Indonesia": {
    SD: [
      "Ide Pokok dan Kalimat Utama",
      "Teks Deskripsi",
      "Ringkasan Bacaan",
    ],
    SMP: [
      "Teks Deskripsi dan Strukturnya",
      "Teks Eksplanasi",
      "Simpulan dan Informasi Tersurat",
    ],
    SMA: [
      "Teks Argumentasi",
      "Struktur Teks Editorial",
      "Analisis Kebahasaan",
    ],
  },
  "Bahasa Inggris": {
    SD: [
      "Daily Activities Vocabulary",
      "Simple Present Tense",
      "Short Descriptive Text",
    ],
    SMP: [
      "Descriptive Text",
      "Simple Past Tense",
      "Reading Comprehension",
    ],
    SMA: [
      "Analytical Exposition",
      "Conditional Sentences",
      "Academic Reading Comprehension",
    ],
  },
  IPA: {
    SD: [
      "Ciri dan Kebutuhan Makhluk Hidup",
      "Gaya dan Gerak",
      "Perubahan Bentuk Energi",
    ],
    SMP: [
      "Klasifikasi Makhluk Hidup",
      "Pengukuran dan Besaran",
      "Energi dan Perubahannya",
    ],
    SMA: [
      "Pengukuran dan Vektor",
      "Gerak dan Dinamika",
      "Usaha dan Energi",
    ],
  },
  IPS: {
    SD: [
      "Lingkungan dan Kegiatan Ekonomi",
      "Keragaman Sosial Budaya",
      "Peristiwa Sejarah Indonesia",
    ],
    SMP: [
      "Interaksi Sosial",
      "Kegiatan Ekonomi Masyarakat",
      "Perubahan Sosial dan Sejarah",
    ],
    SMA: [
      "Konsep Dasar Ekonomi",
      "Dinamika Masyarakat",
      "Perubahan dan Peristiwa Sejarah",
    ],
  },
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function normalizeKey(value: string | null | undefined) {
  return normalizeText(value).toLowerCase();
}

function slugify(value: string) {
  return normalizeKey(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildStableClassId(
  teacherPublicId: string,
  branch: string,
  className: string,
) {
  return `class-${slugify(teacherPublicId) || "guru"}-${slugify(branch) || "cabang"}-${slugify(className) || "kelas"}`;
}

function parseOptions(args: string[]): SeedOptions {
  const meetingArgument = args.find((argument) =>
    argument.startsWith("--meetings="),
  );
  const meetingCount = Number(meetingArgument?.split("=")[1] ?? "3");

  if (meetingCount !== 2 && meetingCount !== 3) {
    throw new Error("Jumlah pertemuan hanya boleh 2 atau 3.");
  }

  return {
    apply: args.includes("--apply"),
    meetingCount,
  };
}

function getLearningLevel(className: string): LearningLevel {
  const canonicalClassName = normalizeCanonicalClassName(className) ?? "";

  if (canonicalClassName.startsWith("SD ")) {
    return "SD";
  }

  if (canonicalClassName.startsWith("SMA ")) {
    return "SMA";
  }

  return "SMP";
}

function getTopics(subject: string, className: string) {
  const level = getLearningLevel(className);
  return (TOPICS[subject] ?? TOPICS.IPS)[level];
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  return toIsoDate(new Date(date.getTime() + days * DAY_IN_MS));
}

function getStartTime(timeValue: string) {
  return timeValue.match(/\b\d{2}:\d{2}\b/)?.[0] ?? "15:00";
}

function buildMeetingPlans(group: ClassGroup, meetingCount: 2 | 3) {
  const scheduleByDay = new Map<number, SeedSchedule>();

  for (const schedule of group.schedules) {
    const dayIndex = DAY_INDEX[normalizeKey(schedule.day)];

    if (dayIndex !== undefined && !scheduleByDay.has(dayIndex)) {
      scheduleByDay.set(dayIndex, schedule);
    }
  }

  const meetings: Array<{ date: string; schedule: SeedSchedule }> = [];
  const cutoff = new Date(`${SEED_CUTOFF_DATE}T00:00:00.000Z`);

  for (let offset = 0; offset < 90 && meetings.length < meetingCount; offset += 1) {
    const date = new Date(cutoff.getTime() - offset * DAY_IN_MS);
    const schedule = scheduleByDay.get(date.getUTCDay());

    if (schedule) {
      meetings.push({ date: toIsoDate(date), schedule });
    }
  }

  if (meetings.length < meetingCount) {
    throw new Error(
      `Jadwal ${group.teacher.teacherId} ${group.className} tidak memiliki hari yang valid.`,
    );
  }

  const topics = getTopics(group.subject, group.className);

  return meetings.reverse().map((meeting, index) => ({
    group,
    meetingNumber: index + 1,
    date: meeting.date,
    schedule: meeting.schedule,
    topic: topics[index],
  }));
}

function parsePublicIdNumber(publicId: string) {
  const publicIdParts = publicId.split("-");
  const numericValue = Number(publicIdParts[publicIdParts.length - 1]);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`ID publik tidak valid: ${publicId}`);
  }

  return numericValue;
}

function formatPublicId(prefix: string, numericValue: number) {
  return `${prefix}-${String(numericValue).padStart(3, "0")}`;
}

function getAttendanceStatus(seed: string): AttendanceStatus {
  let hash = 0;

  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) % 100;
  }

  if (hash < 5) {
    return "Sakit";
  }

  if (hash < 10) {
    return "Izin";
  }

  if (hash < 15) {
    return "Alpa";
  }

  return "Hadir";
}

function getAttendanceNote(status: AttendanceStatus) {
  if (status === "Sakit") {
    return "Sakit dan telah memberikan keterangan.";
  }

  if (status === "Izin") {
    return "Izin dengan keterangan orang tua.";
  }

  if (status === "Alpa") {
    return "Tidak hadir tanpa keterangan.";
  }

  return "";
}

async function insertInBatches<T>(
  documents: T[],
  insert: (batch: T[]) => Promise<unknown>,
) {
  const batchSize = 400;

  for (let index = 0; index < documents.length; index += batchSize) {
    await insert(documents.slice(index, index + batchSize));
  }
}

async function run() {
  const options = parseOptions(process.argv.slice(2));
  await mongoose.connect(process.env.MONGO_URI as string);

  const teachers = (await Teacher.find({ status: "Aktif" })
    .select("_id teacherId branch")
    .lean()
    .exec()) as SeedTeacher[];
  const teacherById = new Map(
    teachers.map((teacher) => [teacher._id.toString(), teacher]),
  );
  const schedules = (await Schedule.find({
    teacherId: { $in: teachers.map((teacher) => teacher._id) },
    status: { $ne: "Bentrok" },
  })
    .select("scheduleId teacherId day time className branch subject room")
    .lean()
    .exec()) as SeedSchedule[];
  const groupByKey = new Map<string, ClassGroup>();

  for (const schedule of schedules) {
    const teacher = teacherById.get(schedule.teacherId.toString());
    const className = normalizeText(schedule.className);
    const canonicalClassName = normalizeCanonicalClassName(className);

    if (!teacher || !canonicalClassName) {
      continue;
    }

    const branch = normalizeText(schedule.branch) || normalizeText(teacher.branch);
    const key = `${teacher._id}|${normalizeKey(branch)}|${normalizeKey(className)}`;
    const existingGroup = groupByKey.get(key);

    if (existingGroup) {
      existingGroup.schedules.push(schedule);
      continue;
    }

    groupByKey.set(key, {
      teacher,
      classId: buildStableClassId(teacher.teacherId, branch, className),
      className,
      canonicalClassName,
      subject: normalizeText(schedule.subject),
      branch,
      schedules: [schedule],
    });
  }

  const groups = [...groupByKey.values()].sort((left, right) =>
    `${left.branch}-${left.teacher.teacherId}-${left.className}`.localeCompare(
      `${right.branch}-${right.teacher.teacherId}-${right.className}`,
    ),
  );
  const meetingPlans = groups.flatMap((group) =>
    buildMeetingPlans(group, options.meetingCount),
  );
  const [existingMaterials, existingTasks, existingSessions, students] =
    await Promise.all([
      ClassMaterial.find()
        .select("teacherId classId meetingNumber")
        .lean()
        .exec(),
      ClassTask.find()
        .select("teacherId classId meetingNumber")
        .lean()
        .exec(),
      AttendanceSession.find()
        .select("sessionId teacherId classId date")
        .lean()
        .exec(),
      Student.find({ status: "Aktif" })
        .select("_id studentId userId branch className")
        .lean()
        .exec() as Promise<SeedStudent[]>,
    ]);
  const materialKeys = new Set(
    existingMaterials.map(
      (material) =>
        `${material.teacherId}|${material.classId}|${material.meetingNumber}`,
    ),
  );
  const taskKeys = new Set(
    existingTasks.map(
      (task) => `${task.teacherId}|${task.classId}|${task.meetingNumber}`,
    ),
  );
  const sessionByKey = new Map(
    existingSessions.map((session) => [
      `${session.teacherId}|${session.classId}|${session.date}`,
      session.sessionId,
    ]),
  );
  const materialsToCreate: Array<Record<string, unknown>> = [];
  const tasksToCreate: Array<Record<string, unknown>> = [];
  const sessionsToCreate: Array<Record<string, unknown>> = [];
  let nextMaterialNumber = parsePublicIdNumber(
    await getNextPublicId(ClassMaterial, "materialId", "MAT"),
  );
  let nextTaskNumber = parsePublicIdNumber(
    await getNextPublicId(ClassTask, "taskId", "TSK"),
  );
  let nextSessionNumber = parsePublicIdNumber(
    await getNextPublicId(AttendanceSession, "sessionId", "ATS"),
  );

  for (const plan of meetingPlans) {
    const { group } = plan;
    const learningKey = `${group.teacher._id}|${group.classId}|${plan.meetingNumber}`;
    const sessionKey = `${group.teacher._id}|${group.classId}|${plan.date}`;

    if (!materialKeys.has(learningKey)) {
      materialsToCreate.push({
        materialId: formatPublicId("MAT", nextMaterialNumber),
        classId: group.classId,
        teacherId: group.teacher._id,
        className: group.className,
        canonicalClassName: group.canonicalClassName,
        subject: group.subject,
        branch: group.branch,
        room: plan.schedule.room,
        meetingNumber: plan.meetingNumber,
        date: plan.date,
        title: plan.topic,
        description: `Materi pertemuan ${plan.meetingNumber} untuk ${group.className} membahas ${plan.topic.toLowerCase()} melalui penjelasan konsep, contoh, dan latihan terarah.`,
        linkUrl: "",
        attachment: null,
        status: "Dipublikasikan",
      });
      nextMaterialNumber += 1;
    }

    if (!taskKeys.has(learningKey)) {
      tasksToCreate.push({
        taskId: formatPublicId("TSK", nextTaskNumber),
        classId: group.classId,
        teacherId: group.teacher._id,
        className: group.className,
        canonicalClassName: group.canonicalClassName,
        subject: group.subject,
        branch: group.branch,
        room: plan.schedule.room,
        meetingNumber: plan.meetingNumber,
        title: `Latihan ${plan.topic}`,
        description: `Kerjakan latihan ${plan.topic.toLowerCase()} sesuai materi pertemuan ${plan.meetingNumber}. Tuliskan langkah atau alasan jawaban dengan jelas.`,
        deadline: addDays(plan.date, 3),
        attachment: null,
        submittedCount: 0,
        reviewStatus: "Belum Ada Pengumpulan",
      });
      nextTaskNumber += 1;
    }

    if (!sessionByKey.has(sessionKey)) {
      const sessionId = formatPublicId("ATS", nextSessionNumber);
      sessionsToCreate.push({
        sessionId,
        classId: group.classId,
        teacherId: group.teacher._id,
        scheduleId: plan.schedule.scheduleId,
        className: group.className,
        subject: group.subject,
        branch: group.branch,
        room: plan.schedule.room,
        date: plan.date,
        startTime: getStartTime(plan.schedule.time),
        status: "closed",
        qrToken: null,
      });
      sessionByKey.set(sessionKey, sessionId);
      nextSessionNumber += 1;
    }
  }

  const users = await User.find({
    _id: { $in: students.map((student) => student.userId) },
  })
    .select("_id nama")
    .lean()
    .exec();
  const studentNameByUserId = new Map(
    users.map((user) => [user._id.toString(), user.nama]),
  );
  const studentsByBranchAndClass = new Map<string, SeedStudent[]>();

  for (const student of students) {
    const canonicalClassName = normalizeCanonicalClassName(student.className);

    if (!canonicalClassName) {
      continue;
    }

    const key = `${normalizeKey(student.branch)}|${normalizeKey(canonicalClassName)}`;
    const classStudents = studentsByBranchAndClass.get(key) ?? [];
    classStudents.push(student);
    studentsByBranchAndClass.set(key, classStudents);
  }

  const plannedSessionIds = meetingPlans
    .map((plan) =>
      sessionByKey.get(
        `${plan.group.teacher._id}|${plan.group.classId}|${plan.date}`,
      ),
    )
    .filter((sessionId): sessionId is string => Boolean(sessionId));
  const existingRecords = await AttendanceRecord.find({
    sessionId: { $in: plannedSessionIds },
  })
    .select("sessionId studentId")
    .lean()
    .exec();
  const recordKeys = new Set(
    existingRecords.map((record) => `${record.sessionId}|${record.studentId}`),
  );
  const recordsToCreate: Array<Record<string, unknown>> = [];
  let nextRecordNumber = parsePublicIdNumber(
    await getNextPublicId(AttendanceRecord, "recordId", "ATR"),
  );

  for (const plan of meetingPlans) {
    const { group } = plan;
    const sessionId = sessionByKey.get(
      `${group.teacher._id}|${group.classId}|${plan.date}`,
    );
    const classStudents =
      studentsByBranchAndClass.get(
        `${normalizeKey(group.branch)}|${normalizeKey(group.canonicalClassName)}`,
      ) ?? [];

    if (!sessionId) {
      throw new Error(`Session ID ${group.classId} ${plan.date} tidak ditemukan.`);
    }

    for (const student of classStudents) {
      const recordKey = `${sessionId}|${student.studentId}`;

      if (recordKeys.has(recordKey)) {
        continue;
      }

      const status = getAttendanceStatus(recordKey);
      recordsToCreate.push({
        recordId: formatPublicId("ATR", nextRecordNumber),
        sessionId,
        studentId: student.studentId,
        studentObjectId: student._id,
        name:
          studentNameByUserId.get(student.userId.toString()) ??
          `Siswa ${student.studentId}`,
        status,
        note: getAttendanceNote(status),
        markedBy: "teacher",
        markedAt: new Date(
          `${plan.date}T${getStartTime(plan.schedule.time)}:00+07:00`,
        ),
      });
      recordKeys.add(recordKey);
      nextRecordNumber += 1;
    }
  }

  const branchRows = [...new Set(groups.map((group) => group.branch))].map(
    (branch) => ({
      Cabang: branch,
      Kelas: groups.filter((group) => group.branch === branch).length,
      Materi: materialsToCreate.filter((item) => item.branch === branch).length,
      Tugas: tasksToCreate.filter((item) => item.branch === branch).length,
      "Sesi absensi": sessionsToCreate.filter(
        (item) => item.branch === branch,
      ).length,
      "Catatan siswa": recordsToCreate.filter((record) => {
        const plan = meetingPlans.find(
          (candidate) =>
            sessionByKey.get(
              `${candidate.group.teacher._id}|${candidate.group.classId}|${candidate.date}`,
            ) === record.sessionId,
        );
        return plan?.group.branch === branch;
      }).length,
    }),
  );

  console.log(
    `[seed-teacher-learning] action=${options.apply ? "apply" : "dry-run"} meetings=${options.meetingCount} cutoff=${SEED_CUTOFF_DATE}`,
  );
  console.table(branchRows);
  console.log(
    `Total baru: ${materialsToCreate.length} materi, ${tasksToCreate.length} tugas, ${sessionsToCreate.length} sesi absensi, ${recordsToCreate.length} catatan siswa.`,
  );

  if (!options.apply) {
    console.log("Dry-run selesai. Tidak ada data yang diubah.");
    return;
  }

  await insertInBatches(materialsToCreate, (batch) =>
    ClassMaterial.insertMany(batch),
  );
  await insertInBatches(tasksToCreate, (batch) => ClassTask.insertMany(batch));
  await insertInBatches(sessionsToCreate, (batch) =>
    AttendanceSession.insertMany(batch),
  );
  await insertInBatches(recordsToCreate, (batch) =>
    AttendanceRecord.insertMany(batch),
  );

  console.log("Materi, tugas, dan absensi guru berhasil disimpan.");
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
