import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";
import { Student } from "../models/Student";
import { User } from "../models/User";
import { getOnlinePackageByKey } from "../utils/subscription";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");

  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB, Mode:", isApply ? "APPLY" : "DRY-RUN");
  
  // ensure user model loaded
  console.log("Models loaded:", User.modelName);

  // Find all 1-semester subscriptions
  const subs1Sem = await Subscription.find({ packageKey: "1-semester" }).exec();
  
  // We want to migrate 110 of them to 2-semester
  // Shuffle array randomly
  const shuffled = subs1Sem.sort(() => 0.5 - Math.random());
  const targetSubs = shuffled.slice(0, 110);
  
  const packageDef = getOnlinePackageByKey("2-semester");
  if (!packageDef) throw new Error("Package not found");

  let successCount = 0;

  for (const sub of targetSubs) {
    const payment = await Payment.findOne({ subscriptionId: sub._id }).exec();
    
    if (isApply) {
      // Update Subscription
      sub.packageKey = packageDef.packageKey;
      sub.durationMonth = packageDef.durationMonth;
      
      // Update endDate
      if (sub.startDate) {
        const newEndDate = new Date(sub.startDate);
        newEndDate.setMonth(newEndDate.getMonth() + packageDef.durationMonth);
        sub.endDate = newEndDate;
      }
      
      await sub.save();

      // Update Payment
      if (payment) {
        payment.packageKey = packageDef.packageKey;
        payment.packageName = packageDef.packageName;
        payment.durationMonth = packageDef.durationMonth;
        payment.amount = packageDef.amount;
        await payment.save();
      }
    }
    successCount++;
  }

  console.log(`Successfully migrated ${successCount} students to 2-semester package.`);

  // Recount to verify
  const subs1 = await Subscription.countDocuments({ packageKey: "1-semester" }).exec();
  const subs2 = await Subscription.countDocuments({ packageKey: "2-semester" }).exec();
  
  console.log(`Current Distribution - 1 Semester: ${subs1}, 2 Semester: ${subs2}`);

  mongoose.disconnect();
}
run();
