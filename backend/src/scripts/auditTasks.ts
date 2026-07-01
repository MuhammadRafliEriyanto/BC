import mongoose from "mongoose";
import connectDB from "../config/db";
import { ClassTask } from "../models/ClassTask";

async function auditTasks() {
  await connectDB();
  console.log("Connected to DB. Auditing tasks...");

  const tasks = await ClassTask.find({}).select("classId meetingNumber title").lean();
  
  const grouped = new Map<string, any[]>();
  
  for (const task of tasks) {
    const key = `${task.classId}-meeting-${task.meetingNumber}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(task);
  }

  let hasDuplicates = false;
  for (const [key, list] of grouped.entries()) {
    if (list.length > 1) {
      hasDuplicates = true;
      console.log(`\nDuplicate tasks found for ${key}:`);
      list.forEach((t, index) => {
        console.log(`  ${index + 1}. [${t._id}] ${t.title}`);
      });
    }
  }

  if (!hasDuplicates) {
    console.log("No duplicate tasks found. Each meeting has exactly 1 task.");
  }

  process.exit(0);
}

auditTasks().catch(console.error);
