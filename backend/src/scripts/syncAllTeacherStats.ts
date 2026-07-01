import mongoose from "mongoose";
import dotenv from "dotenv";
import { Teacher } from "../models/Teacher";
import { syncTeacherScheduleStats } from "../utils/teacherStats";

import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../backend/.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to MongoDB.");

  const teachers = await Teacher.find({}).select("_id").exec();
  console.log(`Found ${teachers.length} teachers. Syncing stats...`);

  let syncedCount = 0;
  for (const teacher of teachers) {
    try {
      await syncTeacherScheduleStats(teacher._id);
      syncedCount++;
    } catch (error) {
      console.error(`Failed to sync teacher (${teacher._id}):`, error);
    }
  }

  console.log(`\nSuccessfully synced ${syncedCount} out of ${teachers.length} teachers.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
