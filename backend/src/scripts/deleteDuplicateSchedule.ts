import mongoose from "mongoose";
import dotenv from "dotenv";
import { Schedule } from "../models/Schedule";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  Teacher.find().limit(1);
  User.find().limit(1);

  // Hapus SCH-056
  const deleted = await Schedule.deleteOne({ scheduleId: "SCH-056" }).exec();
  if (deleted.deletedCount > 0) {
    console.log("Berhasil menghapus jadwal SCH-056.");
  } else {
    console.log("Jadwal SCH-056 tidak ditemukan.");
  }

  console.log("\n=== AUDIT JADWAL FINAL EKA WIDIYANA ===");
  const userEka = await User.findOne({ email: "guru005@bimbel.local" }).exec();
  const teacherEka = await Teacher.findOne({ userId: userEka?._id }).exec();
  
  if (teacherEka) {
    const ekaSchedules = await Schedule.find({ teacherId: teacherEka._id }).exec();
    
    // Kelompokkan per kelas dan cabang
    const map = new Map();
    
    ekaSchedules.forEach(s => {
      console.log(`- ${s.scheduleId} | ${s.className} | ${s.subject} | ${s.branch} | ${s.day} ${s.time} | ${s.room}`);
      
      if (s.subject === "Guru Kelas SD") {
        const key = `${s.className} ${s.branch}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });

    console.log("\n=== VERIFIKASI KUOTA GURU KELAS SD ===");
    const sdClasses = ["SD 2 Slawi", "SD 3 Slawi", "SD 2 Adiwerna", "SD 3 Adiwerna"];
    for (const cls of sdClasses) {
      const count = map.get(cls) || 0;
      console.log(`- ${cls}: ${count} jadwal`);
      if (count !== 1) {
        console.log(`  [PERINGATAN] Kelas ${cls} memiliki ${count} jadwal Guru Kelas SD! (Diharapkan tepat 1)`);
      } else {
        console.log(`  [AMAN] Kuota sesuai.`);
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
