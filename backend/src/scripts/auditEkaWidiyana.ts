import mongoose from "mongoose";
import dotenv from "dotenv";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { Schedule } from "../models/Schedule";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  // Find Eka Widiyana
  const userEka = await User.findOne({ email: "guru005@bimbel.local" }).exec();
  if (!userEka) {
    console.log("Eka Widiyana user not found.");
    return;
  }

  const teacherEka = await Teacher.findOne({ userId: userEka._id }).exec();
  if (!teacherEka) {
    console.log("Eka Widiyana teacher profile not found.");
    return;
  }

  console.log(`Teacher found: ${userEka.nama} (ID: ${teacherEka._id})`);
  console.log(`Current capableGrades: ${teacherEka.capableGrades?.join(", ")}`);
  
  // Find her current schedules
  const ekaSchedules = await Schedule.find({ teacherId: teacherEka._id }).exec();
  console.log(`\nSchedules for Eka Widiyana: ${ekaSchedules.length}`);
  ekaSchedules.forEach(s => {
    console.log(` - ${s.scheduleId} | ${s.day} ${s.time} | ${s.subject} | ${s.className} | ${s.branch}`);
  });

  // Find all Bahasa Inggris schedules for SD (kelas 1-6)
  // Assuming className contains "SD" or just numbers.
  const allEnglishSchedules = await Schedule.find({ subject: "Bahasa Inggris" }).populate({ path: "teacherId", populate: { path: "userId" } }).exec();
  
  console.log(`\nAll Bahasa Inggris Schedules:`);
  allEnglishSchedules.forEach(s => {
    // Check if SD class
    if (s.className.includes("SD") || /^[1-6]$/.test(s.className.trim())) {
      const tName = s.teacherId ? (s.teacherId as any).userId?.nama : "Unassigned";
      console.log(` - ${s.scheduleId} | ${s.day} ${s.time} | ${s.className} | ${s.branch} | Teacher: ${tName}`);
    }
  });

  await mongoose.disconnect();
}

run().catch(console.error);
