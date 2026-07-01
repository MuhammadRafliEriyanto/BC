import mongoose from "mongoose";
import dotenv from "dotenv";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const userEka = await User.findOne({ email: "guru005@bimbel.local" }).exec();
  if (!userEka) {
    console.log("Eka Widiyana not found.");
    return;
  }

  const teacherEka = await Teacher.findOne({ userId: userEka._id }).exec();
  if (teacherEka) {
    teacherEka.subject = "Guru Kelas SD";
    await teacherEka.save();
    console.log("Successfully updated Eka Widiyana subject to 'Guru Kelas SD'.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
