import mongoose from "mongoose";
import dotenv from "dotenv";
import { Schedule } from "../models/Schedule";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const userEka = await User.findOne({ email: "guru005@bimbel.local" }).exec();
  const teacherEka = await Teacher.findOne({ userId: userEka?._id }).exec();

  console.log("=== JADWAL EKA WIDIYANA SAAT INI ===");
  const ekaSchedules = await Schedule.find({ teacherId: teacherEka?._id }).populate({ path: "teacherId", populate: { path: "userId", model: User } }).exec();
  
  if (ekaSchedules.length === 0) {
    console.log("Tidak ada jadwal yang terdaftar untuk Eka Widiyana.");
  } else {
    ekaSchedules.forEach(s => {
      const tName = s.teacherId ? (s.teacherId as any).userId?.nama : "Unknown";
      console.log(`- scheduleId : ${s.scheduleId}`);
      console.log(`  className  : ${s.className}`);
      console.log(`  subject    : ${s.subject}`);
      console.log(`  teacherName: ${tName}`);
      console.log(`  day        : ${s.day}`);
      console.log(`  time       : ${s.time}`);
      console.log(`  branch     : ${s.branch}`);
      console.log(`  room       : ${s.room}\n`);
    });
  }

  console.log("=== KESIMPULAN ===");
  console.log(`1. Berapa total jadwal milik Eka saat ini: ${ekaSchedules.length} jadwal`);

  const sd2 = await Schedule.find({ className: { $regex: /SD\s*2/i } }).exec();
  console.log(`2. Apakah SD 2 sudah punya jadwal: ${sd2.length > 0 ? "Sudah (" + sd2.length + " jadwal)" : "Belum"}`);

  const sd3 = await Schedule.find({ className: { $regex: /SD\s*3/i } }).exec();
  console.log(`3. Apakah SD 3 sudah punya jadwal: ${sd3.length > 0 ? "Sudah (" + sd3.length + " jadwal)" : "Belum"}`);

  const sd5 = await Schedule.find({ className: { $regex: /SD\s*5/i }, teacherId: teacherEka?._id }).exec();
  console.log(`4. Apakah SD 5 sudah dipindahkan ke Eka: ${sd5.length > 0 ? "Sudah" : "Belum"}`);

  const sd6 = await Schedule.find({ className: { $regex: /SD\s*6/i }, teacherId: teacherEka?._id }).exec();
  console.log(`5. Apakah SD 6 sudah dipindahkan ke Eka: ${sd6.length > 0 ? "Sudah" : "Belum"}`);

  await mongoose.disconnect();
}

run().catch(console.error);
