import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";
import { AttendanceSession } from "../models/AttendanceSession";
import { ClassMaterial } from "../models/ClassMaterial";
import { ClassTask } from "../models/ClassTask";

config({ path: resolve(__dirname, "../../.env") });

async function auditData() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to database...");

    console.log("\n=== AUDIT ABSENSI (AttendanceSession) ===");
    console.log("Mencari pertemuan (Class + Subject + Date) yang memiliki lebih dari 1 sesi absen...");
    const attendanceAgg = await AttendanceSession.aggregate([
      {
        $group: {
          _id: { classId: "$classId", subject: "$subject", date: "$date" },
          count: { $sum: 1 },
          sessionIds: { $push: "$sessionId" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    if (attendanceAgg.length === 0) {
      console.log("Tidak ditemukan duplikasi sesi absensi pada hari yang sama.");
    } else {
      attendanceAgg.forEach(a => {
        console.log(`- Kelas: ${a._id.classId} | Mapel: ${a._id.subject} | Tgl: ${a._id.date} => ${a.count} Sesi (${a.sessionIds.join(', ')})`);
      });
    }

    console.log("\n=== AUDIT MATERI (ClassMaterial) ===");
    console.log("Mencari materi pada pertemuan (Class + Subject + MeetingNumber) yang memiliki lebih dari 1 data...");
    const materialAgg = await ClassMaterial.aggregate([
      {
        $group: {
          _id: { classId: "$classId", subject: "$subject", meetingNumber: "$meetingNumber" },
          count: { $sum: 1 },
          materialIds: { $push: "$materialId" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (materialAgg.length === 0) {
      console.log("Tidak ditemukan duplikasi materi pada pertemuan yang sama.");
    } else {
      materialAgg.forEach(m => {
        console.log(`- Kelas: ${m._id.classId} | Mapel: ${m._id.subject} | Pertemuan Ke: ${m._id.meetingNumber} => ${m.count} Materi (${m.materialIds.join(', ')})`);
      });
    }

    console.log("\n=== AUDIT TUGAS (ClassTask) ===");
    console.log("Mencari tugas pada pertemuan (Class + Subject + MeetingNumber) yang memiliki lebih dari 1 data...");
    const taskAgg = await ClassTask.aggregate([
      {
        $group: {
          _id: { classId: "$classId", subject: "$subject", meetingNumber: "$meetingNumber" },
          count: { $sum: 1 },
          taskIds: { $push: "$taskId" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (taskAgg.length === 0) {
      console.log("Tidak ditemukan duplikasi tugas pada pertemuan yang sama.");
    } else {
      taskAgg.forEach(t => {
        console.log(`- Kelas: ${t._id.classId} | Mapel: ${t._id.subject} | Pertemuan Ke: ${t._id.meetingNumber} => ${t.count} Tugas (${t.taskIds.join(', ')})`);
      });
    }

    console.log("\nAudit selesai.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

auditData();
