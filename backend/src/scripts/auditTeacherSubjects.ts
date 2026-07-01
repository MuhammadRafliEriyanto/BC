import mongoose from "mongoose";
import dotenv from "dotenv";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { Schedule } from "../models/Schedule";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  console.log("=== 1 & 2. DATA LENGKAP EKA WIDIYANA ===");
  const userEka = await User.findOne({ email: "guru005@bimbel.local" }).exec();
  const teacherEka = await Teacher.findOne({ userId: userEka?._id }).lean().exec();

  if (teacherEka) {
    console.log(JSON.stringify(teacherEka, null, 2));
  } else {
    console.log("Data guru tidak ditemukan.");
  }

  console.log("\n=== 3 & 4. AUDIT MULTI-MAPEL PADA GURU LAIN ===");
  const allSchedules = await Schedule.find({}).exec();
  const subjectByTeacher: Record<string, Set<string>> = {};

  for (const s of allSchedules) {
    const tId = s.teacherId?.toString() || "unassigned";
    if (!subjectByTeacher[tId]) {
      subjectByTeacher[tId] = new Set<string>();
    }
    subjectByTeacher[tId].add(s.subject);
  }

  let anyMultiSubject = false;
  for (const [tId, subjects] of Object.entries(subjectByTeacher)) {
    if (tId === "unassigned") continue;
    if (subjects.size > 1) {
      anyMultiSubject = true;
      const t = await Teacher.findById(tId).populate({ path: "userId", select: "nama" }).exec() as any;
      const name = t?.userId?.nama || tId;
      console.log(`Guru ${name} mengajar multi-mapel: ${Array.from(subjects).join(", ")}`);
    }
  }

  if (!anyMultiSubject) {
    console.log("Saat ini TIDAK ADA guru lain yang memegang lebih dari 1 mata pelajaran pada jadwal mereka.");
    console.log("Semua guru di sistem saat ini mengajar tepat 1 jenis mata pelajaran.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
