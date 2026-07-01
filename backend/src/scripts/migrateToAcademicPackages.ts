import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";
import { Payment } from "../models/Payment";
import { Subscription } from "../models/Subscription";
import { Student } from "../models/Student";
import { User } from "../models/User";
import fs from "fs";
import path from "path";

config({ path: resolve(__dirname, "../../.env") });

const DRY_RUN = false;

const ACADEMIC_PACKAGES = {
  "1-semester": { packageKey: "1-semester", packageName: "1 Semester", durationMonth: 6 },
  "2-semester": { packageKey: "2-semester", packageName: "2 Semester", durationMonth: 12 },
};

const CLASS_PRICING_MATRIX = {
  "Kelas 2": { "1-semester": 1_800_000, "2-semester": 3_600_000 },
  "Kelas 3": { "1-semester": 1_800_000, "2-semester": 3_600_000 },
  "Kelas 4": { "1-semester": 1_850_000, "2-semester": 3_700_000 },
  "Kelas 5": { "1-semester": 1_850_000, "2-semester": 3_700_000 },
  "Kelas 6": { "1-semester": 1_900_000, "2-semester": 3_800_000 },
  "Kelas 7": { "1-semester": 2_000_000, "2-semester": 4_000_000 },
  "Kelas 8": { "1-semester": 2_000_000, "2-semester": 4_000_000 },
  "Kelas 9": { "1-semester": 2_050_000, "2-semester": 4_100_000 },
  "Kelas 10": { "1-semester": 2_150_000, "2-semester": 4_300_000 },
  "Kelas 11": { "1-semester": 2_150_000, "2-semester": 4_300_000 },
  "Kelas 12": { "1-semester": 2_250_000, "2-semester": 4_500_000 },
};

function getPriceByClassAndPackage(className: string | undefined | null, packageKey: "1-semester" | "2-semester"): number {
  if (!className) return 3_700_000;
  
  const lowerClass = className.toLowerCase();
  let mappedClassKey: keyof typeof CLASS_PRICING_MATRIX = "Kelas 4";

  if (lowerClass.includes("kelas 2") || lowerClass.includes("sd 2")) mappedClassKey = "Kelas 2";
  else if (lowerClass.includes("kelas 3") || lowerClass.includes("sd 3")) mappedClassKey = "Kelas 3";
  else if (lowerClass.includes("kelas 4") || lowerClass.includes("sd 4")) mappedClassKey = "Kelas 4";
  else if (lowerClass.includes("kelas 5") || lowerClass.includes("sd 5")) mappedClassKey = "Kelas 5";
  else if (lowerClass.includes("kelas 6") || lowerClass.includes("sd 6")) mappedClassKey = "Kelas 6";
  else if (lowerClass.includes("kelas 7") || lowerClass.includes("smp 7")) mappedClassKey = "Kelas 7";
  else if (lowerClass.includes("kelas 8") || lowerClass.includes("smp 8")) mappedClassKey = "Kelas 8";
  else if (lowerClass.includes("kelas 9") || lowerClass.includes("smp 9")) mappedClassKey = "Kelas 9";
  else if (lowerClass.includes("kelas 10") || lowerClass.includes("sma 10")) mappedClassKey = "Kelas 10";
  else if (lowerClass.includes("kelas 11") || lowerClass.includes("sma 11")) mappedClassKey = "Kelas 11";
  else if (lowerClass.includes("kelas 12") || lowerClass.includes("sma 12")) mappedClassKey = "Kelas 12";

  return CLASS_PRICING_MATRIX[mappedClassKey][packageKey];
}

function getAcademicPackage(oldPackageKey: string | null | undefined) {
  if (oldPackageKey === "12-bulan") return ACADEMIC_PACKAGES["2-semester"];
  return ACADEMIC_PACKAGES["1-semester"];
}

async function migrate() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI is not defined in .env");

    console.log(`Connecting to database... [DRY_RUN=${DRY_RUN}]`);
    await mongoose.connect(MONGO_URI);

    await User.findOne().lean();
    
    const paymentsToUpdate = await Payment.find({ 
      packageKey: { $in: ["1-bulan", "2-bulan", "3-bulan", "6-bulan", "12-bulan"] } 
    }).lean();

    const studentIds = paymentsToUpdate.map((p: any) => p.studentId).filter(Boolean);
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const studentMap = new Map();
    for (const s of students) {
      studentMap.set(s._id.toString(), s);
    }

    const subscriptions = await Subscription.find({ 
      packageKey: { $in: ["1-bulan", "2-bulan", "3-bulan", "6-bulan", "12-bulan"] } 
    }).lean();

    const subMap = new Map();
    for (const sub of subscriptions) {
      subMap.set(sub._id.toString(), sub);
    }

    let updatedPaymentsCount = 0;
    for (const payment of paymentsToUpdate) {
      const newPkg = getAcademicPackage(payment.packageKey);
      
      let studentClassName = undefined;
      if (payment.studentId && studentMap.has(payment.studentId.toString())) {
         studentClassName = studentMap.get(payment.studentId.toString()).className;
      }

      const newAmount = getPriceByClassAndPackage(studentClassName, newPkg.packageKey as "1-semester" | "2-semester");

      if (!DRY_RUN) {
        await Payment.updateOne(
          { _id: payment._id },
          { 
            $set: {
              packageKey: newPkg.packageKey,
              packageName: newPkg.packageName,
              durationMonth: newPkg.durationMonth,
              amount: newAmount
            }
          }
        );
        updatedPaymentsCount++;
      }
    }

    let updatedSubscriptionsCount = 0;
    for (const sub of subscriptions) {
      const newPkg = getAcademicPackage(sub.packageKey);
      
      if (!DRY_RUN) {
        const updateDoc: any = {
          packageKey: newPkg.packageKey,
          packageName: newPkg.packageName,
          durationMonth: newPkg.durationMonth,
        };

        if (sub.startDate) {
          const end = new Date(sub.startDate);
          end.setMonth(end.getMonth() + newPkg.durationMonth);
          updateDoc.endDate = end;
        }

        await Subscription.updateOne(
          { _id: sub._id },
          { $set: updateDoc }
        );
        updatedSubscriptionsCount++;
      }
    }

    console.log("====================================");
    console.log(`Migration Summary [DRY_RUN=${DRY_RUN}]`);
    console.log(`Payments updated: ${updatedPaymentsCount}`);
    console.log(`Subscriptions updated: ${updatedSubscriptionsCount}`);
    console.log("====================================");

    // Verifikasi
    const finalPayments = await Payment.find({ packageKey: { $in: ["1-semester", "2-semester"] } }).countDocuments();
    const finalSubs = await Subscription.find({ packageKey: { $in: ["1-semester", "2-semester"] } }).countDocuments();
    console.log(`[Verification] Total Payments with new packageKey: ${finalPayments}`);
    console.log(`[Verification] Total Subscriptions with new packageKey: ${finalSubs}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

migrate();
