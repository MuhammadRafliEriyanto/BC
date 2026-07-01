import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Subscription } from "../models/Subscription";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  
  const subs = await Subscription.aggregate([
    {
      $group: {
        _id: "$packageKey",
        count: { $sum: 1 }
      }
    }
  ]);
  
  console.log("Subscription distribution:");
  console.log(subs);

  mongoose.disconnect();
}
run();
