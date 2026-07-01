import mongoose from "mongoose";
import dotenv from "dotenv";
import { Schedule } from "../models/Schedule";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  console.log("=== 1. AUDIT SEMUA JADWAL SD 1-6 ===");
  const sdSchedules = await Schedule.find({
    className: { $regex: /SD|1|2|3|4|5|6/i }
  }).populate({ path: "teacherId", populate: { path: "userId" } }).exec();

  const sd1to6Schedules = sdSchedules.filter(s => {
    // Exact match for SD 1-6
    return /SD\s*[1-6]/i.test(s.className) || /^[1-6]$/.test(s.className.trim());
  });

  const schedulesByClass: Record<string, any[]> = {};
  sd1to6Schedules.forEach(s => {
    if (!schedulesByClass[s.className]) schedulesByClass[s.className] = [];
    schedulesByClass[s.className].push(s);
  });

  for (const [cls, scheds] of Object.entries(schedulesByClass)) {
    console.log(`\nKelas: ${cls}`);
    scheds.forEach(s => {
      const tName = s.teacherId ? (s.teacherId as any).userId?.nama : "Unassigned";
      console.log(` - [${s.scheduleId}] Mapel: ${s.subject} | Guru: ${tName} | Hari: ${s.day} ${s.time} | Cabang: ${s.branch}`);
    });
  }

  console.log("\n=== 2. AUDIT MAPEL YANG DIPEGANG EKA WIDIYANA ===");
  const userEka = await User.findOne({ email: "guru005@bimbel.local" }).exec();
  const teacherEka = await Teacher.findOne({ userId: userEka?._id }).exec();
  const ekaSchedules = await Schedule.find({ teacherId: teacherEka?._id }).exec();
  
  if (ekaSchedules.length === 0) {
    console.log("Eka Widiyana tidak memiliki jadwal saat ini.");
  } else {
    ekaSchedules.forEach(s => {
      console.log(` - [${s.scheduleId}] Mapel: ${s.subject} | Kelas: ${s.className} | Hari: ${s.day} ${s.time} | Cabang: ${s.branch}`);
    });
  }

  console.log("\n=== 3. ANALISIS KONSEP GURU MAPEL VS GURU KELAS ===");
  // We check if a single class has multiple teachers for different subjects
  let isGuruMapel = false;
  for (const [cls, scheds] of Object.entries(schedulesByClass)) {
    const teacherMap = new Set();
    scheds.forEach(s => {
      const tName = s.teacherId ? (s.teacherId as any).userId?.nama : "Unassigned";
      teacherMap.add(tName);
    });
    if (teacherMap.size > 1) {
      isGuruMapel = true;
      console.log(`Kelas ${cls} diajar oleh lebih dari 1 guru (${Array.from(teacherMap).join(", ")}).`);
    }
  }

  if (isGuruMapel) {
    console.log("\nKesimpulan: Sistem menggunakan konsep GURU MAPEL (Subject Teacher). 1 kelas bisa memiliki banyak guru berdasarkan mata pelajaran.");
  } else {
    console.log("\nKesimpulan: Sistem mungkin menggunakan konsep GURU UTAMA (Homeroom Teacher), atau data jadwal saat ini sangat minim sehingga 1 kelas baru diajar oleh 1 guru.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
