import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { getOnlinePackageByKey, buildSubscriptionEndDate } from "../utils/subscription";
import { createPendingSubscriptionAndPayment } from "../utils/membershipPayments";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const packageArg = args.find(a => a.startsWith("--package="))?.split("=")[1] || "1-semester";
  const statusArg = args.find(a => a.startsWith("--status="))?.split("=")[1] || "paid";

  if (!["1-semester", "2-semester"].includes(packageArg)) {
    console.error("Package harus 1-semester atau 2-semester");
    process.exit(1);
  }

  if (!["paid", "pending"].includes(statusArg)) {
    console.error("Status harus paid atau pending");
    process.exit(1);
  }

  console.log(`MODE: ${isApply ? "APPLY" : "DRY-RUN"}`);
  console.log(`PACKAGE: ${packageArg}`);
  console.log(`STATUS: ${statusArg}\n`);

  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to DB");

    // Ensure models are registered for populate
    console.log("Models loaded:", User.modelName, Student.modelName, Subscription.modelName, Payment.modelName);

    const packageDef = getOnlinePackageByKey(packageArg);
    if (!packageDef) {
      throw new Error(`Package ${packageArg} tidak ditemukan`);
    }

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

    let targetCount = 0;
    let orphanCount = 0;
    const samples = [];

    for (const student of allStudents) {
      const sid = String(student._id);
      const subs = subsByStudentId.get(sid) || [];
      const pays = paymentsByStudentId.get(sid) || [];

      if (subs.length === 0 && pays.length === 0) {
        if (!student.userId) {
          orphanCount++;
          continue;
        }

        const name = (student.userId as any).nama || "";
        const email = (student.userId as any).email || "";

        const isDummy = email.includes("test") || email.includes("dummy") || email.includes("example.com");

        if (isDummy) {
          continue; // Skip dummy
        }

        // Target Adiwerna branch specifically for this run
        if (student.branch !== "Adiwerna") {
          continue;
        }

        targetCount++;

        if (samples.length < 50) {
          samples.push({
            studentId: student.studentId,
            name: name,
            email: email,
            action: `Create ${statusArg} ${packageArg}`
          });
        }

        if (isApply) {
          const { subscription, payment } = await createPendingSubscriptionAndPayment({
            user: student.userId as any,
            student,
            packageDefinition: packageDef,
            source: "admin", // mark as created by admin
            createdByAdminId: null // or admin user id if available
          });

          if (statusArg === "paid") {
            payment.status = "paid";
            payment.paidAt = new Date();
            
            subscription.paymentStatus = "paid";
            subscription.status = "active";
            subscription.startDate = new Date();
            subscription.endDate = buildSubscriptionEndDate(subscription.startDate, subscription.durationMonth);
            
            await Promise.all([payment.save(), subscription.save()]);
          }
        }
      }
    }

    console.log(`\n=== HASIL DRY-RUN / EXECUTION ===`);
    console.log(`- Jumlah Siswa Target: ${targetCount}`);
    console.log(`- Jumlah Siswa Orphan Dilewati: ${orphanCount}`);
    console.log(`- Package Digunakan: ${packageArg}`);
    console.log(`- Status yang Dibuat: ${statusArg}`);

    console.log(`\n=== 20 CONTOH SISWA TARGET ===`);
    console.table(samples);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
