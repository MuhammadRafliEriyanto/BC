import mongoose, { Types } from "mongoose";

import "../config/env";
import { AttendanceSession } from "../models/AttendanceSession";
import { Branch } from "../models/Branch";
import { ClassTask } from "../models/ClassTask";
import { Payment } from "../models/Payment";
import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";
import { Teacher } from "../models/Teacher";
import { User, type UserDocument } from "../models/User";

const generatedStudentEmailPattern = /^siswa\d+@bimbel\.local$/i;
const generatedTeacherEmailPattern = /^guru\d+@bimbel\.local$/i;

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type StudentWithUser = {
  _id: Types.ObjectId;
  studentId: string;
  branch: string;
  userId: UserDocument | null;
};

type TeacherWithUser = {
  _id: Types.ObjectId;
  teacherId: string;
  branch: string;
  userId: UserDocument | null;
};

async function findGeneratedAdiwernaStudents() {
  const students = (await Student.find({ branch: "Adiwerna" })
    .populate<{ userId: UserDocument | null }>({
      path: "userId",
      model: User,
    })
    .select("studentId branch userId")
    .sort({ studentId: 1 })
    .exec()) as unknown as StudentWithUser[];

  return students.filter((student) =>
    generatedStudentEmailPattern.test(normalizeText(student.userId?.email)),
  );
}

async function findGeneratedAdiwernaTeachers() {
  const teachers = (await Teacher.find({ branch: "Adiwerna" })
    .populate<{ userId: UserDocument | null }>({
      path: "userId",
      model: User,
    })
    .select("teacherId branch userId")
    .sort({ teacherId: 1 })
    .exec()) as unknown as TeacherWithUser[];

  return teachers.filter((teacher) =>
    generatedTeacherEmailPattern.test(normalizeText(teacher.userId?.email)),
  );
}

async function hasFinancialHistory(students: StudentWithUser[]) {
  const studentIds = students.map((student) => student._id);
  const userIds = students
    .map((student) => student.userId?._id)
    .filter((userId): userId is Types.ObjectId => Boolean(userId));
  const queryFilters = [
    ...(studentIds.length ? [{ studentId: { $in: studentIds } }] : []),
    ...(userIds.length ? [{ userId: { $in: userIds } }] : []),
  ];

  if (!queryFilters.length) {
    return false;
  }

  const query = queryFilters.length === 1 ? queryFilters[0] : { $or: queryFilters };
  const [paymentCount, subscriptionCount] = await Promise.all([
    Payment.countDocuments(query).exec(),
    Subscription.countDocuments(query).exec(),
  ]);

  return paymentCount > 0 || subscriptionCount > 0;
}

async function resolveBranchAdminUserId(branchName: string) {
  const branch = await Branch.findOne({
    name: new RegExp(`^${escapeRegex(branchName)}$`, "i"),
  }).exec();

  if (!branch) {
    throw new Error(`Cabang ${branchName} tidak ditemukan.`);
  }

  if (branch.adminUserId) {
    return {
      branch,
      admin: await User.findById(branch.adminUserId).select("nama email role").exec(),
      needsUpdate: false,
    };
  }

  const adminName = normalizeText(branch.adminName);

  if (!adminName) {
    throw new Error(`Cabang ${branchName} belum punya adminName.`);
  }

  const admin = await User.findOne({
    role: "admin",
    nama: new RegExp(`^${escapeRegex(adminName)}$`, "i"),
  })
    .select("nama email role")
    .exec();

  if (!admin) {
    throw new Error(`Admin ${adminName} untuk cabang ${branchName} tidak ditemukan.`);
  }

  return {
    branch,
    admin,
    needsUpdate: true,
  };
}

