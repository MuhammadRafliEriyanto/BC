import mongoose from "mongoose";
import dotenv from "dotenv";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");

  const teacherName = "M. Nur Taufiq, S. Pd";
  
  // get teacher
  const teacherObj = await Teacher.findOne({}).populate({ path: "userId", model: User, match: { nama: teacherName } }).exec();
  
  if (!teacherObj) {
    console.log("Teacher not found");
    process.exit(1);
  }

  console.log(`Teacher capableGrades:`, teacherObj.capableGrades);

  // simulate validation for SMA 10 (should fail)
  const classNameFail = "SMA 10";
  const gradeMatchFail = classNameFail.match(/\b(\d{1,2})\b/);
  const extractedGradeFail = gradeMatchFail ? gradeMatchFail[1] : null;

  if (
    extractedGradeFail &&
    teacherObj.capableGrades &&
    teacherObj.capableGrades.length > 0 &&
    !teacherObj.capableGrades.includes(extractedGradeFail)
  ) {
    console.log(`[PASS TEST 1] Validation failed correctly for ${classNameFail}: Guru tidak diizinkan mengajar untuk kelas akademik tingkat ini (hanya: ${teacherObj.capableGrades.join(", ")}).`);
  } else {
    console.log(`[FAIL TEST 1] Validation passed incorrectly for ${classNameFail}`);
  }

  // simulate validation for SMP 9 (should pass)
  const classNamePass = "SMP 9";
  const gradeMatchPass = classNamePass.match(/\b(\d{1,2})\b/);
  const extractedGradePass = gradeMatchPass ? gradeMatchPass[1] : null;

  if (
    extractedGradePass &&
    teacherObj.capableGrades &&
    teacherObj.capableGrades.length > 0 &&
    !teacherObj.capableGrades.includes(extractedGradePass)
  ) {
    console.log(`[FAIL TEST 2] Validation failed incorrectly for ${classNamePass}`);
  } else {
    console.log(`[PASS TEST 2] Validation passed correctly for ${classNamePass}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
