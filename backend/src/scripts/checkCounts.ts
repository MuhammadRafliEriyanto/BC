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
  console.log(User.modelName);

  const students = await Student.find().populate("userId").exec();
  const subs = await Subscription.find().exec();
  const pays = await Payment.find().exec();

  let count = 0;
  for (const s of students) {
    if (!s.userId) continue; // skip orphan

    const sid = String(s._id);
    const hasSub = subs.some(sub => String(sub.studentId) === sid);
    const hasPay = pays.some(pay => String(pay.studentId) === sid);
    
    // We want to find anyone who STILL doesn't have BOTH sub and pay
    // or who is lacking one of them?
    // Let's check who doesn't have an active subscription
    
    if (!hasSub) {
      const name = (s.userId as any).nama || "";
      const email = (s.userId as any).email || "";
      console.log("Missing Subscription:", name, email, s.branch, "HasPay:", hasPay);
      count++;
    }
  }

  console.log("Total Missing Subscription (excluding orphans):", count);
  mongoose.disconnect();
}
run();
