import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";
import { Payment } from "../models/Payment";
import { Subscription } from "../models/Subscription";
import { Student } from "../models/Student";
import { User } from "../models/User";

// Load environment variables
config({ path: resolve(__dirname, "../../.env") });

function getPriceByClass(className: string | undefined | null): number {
  if (!className) return 3_700_000;

  const lowerClass = className.toLowerCase();

  // Kelas 2 - 3 / SD 2 - 3
  if (lowerClass.includes("kelas 2") || lowerClass.includes("kelas 3") || lowerClass.includes("sd 2") || lowerClass.includes("sd 3")) return 3_600_000;
  
  // Kelas 4 - 5 / SD 4 - 5
  if (lowerClass.includes("kelas 4") || lowerClass.includes("kelas 5") || lowerClass.includes("sd 4") || lowerClass.includes("sd 5")) return 3_700_000;
  
  // Kelas 6 / SD 6
  if (lowerClass.includes("kelas 6") || lowerClass.includes("sd 6")) return 3_800_000;
  
  // Kelas 7 - 8 / SMP 7 - 8
  if (lowerClass.includes("kelas 7") || lowerClass.includes("kelas 8") || lowerClass.includes("smp 7") || lowerClass.includes("smp 8")) return 4_000_000;
  
  // Kelas 9 / SMP 9
  if (lowerClass.includes("kelas 9") || lowerClass.includes("smp 9")) return 4_100_000;
  
  // Kelas 10 - 11 / SMA 10 - 11
  if (lowerClass.includes("kelas 10") || lowerClass.includes("kelas 11") || lowerClass.includes("sma 10") || lowerClass.includes("sma 11")) return 4_300_000;
  
  // Kelas 12 / SMA 12
  if (lowerClass.includes("kelas 12") || lowerClass.includes("sma 12")) return 4_500_000;

  return 3_700_000;
}

async function migrate() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Just to make sure models are registered properly
    await User.findOne().lean();

    const paymentsToUpdate = await Payment.find({ packageKey: { $ne: "12-bulan" } }).populate<{ studentId: any }>("studentId");
    console.log(`Found ${paymentsToUpdate.length} payments to migrate.`);

    let updatedPaymentsCount = 0;
    for (const payment of paymentsToUpdate) {
      const student = payment.studentId as any;
      if (!student) {
        console.warn(`Payment ${payment.paymentId} has no student associated. Skipping.`);
        continue;
      }

      const className = student.className;
      const newAmount = getPriceByClass(className);

      payment.packageKey = "12-bulan";
      payment.packageName = "Paket 1 Tahun (2 Semester)";
      payment.durationMonth = 12;
      payment.amount = newAmount;

      await payment.save();
      updatedPaymentsCount++;
    }
    console.log(`Successfully updated ${updatedPaymentsCount} payments.`);

    const subscriptionsToUpdate = await Subscription.find({ packageKey: { $ne: "12-bulan" } });
    console.log(`Found ${subscriptionsToUpdate.length} subscriptions to migrate.`);

    let updatedSubscriptionsCount = 0;
    for (const sub of subscriptionsToUpdate) {
      sub.packageKey = "12-bulan";
      sub.packageName = "Paket 1 Tahun (2 Semester)";
      sub.durationMonth = 12;
      
      if (sub.startDate) {
        const start = new Date(sub.startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 12);
        sub.endDate = end;
      }

      await sub.save();
      updatedSubscriptionsCount++;
    }
    console.log(`Successfully updated ${updatedSubscriptionsCount} subscriptions.`);

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

migrate();
