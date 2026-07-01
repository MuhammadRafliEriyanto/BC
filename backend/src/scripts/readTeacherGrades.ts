import mongoose from "mongoose";
import dotenv from "dotenv";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  // Retrieve all teachers and populate their user data
  const teachers = await Teacher.find()
    .populate({ path: "userId", select: "nama email role", model: User })
    .exec() as any[];

  console.log("=== DATA AUDIT GURU DAN KELAS MENGAJAR ===\n");
  
  let index = 1;
  for (const t of teachers) {
    const name = t.userId?.nama || "Tanpa Nama";
    const email = t.userId?.email || "Tanpa Email";
    const grades = (t.capableGrades && t.capableGrades.length > 0) 
      ? t.capableGrades.join(", ") 
      : "Belum Diatur";

    console.log(`${index}. Nama: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Kelas: ${grades}`);
    console.log("--------------------------------------------------");
    index++;
  }

  console.log(`\nTotal Guru: ${teachers.length}`);
  
  await mongoose.disconnect();
}

run().catch(console.error);
