import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";
import { User } from "../models/User";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to DB");
    
    // Ensure models are registered
    console.log("Models loaded:", User.modelName, Student.modelName, Subscription.modelName, Payment.modelName);

    const allStudents = await Student.find().populate("userId").exec();
    const allSubscriptions = await Subscription.find().exec();
    const allPayments = await Payment.find().exec();

    const subsByStudentId = new Map<string, any[]>();
    for (const sub of allSubscriptions) {
      const sid = String(sub.studentId);
      if (!subsByStudentId.has(sid)) subsByStudentId.set(sid, []);
      subsByStudentId.get(sid)!.push(sub);
    }

    const paymentsByStudentId = new Map<string, any[]>();
    for (const pay of allPayments) {
      const sid = String(pay.studentId);
      if (!paymentsByStudentId.has(sid)) paymentsByStudentId.set(sid, []);
      paymentsByStudentId.get(sid)!.push(pay);
    }

    const noMembershipStudents = allStudents.filter(student => {
       const sid = String(student._id);
       const subs = subsByStudentId.get(sid) || [];
       const pays = paymentsByStudentId.get(sid) || [];
       return subs.length === 0 || pays.length === 0;
    });

    const outDir = path.join(__dirname, "output");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const csvLines = [
      "No,Kategori,StudentID,Nama,Email,Cabang,Kelas,Status Student,Academic Year,Punya User?,Indikasi"
    ];
    let counter = 1;

    for (const student of noMembershipStudents) {
      const hasUser = !!student.userId;
      const email = hasUser ? (student.userId as any).email || "" : "";
      const name = hasUser ? (student.userId as any).nama || "" : "ORPHAN";
      
      const isOrphan = !hasUser;
      const isDummy = email.includes("test") || email.includes("dummy") || email.includes("example.com") || name.toLowerCase().includes("dummy");
      
      let kategori = "Normal";
      let indikasi = "Import/Manual";
      
      if (isOrphan) {
        kategori = "Orphan";
        indikasi = "Data tidak sinkron (User dihapus)";
      } else if (isDummy) {
        kategori = "Dummy/Test";
        indikasi = "Data dummy (email)";
      } else if (email.includes("bimbel.local")) {
        indikasi = "Data import (domain lokal)";
      }

      // Escape quotes and wrap in quotes to prevent CSV breakage
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

      csvLines.push(
        [
          counter++,
          escapeCsv(kategori),
          escapeCsv(student.studentId || ""),
          escapeCsv(name),
          escapeCsv(email),
          escapeCsv(student.branch || ""),
          escapeCsv(student.className || ""),
          escapeCsv(student.status || ""),
          escapeCsv(student.academicYear || ""),
          hasUser ? "Ya" : "Tidak",
          escapeCsv(indikasi)
        ].join(",")
      );
    }

    const outputPath = path.join(outDir, "no-membership-students.csv");
    fs.writeFileSync(outputPath, csvLines.join("\n"), "utf-8");
    console.log(`Berhasil mengekspor ${noMembershipStudents.length} siswa ke ${outputPath}`);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
