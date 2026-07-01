import mongoose from "mongoose";
import dotenv from "dotenv";
import { Schedule } from "../models/Schedule";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

function parseDurationInHours(timeStr: string): number {
  if (!timeStr || !timeStr.includes("-")) return 1; // Default 1 jam
  try {
    const [start, end] = timeStr.split("-").map(s => s.trim());
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let duration = (endH + endM / 60) - (startH + startM / 60);
    return duration > 0 ? duration : 1;
  } catch {
    return 1;
  }
}

function getLevel(className: string): string {
  const upper = className.toUpperCase();
  if (upper.includes("SD")) return "SD";
  if (upper.includes("SMP")) return "SMP";
  if (upper.includes("SMA")) return "SMA";
  const numMatch = className.match(/\d+/);
  if (numMatch) {
    const n = parseInt(numMatch[0]);
    if (n >= 1 && n <= 6) return "SD";
    if (n >= 7 && n <= 9) return "SMP";
    if (n >= 10 && n <= 12) return "SMA";
  }
  return "Unknown";
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  // Get all teachers with populated user
  const teachers = await Teacher.find().populate({ path: "userId", select: "nama email role", model: User }).exec() as any[];
  
  // Get all active or ready schedules
  const allSchedules = await Schedule.find({}).exec();

  const auditData: any[] = [];

  for (const t of teachers) {
    const teacherId = t._id.toString();
    const name = t.userId?.nama || "Unknown Name";

    const mySchedules = allSchedules.filter(s => s.teacherId?.toString() === teacherId);
    
    const totalJadwal = mySchedules.length;
    let totalJam = 0;
    const levels = new Set<string>();
    const subjects = new Set<string>();
    const branches = new Set<string>();
    const classes = new Set<string>();

    for (const s of mySchedules) {
      totalJam += parseDurationInHours(s.time);
      levels.add(getLevel(s.className));
      subjects.add(s.subject);
      branches.add(s.branch);
      classes.add(s.className);
    }

    auditData.push({
      name,
      teacherId,
      totalJadwal,
      totalJam,
      levels: Array.from(levels).join(", ") || "-",
      subjects: Array.from(subjects).join(", ") || "-",
      branches: Array.from(branches).join(", ") || "-",
      classes: Array.from(classes).sort().join(", ") || "-"
    });
  }

  // Sort from highest load to lowest
  auditData.sort((a, b) => b.totalJam - a.totalJam || b.totalJadwal - a.totalJadwal);

  console.log("=== LAPORAN AUDIT BEBAN MENGAJAR GURU ===");
  auditData.forEach((data, index) => {
    console.log(`\n${index + 1}. Nama: ${data.name} (ID: ${data.teacherId})`);
    console.log(`   Total Jadwal    : ${data.totalJadwal} sesi`);
    console.log(`   Total Jam       : ${data.totalJam.toFixed(1)} jam / minggu`);
    console.log(`   Jenjang         : ${data.levels}`);
    console.log(`   Mata Pelajaran  : ${data.subjects}`);
    console.log(`   Cabang          : ${data.branches}`);
    console.log(`   Kelas           : ${data.classes}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
