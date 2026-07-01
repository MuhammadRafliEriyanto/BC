import type { Types } from "mongoose";
import { Schedule } from "../models/Schedule";
import { Teacher } from "../models/Teacher";

/**
 * Synchronizes a teacher's schedule summary and active classes count
 * based on their actual current schedules in the database.
 * 
 * @param teacherId The Object ID of the teacher
 */
export async function syncTeacherScheduleStats(teacherId: Types.ObjectId): Promise<void> {
  // Count all schedules for the teacher
  const schedules = await Schedule.find({
    teacherId,
  }).exec();

  const uniqueClasses = new Set<string>();
  const scheduleParts: string[] = [];

  for (const schedule of schedules) {
    uniqueClasses.add(schedule.className);

    // Format string: "Sen 15.30"
    const shortDay = schedule.day.substring(0, 3);
    const startTime = schedule.time.split("-")[0].trim().replace(":", ".");
    scheduleParts.push(`${shortDay} ${startTime}`);
  }

  const activeClassesCount = uniqueClasses.size;
  
  // Format the schedule string
  let scheduleString = "-";
  if (scheduleParts.length > 0) {
    const uniqueSchedules = Array.from(new Set(scheduleParts));
    
    // Sort schedules by day (Sen, Sel, Rab, Kam, Jum, Sab, Min)
    const dayOrder: Record<string, number> = {
      "Sen": 1, "Sel": 2, "Rab": 3, "Kam": 4, "Jum": 5, "Sab": 6, "Min": 7
    };
    
    uniqueSchedules.sort((a, b) => {
      const dayA = a.substring(0, 3);
      const dayB = b.substring(0, 3);
      const diff = (dayOrder[dayA] || 99) - (dayOrder[dayB] || 99);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });

    scheduleString = uniqueSchedules.join(", ");
  }

  // Update the teacher document
  await Teacher.findByIdAndUpdate(teacherId, {
    schedule: scheduleString,
    activeClasses: activeClassesCount,
  }).exec();
}
