import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";
import { User } from "../models/User";
import fs from "fs";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const CLASS_PRIORITY: Record<string, number> = {
  "SMA 12": 1,
  "SMA 11": 2,
  "SMA Kelas 11": 2,
  "SMA 10": 3,
  "SMP 9": 4,
  "SMP 8": 5,
  "SMP 7": 6,
  "SD 6": 7,
  "SD 5": 8,
  "SD 4": 9,
  "SD 3": 10,
  "SD 2": 11,
  "SD 1": 12,
};

function getPriority(className: string): number {
  const norm = className.trim();
  return CLASS_PRIORITY[norm] || 99;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected");
  console.log(User.modelName); 

  const students = await Student.find().populate("userId").exec();
  const subs = await Subscription.find().exec();

  const branchData: Record<string, any> = {};

  // Group by branch
  for (const s of students) {
    if (!s.userId) continue; // skip orphans

    const branch = s.branch;
    if (!branchData[branch]) {
      branchData[branch] = {
        totalStudents: 0,
        sub1Sem: 0,
        sub2Sem: 0,
        classDistribution: {},
        students: []
      };
    }

    const b = branchData[branch];
    const sid = String(s._id);
    const sSubs = subs.filter(sub => String(sub.studentId) === sid);
    const activeSub = sSubs.find(sub => sub.status === "active" || sub.status === "pending");

    if (activeSub) {
      b.totalStudents++;
      
      const pKey = activeSub.packageKey;
      if (pKey === "1-semester") b.sub1Sem++;
      if (pKey === "2-semester") b.sub2Sem++;

      const cName = s.className || "Unknown";
      b.classDistribution[cName] = (b.classDistribution[cName] || 0) + 1;

      b.students.push({
        _id: sid,
        studentId: s.studentId,
        name: (s.userId as any).nama,
        className: cName,
        packageKey: pKey,
        priority: getPriority(cName),
        subscriptionId: activeSub._id
      });
    }
  }

  const recommendations: any[] = [];
  const auditReport: any = {};

  for (const branch in branchData) {
    const b = branchData[branch];
    const total = b.totalStudents;
    const target2Sem = Math.round(total * 0.2);
    
    // Sort students by priority
    b.students.sort((x: any, y: any) => {
       if (x.priority !== y.priority) return x.priority - y.priority;
       return x.name.localeCompare(y.name);
    });

    const deficit = target2Sem - b.sub2Sem;
    let upgradedCount = 0;
    const branchRecs = [];

    if (deficit > 0) {
      // Find 1-semester students to upgrade
      for (const s of b.students) {
        if (s.packageKey === "1-semester" && upgradedCount < deficit) {
          branchRecs.push({
            studentId: s.studentId,
            name: s.name,
            className: s.className,
            from: "1-semester",
            to: "2-semester"
          });
          upgradedCount++;
        }
      }
    }

    auditReport[branch] = {
      totalStudents: total,
      current1Sem: b.sub1Sem,
      current2Sem: b.sub2Sem,
      target1Sem: total - target2Sem,
      target2Sem: target2Sem,
      deficit2Sem: deficit,
      classDistribution: b.classDistribution,
      recommendations: branchRecs
    };
  }

  fs.writeFileSync("smart_audit_result.json", JSON.stringify(auditReport, null, 2));
  console.log("Audit complete. Data saved to smart_audit_result.json");
  mongoose.disconnect();
}

run();
