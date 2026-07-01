/* eslint-disable @typescript-eslint/no-explicit-any */
import * as xlsx from "xlsx";
import mongoose from "mongoose";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const excelFile = "D:\\Skripsi\\Next Js\\bimbel-new\\DATA GURU BC.xlsx";
  const workbook = xlsx.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const rows = xlsx.utils.sheet_to_json<any>(sheet, { range: 1 });
  
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");

  const teachers = await Teacher.find().populate({ path: "userId", model: User }).exec() as any[];
  
  let updatedCount = 0;
  
  for (const row of rows) {
    if (row["__EMPTY_1"] === "NAMA" || row["__EMPTY_1"] === undefined) continue;

    const rawName = row["__EMPTY_1"] || "";
    const name = rawName.toString().trim().toLowerCase();
    
    const kelasRaw = row["__EMPTY_4"];
    if (!name || !kelasRaw) continue;

    // parse grades
    const capableGrades = String(kelasRaw).split(",").map(val => val.trim()).filter(Boolean);

    const teacherObj = teachers.find(t => {
      const dbName = t.userId?.nama?.trim().toLowerCase() || "";
      if (!dbName || !name) return false;
      return dbName === name || dbName.includes(name) || name.includes(dbName);
    });

    if (teacherObj) {
      teacherObj.capableGrades = capableGrades;
      await teacherObj.save();
      updatedCount++;
      console.log(`Updated ${rawName} with grades: ${capableGrades.join(", ")}`);
    }
  }

  console.log(`\nDONE. Updated ${updatedCount} teachers.`);
  await mongoose.disconnect();
}

run().catch(console.error);
