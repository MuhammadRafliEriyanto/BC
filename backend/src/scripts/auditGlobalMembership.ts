import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";
import { User } from "../models/User";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected");
  console.log(User.modelName); // ensure user loaded

  const students = await Student.find().exec();
  const subs = await Subscription.find().exec();
  const pays = await Payment.find().exec();

  const branchStats: Record<string, any> = {};

  let globalStats = {
    totalStudents: students.length,
    totalWithMembership: 0,
    totalWithoutMembership: 0,
    subActive: 0,
    subPending: 0,
    subExpired: 0,
    package1Sem: 0,
    package2Sem: 0,
  };

  const getBranch = (name: string) => {
    if (!branchStats[name]) {
      branchStats[name] = {
        totalStudents: 0,
        subActive: 0,
        subPending: 0,
        subExpired: 0,
        package1Sem: 0,
        package2Sem: 0,
        payPaid: 0,
        payPending: 0,
        payFailed: 0,
        revenue: 0,
      };
    }
    return branchStats[name];
  };

  const studentSubMap = new Map();
  for (const s of subs) {
    if (!studentSubMap.has(String(s.studentId))) {
      studentSubMap.set(String(s.studentId), []);
    }
    studentSubMap.get(String(s.studentId)).push(s);
    
    if (s.status === "active") globalStats.subActive++;
    if (s.status === "pending") globalStats.subPending++;
    if (s.status === "expired") globalStats.subExpired++;
    if (s.packageKey === "1-semester") globalStats.package1Sem++;
    if (s.packageKey === "2-semester") globalStats.package2Sem++;
  }

  for (const s of students) {
    const branch = getBranch(s.branch);
    branch.totalStudents++;
    
    const sid = String(s._id);
    const hasMembership = studentSubMap.has(sid);
    if (hasMembership) {
      globalStats.totalWithMembership++;
    } else {
      globalStats.totalWithoutMembership++;
    }

    const sSubs = studentSubMap.get(sid) || [];
    for (const sub of sSubs) {
      if (sub.status === "active") branch.subActive++;
      if (sub.status === "pending") branch.subPending++;
      if (sub.status === "expired") branch.subExpired++;
      if (sub.packageKey === "1-semester") branch.package1Sem++;
      if (sub.packageKey === "2-semester") branch.package2Sem++;
    }

    const sPays = pays.filter(p => String(p.studentId) === sid);
    for (const p of sPays) {
      if (p.status === "paid") {
        branch.payPaid++;
        branch.revenue += p.amount;
      }
      if (p.status === "pending") branch.payPending++;
      if (p.status === "failed") branch.payFailed++;
    }
  }

  const result = {
    globalStats,
    branchStats
  };

  const fs = require("fs");
  fs.writeFileSync("audit_result.json", JSON.stringify(result, null, 2));

  console.log("Audit complete. Data saved to audit_result.json");
  mongoose.disconnect();
}
run();
