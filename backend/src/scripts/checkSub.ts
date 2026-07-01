import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Subscription } from "../models/Subscription";
import { Payment } from "../models/Payment";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const sub = await Subscription.findById('6a355ce69b33d129cd69675d').exec();
  console.log("Sub:", sub);
  mongoose.disconnect();
}
run();
