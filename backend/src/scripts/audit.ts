/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import * as xlsx from "xlsx";
import dotenv from "dotenv";
import path from "path";

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function runAudit() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("No MONGO_URI found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");
    
    // Read Teacher from DB
    // Import Teacher and User models or just query generic
    const TeacherModel = mongoose.model("Teacher", new mongoose.Schema({
        teacherId: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        subject: String,
        classList: String
    }), "teachers");
    
    mongoose.model("User", new mongoose.Schema({
        nama: String,
        email: String
    }), "users");

    const teachersInDb = await TeacherModel.find({}).populate<{ userId: any }>("userId").lean();
    console.log(`Found ${teachersInDb.length} teachers in DB.`);

    // Read Schedule from DB
    const ScheduleModel = mongoose.model("Schedule", new mongoose.Schema({
        className: String,
        subject: String,
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
    }), "schedules");
    const schedulesInDb = await ScheduleModel.find({}).lean();
    console.log(`Found ${schedulesInDb.length} schedules in DB.`);

    // Read Excel
    const excelPath = "C:\\Users\\LENOVO\\Downloads\\DATA GURU BC.xlsx";
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(sheet) as any[];
    console.log(`Read ${excelData.length} rows from Excel.`);

    // Audit Match
    const report = {
      matched: [] as any[],
      unmatched: [] as any[],
      excelMapelVsTeacherSubject: [] as any[],
      excelKelasVsSchedule: [] as any[]
    };

    for (const row of excelData) {
      const namaExcel = String(row["NAMA"] || "").trim().toLowerCase();
      const mapelExcel = String(row["BIDANG / MAPEL"] || row["BIDANG"] || row["MAPEL"] || "").trim();
      const kelasExcel = String(row["KELAS"] || row["KELAS YANG DIAJAR"] || "").trim();
      if (!namaExcel) continue;

      const matchedDb = teachersInDb.find(t => t.userId && t.userId.nama && t.userId.nama.toLowerCase() === namaExcel);
      
      if (matchedDb) {
        report.matched.push({
          excelName: row["NAMA"],
          dbName: matchedDb.userId.nama,
          teacherId: matchedDb.teacherId
        });
        
        report.excelMapelVsTeacherSubject.push({
          teacherName: matchedDb.userId.nama,
          excelMapel: mapelExcel,
          dbSubject: matchedDb.subject
        });

        // Find schedules for this teacher
        const teacherSchedules = schedulesInDb.filter(s => String(s.teacherId) === String(matchedDb._id));
        const dbClasses = [...new Set(teacherSchedules.map(s => s.className))];

        report.excelKelasVsSchedule.push({
          teacherName: matchedDb.userId.nama,
          excelKelas: kelasExcel,
          dbScheduleClasses: dbClasses
        });
      } else {
        report.unmatched.push({
          excelName: row["NAMA"]
        });
      }
    }

    console.log("=== AUDIT REPORT ===");
    console.log(JSON.stringify({
      totalExcel: excelData.length,
      matchedCount: report.matched.length,
      unmatchedCount: report.unmatched.length,
      matchedSample: report.matched.slice(0, 3),
      unmatchedSample: report.unmatched.slice(0, 3),
      mapelSample: report.excelMapelVsTeacherSubject.slice(0, 3),
      kelasSample: report.excelKelasVsSchedule.slice(0, 3)
    }, null, 2));

    // Full mismatch list
    console.log("\nFull unmatched from Excel:", report.unmatched.map(u => u.excelName).join(", "));
    console.log("\nAll Excel Mapel vs DB Subject:");
    report.excelMapelVsTeacherSubject.forEach(m => console.log(`- ${m.teacherName}: Excel(${m.excelMapel}) vs DB(${m.dbSubject})`));
    console.log("\nAll Excel Kelas vs DB Schedule Classes:");
    report.excelKelasVsSchedule.forEach(c => console.log(`- ${c.teacherName}: Excel(${c.excelKelas}) vs DB Schedules([${c.dbScheduleClasses.join(', ')}])`));

  } catch (error) {
    console.error("Audit error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAudit();
