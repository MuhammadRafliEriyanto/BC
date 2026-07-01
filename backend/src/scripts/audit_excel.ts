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
  
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log("EXCEL HEADERS:");
  console.log(data[1]);
  
  const rows = xlsx.utils.sheet_to_json<any>(sheet, { range: 1 });
  console.log(`TOTAL ROWS IN EXCEL: ${rows.length}`);
  
  if (rows.length > 0) {
    console.log("FIRST 3 ROWS EXCEL:");
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
  }

  // Connecting to DB to get teachers
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");

  const teachers = await Teacher.find().populate({ path: "userId", model: User }).lean().exec() as any[];
  
  console.log(`TOTAL TEACHERS IN DB: ${teachers.length}`);

  let matched = 0;
  const unmatched = [];
  const mapels = new Set();
  const classes = new Set();
  const matchedTeachers = [];
  
  for (const row of rows) {
    if (row["__EMPTY_1"] === "NAMA" || row["__EMPTY_1"] === undefined) continue;

    const rawName = row["__EMPTY_1"] || "";
    const name = rawName.toString().trim().toLowerCase();
    
    // gather mapel and class
    const mapel = row["__EMPTY_2"];
    if (mapel) mapels.add(mapel);
    const kelas = row["__EMPTY_4"];
    if (kelas) classes.add(kelas);

    if (!name) continue;

    const teacherObj = teachers.find(t => {
      const dbName = t.userId?.nama?.trim().toLowerCase() || "";
      // ignore empty string matching
      if (!dbName || !name) return false;
      return dbName === name || dbName.includes(name) || name.includes(dbName);
    });

    if (teacherObj) {
      matched++;
      matchedTeachers.push({
        excelName: rawName,
        dbName: teacherObj.userId?.nama,
        excelMapel: mapel,
        dbMapel: teacherObj.subject,
        excelKelas: kelas,
        dbClassList: teacherObj.classList
      });
    } else {
      unmatched.push(rawName);
    }
  }

  console.log(`\nMATCHED TEACHERS: ${matched}`);
  if (matchedTeachers.length > 0) {
    console.log("FIRST 5 MATCHED TEACHERS:");
    console.log(JSON.stringify(matchedTeachers.slice(0, 5), null, 2));
  }

  console.log(`\nUNMATCHED TEACHERS: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("FIRST 10 UNMATCHED:");
    console.log(unmatched.slice(0, 10));
  }
  
  console.log("\nFOUND MAPEL IN EXCEL:");
  console.log(Array.from(mapels));
  
  console.log("\nFOUND KELAS IN EXCEL:");
  console.log(Array.from(classes));

  await mongoose.disconnect();
}

run().catch(console.error);