async function run() {
  const apply = process.argv.includes("--apply");

  await mongoose.connect(process.env.MONGO_URI as string);

  const [students, teachers, slawiAdminLink, adiwernaAdminLink] = await Promise.all([
    findGeneratedAdiwernaStudents(),
    findGeneratedAdiwernaTeachers(),
    resolveBranchAdminUserId("Slawi"),
    resolveBranchAdminUserId("Adiwerna"),
  ]);
  const teacherIds = teachers.map((teacher) => teacher._id);
  const studentUserIds = students
    .map((student) => student.userId?._id)
    .filter((userId): userId is Types.ObjectId => Boolean(userId));
  const teacherUserIds = teachers
    .map((teacher) => teacher.userId?._id)
    .filter((userId): userId is Types.ObjectId => Boolean(userId));
  const [scheduleCount, taskCount, attendanceCount, hasStudentFinancialHistory] =
    await Promise.all([
      Schedule.countDocuments({ teacherId: { $in: teacherIds } }).exec(),
      ClassTask.countDocuments({ teacherId: { $in: teacherIds } }).exec(),
      AttendanceSession.countDocuments({ teacherId: { $in: teacherIds } }).exec(),
      hasFinancialHistory(students),
    ]);

  console.log(
    `[rollback-adiwerna-seed] action=${apply ? "apply" : "dry-run"}`,
  );
  console.table([
    {
      Data: "Siswa seed Adiwerna",
      Jumlah: students.length,
    },
    {
      Data: "Guru seed Adiwerna",
      Jumlah: teachers.length,
    },
    {
      Data: "Jadwal guru seed Adiwerna",
      Jumlah: scheduleCount,
    },
    {
      Data: "Tugas guru seed Adiwerna",
      Jumlah: taskCount,
    },
    {
      Data: "Absensi guru seed Adiwerna",
      Jumlah: attendanceCount,
    },
  ]);
  console.table([
    {
      Cabang: "Slawi",
      Admin: slawiAdminLink.admin
        ? `${slawiAdminLink.admin.nama} <${slawiAdminLink.admin.email}>`
        : "-",
      "Perlu update adminUserId": slawiAdminLink.needsUpdate,
    },
    {
      Cabang: "Adiwerna",
      Admin: adiwernaAdminLink.admin
        ? `${adiwernaAdminLink.admin.nama} <${adiwernaAdminLink.admin.email}>`
        : "-",
      "Perlu update adminUserId": adiwernaAdminLink.needsUpdate,
    },
  ]);

  if (hasStudentFinancialHistory) {
    throw new Error(
      "Rollback dibatalkan karena ada siswa seed Adiwerna yang sudah punya histori pembayaran/subscription.",
    );
  }

  if (!apply) {
    console.log("Dry-run selesai. Jalankan dengan --apply untuk rollback data seed.");
    return;
  }

  if (slawiAdminLink.needsUpdate && slawiAdminLink.admin) {
    slawiAdminLink.branch.adminUserId = slawiAdminLink.admin._id;
    slawiAdminLink.branch.adminName = slawiAdminLink.admin.nama;
    await slawiAdminLink.branch.save();
  }

  if (adiwernaAdminLink.needsUpdate && adiwernaAdminLink.admin) {
    adiwernaAdminLink.branch.adminUserId = adiwernaAdminLink.admin._id;
    adiwernaAdminLink.branch.adminName = adiwernaAdminLink.admin.nama;
    await adiwernaAdminLink.branch.save();
  }

  await Promise.all([
    Schedule.deleteMany({ teacherId: { $in: teacherIds } }).exec(),
    ClassTask.deleteMany({ teacherId: { $in: teacherIds } }).exec(),
    AttendanceSession.deleteMany({ teacherId: { $in: teacherIds } }).exec(),
  ]);

  await Promise.all([
    Student.deleteMany({ _id: { $in: students.map((student) => student._id) } }).exec(),
    Teacher.deleteMany({ _id: { $in: teacherIds } }).exec(),
  ]);

  await User.deleteMany({
    _id: {
      $in: [...studentUserIds, ...teacherUserIds],
    },
  }).exec();

  console.log(
    `Selesai. Siswa dihapus: ${students.length}. Guru dihapus: ${teachers.length}. Jadwal dihapus: ${scheduleCount}.`,
  );
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
