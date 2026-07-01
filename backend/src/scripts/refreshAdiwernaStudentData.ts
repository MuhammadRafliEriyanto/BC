import mongoose from "mongoose";

import "../config/env";
import { Student, type StudentDocument } from "../models/Student";
import { User, type UserDocument } from "../models/User";

type StudentWithUser = StudentDocument & {
  userId: UserDocument | null;
};

const firstNames = [
  "Alya",
  "Nabila",
  "Fathan",
  "Raka",
  "Zahra",
  "Dimas",
  "Nayla",
  "Rizky",
  "Salsabila",
  "Fahri",
  "Azzam",
  "Laras",
  "Bintang",
  "Keyla",
  "Farhan",
  "Intan",
  "Arkan",
  "Putri",
  "Rafi",
  "Hana",
  "Gilang",
  "Syifa",
  "Alif",
  "Citra",
  "Ilham",
  "Maira",
  "Rendy",
  "Nadya",
  "Bagas",
  "Aurel",
];

const middleNames = [
  "Aulia",
  "Pratama",
  "Kirana",
  "Maulana",
  "Ramadhani",
  "Saputra",
  "Permata",
  "Wijaya",
  "Nur",
  "Ananda",
  "Fadhilah",
  "Mahendra",
  "Khairunnisa",
  "Alfarizi",
  "Dwi",
  "Sekar",
  "Akbar",
  "Safitri",
  "Yusuf",
  "Amelia",
];

const familyNames = [
  "Adiwerna",
  "Kalisapu",
  "Tembok Banjaran",
  "Lemahduwur",
  "Pesarean",
  "Kedungsukun",
  "Harjosari",
  "Ujungrusi",
  "Pagedangan",
  "Bersole",
  "Tegalandong",
  "Pecangakan",
];

const elementaryPrograms = [
  "SD N 1 Adiwerna",
  "SD N 2 Adiwerna",
  "SD N 3 Adiwerna",
  "MI Adiwerna",
];

const juniorPrograms = [
  "SMP N 1 Adiwerna",
  "SMP N 2 Adiwerna",
  "SMP N 3 Adiwerna",
  "MTs Adiwerna",
];

const seniorPrograms = [
  "SMA Adiwerna",
  "SMK N 1 Adiwerna",
  "MA Adiwerna",
  "SMK Adiwerna",
];

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function buildName(index: number) {
  const firstName = firstNames[index % firstNames.length];
  const middleName = middleNames[Math.floor(index / firstNames.length) % middleNames.length];
  const familyName =
    familyNames[Math.floor(index / (firstNames.length * middleNames.length)) % familyNames.length];

  return `${firstName} ${middleName} ${familyName}`;
}

function buildPhone(index: number) {
  return `0813${String(50000000 + index).padStart(8, "0")}`;
}

function getProgramsForClass(className: string) {
  const normalizedClassName = normalizeText(className).toUpperCase();

  if (normalizedClassName.startsWith("SD")) {
    return elementaryPrograms;
  }

  if (normalizedClassName.startsWith("SMP")) {
    return juniorPrograms;
  }

  return seniorPrograms;
}

function buildProgram(className: string, index: number) {
  const programs = getProgramsForClass(className);

  return programs[index % programs.length];
}

async function getAdiwernaStudents() {
  return (await Student.find({
    branch: "Adiwerna",
  })
    .populate<{ userId: UserDocument | null }>({
      path: "userId",
      model: User,
    })
    .sort({ className: 1, studentId: 1 })
    .exec()) as unknown as StudentWithUser[];
}

async function run() {
  const apply = process.argv.includes("--apply");

  await mongoose.connect(process.env.MONGO_URI as string);

  const students = await getAdiwernaStudents();
  const updates = students
    .filter((student) => student.userId)
    .map((student, index) => ({
      student,
      name: buildName(index),
      phone: buildPhone(index),
      program: buildProgram(student.className, index),
    }));

  console.log(
    `[refresh-adiwerna-students] action=${apply ? "apply" : "dry-run"} targetStudents=${updates.length}`,
  );
  console.table(
    updates.slice(0, 20).map((update) => ({
      ID: update.student.studentId,
      Kelas: update.student.className,
      "Nama lama": normalizeText(update.student.userId?.nama),
      "Nama baru": update.name,
      "Program baru": update.program,
    })),
  );

  if (!apply) {
    console.log("Dry-run selesai. Jalankan dengan --apply untuk memperbarui data.");
    return;
  }

  for (const update of updates) {
    if (!update.student.userId) {
      continue;
    }

    update.student.userId.nama = update.name;
    update.student.phone = update.phone;
    update.student.program = update.program;

    await Promise.all([update.student.userId.save(), update.student.save()]);
  }

  console.log(`Selesai. Data siswa Adiwerna diperbarui: ${updates.length}.`);
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
