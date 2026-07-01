import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Student } from "../models/Student";
import { Payment } from "../models/Payment";

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  const student = await Student.findOne({ studentId: "STD-186" }).exec();
  if (student) {
    const pays = await Payment.find({ studentId: student._id }).exec();
    console.log(pays);
  }
  mongoose.disconnect();
}
run();
