import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { getOnlinePackageByKey, resolveMembershipAccessStatus } from "../utils/subscription";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");

  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");
  console.log("Mode:", isApply ? "APPLY" : "DRY-RUN");
  console.log("Models loaded:", User.modelName, Student.modelName, Subscription.modelName, Payment.modelName);

  const auditDataPath = path.join(__dirname, "../../smart_audit_result.json");
  if (!fs.existsSync(auditDataPath)) {
    console.error("smart_audit_result.json not found!");
    process.exit(1);
  }

  const auditData = JSON.parse(fs.readFileSync(auditDataPath, "utf-8"));
  const targetStudentIds: string[] = [];

  for (const branch in auditData) {
    for (const rec of auditData[branch].recommendations) {
      targetStudentIds.push(rec.studentId);
    }
  }

  console.log(`Found ${targetStudentIds.length} target students from audit result.`);

  const packageDef = getOnlinePackageByKey("2-semester");
  if (!packageDef) throw new Error("2-semester package definition not found in system.");

  let processedCount = 0;

  for (const studentId of targetStudentIds) {
    const student = await Student.findOne({ studentId }).exec();
    if (!student) {
      console.log(`[WARN] Student ${studentId} not found in DB.`);
      continue;
    }

    const sub = await Subscription.findOne({ studentId: student._id, packageKey: "1-semester", status: { $in: ["active", "pending"] } }).exec();
    if (!sub) {
      console.log(`[WARN] No active 1-semester subscription found for ${studentId}.`);
      continue;
    }

    const payment = await Payment.findOne({ subscriptionId: sub._id }).exec();
    
    // Calculate new values
    const newEndDate = sub.startDate ? new Date(sub.startDate) : new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 12);
    
    const nextAccessStatus = resolveMembershipAccessStatus({
      paymentStatus: sub.paymentStatus,
      status: sub.status,
      startDate: sub.startDate,
      endDate: newEndDate
    } as any);
    const newStatus =
      nextAccessStatus === "not_registered" ? "pending" : nextAccessStatus;

    console.log(`\n--- TARGET: ${studentId} ---`);
    console.log("BEFORE:");
    console.log(`  Sub: package=${sub.packageKey}, dur=${sub.durationMonth}, end=${sub.endDate?.toISOString().split('T')[0]}, status=${sub.status}`);
    if (payment) {
      console.log(`  Pay: package=${payment.packageKey}, dur=${payment.durationMonth}, amount=${payment.amount}`);
    }

    console.log("AFTER:");
    console.log(`  Sub: package=${packageDef.packageKey}, dur=12, end=${newEndDate.toISOString().split('T')[0]}, status=${newStatus}`);
    if (payment) {
      console.log(`  Pay: package=${packageDef.packageKey}, dur=12, amount=${packageDef.amount}`);
    }

    if (isApply) {
      // Update Subscription
      sub.packageKey = packageDef.packageKey;
      sub.durationMonth = 12;
      sub.endDate = newEndDate;
      sub.status = newStatus;
      await sub.save();

      // Update Payment
      if (payment) {
        payment.packageKey = packageDef.packageKey;
        payment.packageName = packageDef.packageName || "2 Semester (1 Tahun)";
        payment.durationMonth = 12;
        payment.amount = packageDef.amount;
        await payment.save();
      }
    }

    processedCount++;
  }

  console.log(`\nSuccessfully processed ${processedCount} students.`);
  
  mongoose.disconnect();
}

run();
