import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Payment } from "../models/Payment";
import { Student } from "../models/Student";
import { createPendingSubscriptionAndPayment } from "../utils/membershipPayments";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected");

  const student = await Student.findOne({ studentId: "STD-186" }).populate("userId").exec();
  if (!student) {
    console.log("Student not found");
    return;
  }

  // Delete orphaned payment
  const delResult = await Payment.deleteMany({ studentId: student._id }).exec();
  console.log("Deleted old payments:", delResult.deletedCount);

  // Re-run the membership creation logic for this student
  const packageDef = { packageKey: "1-semester" }; // minimal mock
  const { subscription, payment } = await createPendingSubscriptionAndPayment({
    user: student.userId as any,
    student,
    packageDefinition: { 
       packageKey: "1-semester", 
       durationMonth: 6, 
       amount: 1850000, 
       packageName: "1 Semester", 
       subscriptionCode: "1-SMT" 
    } as any,
    source: "admin",
    createdByAdminId: null
  });

  payment.status = "paid";
  payment.paidAt = new Date();
  
  subscription.paymentStatus = "paid";
  subscription.status = "active";
  subscription.startDate = new Date();
  
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  subscription.endDate = d;

  await Promise.all([payment.save(), subscription.save()]);

  console.log("Successfully created membership for STD-186");

  mongoose.disconnect();
}

run();
