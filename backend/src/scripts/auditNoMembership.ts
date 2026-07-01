import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
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

    // We consider "Belum Membership" as anyone who doesn't have an active or pending or expired membership
    // In our logic, "Belum Membership" is "none", which means accessStatus === "not_registered"
    // Wait, the logic in studentController returns "none" if there is no primarySub OR if resolveMembershipAccessStatus returns "not_registered".
    // So basically, no subscription, or no subscription with paymentStatus='paid'.
    
    // Let's just find all students.
    const allStudents = await Student.find().populate("userId").exec();
    
    // Get all subscriptions
    const allSubscriptions = await Subscription.find().exec();
    const subsByStudentId = new Map<string, any[]>();
    for (const sub of allSubscriptions) {
      const sid = String(sub.studentId);
      if (!subsByStudentId.has(sid)) subsByStudentId.set(sid, []);
      subsByStudentId.get(sid)!.push(sub);
    }

    // Get all payments
    const allPayments = await Payment.find().exec();
    const paymentsByStudentId = new Map<string, any[]>();
    for (const pay of allPayments) {
      const sid = String(pay.studentId);
      if (!paymentsByStudentId.has(sid)) paymentsByStudentId.set(sid, []);
      paymentsByStudentId.get(sid)!.push(pay);
    }

    // Filter "Belum Membership"
    const noMembershipStudents = allStudents.filter(student => {
       const subs = subsByStudentId.get(String(student._id)) || [];
       // Our logic from before:
       // primarySub = selectPrimarySubscription(subs);
       // if (!primarySub) -> none
       // if (primarySub && resolve... === not_registered) -> none
       // A quick proxy for "Belum Membership" is: they have NO paid subscriptions.
       const hasPaidSub = subs.some(s => s.paymentStatus === 'paid');
       return !hasPaidSub;
    });

    console.log(`Total Student: ${allStudents.length}`);
    console.log(`Total Belum Membership: ${noMembershipStudents.length}`);

    let noSubCount = 0;
    let noPaymentCount = 0;
    let academicYear2025Count = 0;
    let activeStudentCount = 0;
    let dummySeedCount = 0;
    let createdByAdminCount = 0; // proxy: no payment, no subscription, just raw student.
    let orphanCount = 0;

    const samples = [];

    for (const student of noMembershipStudents) {
      const sid = String(student._id);
      const subs = subsByStudentId.get(sid) || [];
      const pays = paymentsByStudentId.get(sid) || [];

      if (subs.length === 0) noSubCount++;
      if (pays.length === 0) noPaymentCount++;
      if (student.academicYear === "2025/2026") academicYear2025Count++;
      if (student.status === "Aktif") activeStudentCount++;
      if (!student.userId) orphanCount++;
      
      // Heuristic for dummy/seed: created before a certain date or has dummy email?
      const email = student.userId ? (student.userId as any).email : "";
      if (email.includes("example.com") || email.includes("test") || email.includes("dummy")) {
         dummySeedCount++;
      }

      if (subs.length === 0 && pays.length === 0) {
         createdByAdminCount++;
      }

      if (samples.length < 20) {
         samples.push({
            id: student.studentId,
            name: student.userId ? (student.userId as any).nama : "ORPHAN",
            email: email,
            subsCount: subs.length,
            paysCount: pays.length,
            academicYear: student.academicYear,
            status: student.status
         });
      }
    }

    console.log(`- Tidak punya Subscription: ${noSubCount}`);
    console.log(`- Tidak punya Payment: ${noPaymentCount}`);
    console.log(`- Data dummy/seed (heuristic): ${dummySeedCount}`);
    console.log(`- Dibuat lewat admin tanpa payment (0 sub, 0 pay): ${createdByAdminCount}`);
    console.log(`- Orphan (tanpa User): ${orphanCount}`);
    console.log(`- Academic Year 2025/2026: ${academicYear2025Count}`);
    console.log(`- Aktif (Student.status): ${activeStudentCount}`);

    console.log("\n20 Contoh Siswa:");
    console.table(samples);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
