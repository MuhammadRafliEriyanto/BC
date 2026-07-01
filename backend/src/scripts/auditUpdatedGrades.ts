/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  
  const teachers = await Teacher.find()
    .populate({ path: "userId", model: User, select: "nama" })
    .exec() as any[];
    
  let matched = 0;
  let unmatched = 0;
  
  for (const t of teachers) {
    if (t.capableGrades && t.capableGrades.length > 0) {
      matched++;
    } else {
      unmatched++;
    }
  }

  console.log(`Jumlah Teacher berhasil diupdate: ${matched}`);
  console.log(`Jumlah Teacher gagal match / belum diupdate: ${unmatched}\n`);
  
  console.log("Contoh 5 dokumen Teacher setelah update:\n");
  
  for (let i = 0; i < Math.min(5, teachers.length); i++) {
    const t = teachers[i];
    console.log(JSON.stringify({
      teacherId: t.teacherId,
      nama: t.userId?.nama || "Unknown",
      capableGrades: t.capableGrades
    }, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
