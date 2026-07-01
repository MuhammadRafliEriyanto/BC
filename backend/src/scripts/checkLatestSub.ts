import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Student } from "../models/Student";
import { Subscription } from "../models/Subscription";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const subs = await Subscription.find().sort({ createdAt: -1 }).limit(1).exec();
  if (subs.length > 0) {
    console.log("Latest Sub Status:", subs[0].status, "Payment Status:", subs[0].paymentStatus, "EndDate:", subs[0].endDate);
  }
  mongoose.disconnect();
}
run();
