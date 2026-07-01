import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, ".env") });

import { User } from "./src/models/User";
import { Student } from "./src/models/Student";
import { Subscription } from "./src/models/Subscription";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const students = await Student.find().exec();
    console.log("Total Siswa:", students.length);
    
    let withSub = 0;
    let withoutSub = 0;
    
    const subPackages: Record<string, number> = {};
    
    for (const student of students) {
      const sub = await Subscription.findOne({ studentId: student._id }).exec();
      if (sub) {
        withSub++;
        const pkg = sub.packageName || "Unknown";
        subPackages[pkg] = (subPackages[pkg] || 0) + 1;
      } else {
        withoutSub++;
      }
    }
    
    console.log("Siswa dengan paket/semester:", withSub);
    console.log("Siswa TANPA paket/semester:", withoutSub);
    console.log("Rincian paket:", subPackages);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();