import mongoose, { Types } from "mongoose";

import "../config/env";
import { AttendanceSession } from "../models/AttendanceSession";
import { ClassTask } from "../models/ClassTask";
import { Room } from "../models/Room";
import {
  Schedule,
  SCHEDULE_SUBJECTS,
  type ScheduleStatus,
  type ScheduleSubject,
} from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import {
  ADMIN_SCHEDULE_DAY_OPTIONS,
  ADMIN_SCHEDULE_TIME_SLOT_OPTIONS,
} from "../utils/adminDashboardConfig";
import { getNextPublicId } from "../utils/publicId";
import { normalizeCanonicalClassName } from "../utils/studentClass";

type ScriptOptions = {
  apply: boolean;
  allowLearningOrphans: boolean;
  branchFilter: string;
  classSourceBranch: string;
};

type PopulatedTeacher = {
  _id: Types.ObjectId;
  teacherId: string;
  userId: {
    nama?: string | null;
  } | null;
  subject: string;
  branch: string;
  schedule: string;
  capableGrades?: string[];
};

type TeacherOption = {
  objectId: Types.ObjectId;
  publicId: string;
  name: string;
  subject: ScheduleSubject;
  capableGrades: string[];
  branch: string;
};

type ClassEntry = {
  branch: string;
  className: string;
  grade: string;
  activeStudents: number;
  rawNames: Set<string>;
};

type RoomOption = {
  branch: string;
  name: string;
};

type ScheduleDraft = {
  branch: string;
  className: string;
  activeStudents: number;
  subject: ScheduleSubject;
  teacherObjectId: Types.ObjectId;
  teacherPublicId: string;
  teacherName: string;
  teacherBranch: string;
  day: string;
  time: string;
  room: string;
  status: ScheduleStatus;
};

type ScheduleGap = {
  branch: string;
  className: string;
  subject: string;
  reason: string;
};

type ExistingSchedule = {
  _id: Types.ObjectId;
  scheduleId: string;
  className: string;
  subject: string;
  teacherId:
    | Types.ObjectId
    | {
        _id?: Types.ObjectId;
        branch?: string | null;
      }
    | null;
};

const SUBJECT_ORDER: ScheduleSubject[] = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
];

const CHECKED_SUBJECTS = [...SUBJECT_ORDER, "IPS"];
const SCHEDULE_DAYS = ADMIN_SCHEDULE_DAY_OPTIONS.filter((day) => day !== "Minggu");
const SCHEDULE_TIMES = [...ADMIN_SCHEDULE_TIME_SLOT_OPTIONS];
const MIN_CROSS_BRANCH_TEACHER_START_GAP_MINUTES = 120;
const MIN_ACTIVE_STUDENTS_FOR_EXTRA_MATH_SESSION = 20;
const KNOWN_BRANCH_ROTATIONS = new Map([
  ["slawi", { dayOffset: 0, timeOffset: 0, roomOffset: 0 }],
  ["adiwerna", { dayOffset: 0, timeOffset: 1, roomOffset: 1 }],
]);

function normalizeText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function parseOptions(argv: string[]): ScriptOptions {
  const branchArgument = argv.find((argument) => argument.startsWith("--branch="));
  const classSourceBranchArgument = argv.find((argument) =>
    argument.startsWith("--class-source-branch="),
  );

  return {
    apply: argv.includes("--apply"),
    allowLearningOrphans: argv.includes("--allow-learning-orphans"),
    branchFilter: normalizeText(branchArgument?.split("=")[1]),
    classSourceBranch: normalizeText(classSourceBranchArgument?.split("=")[1]),
  };
}

function rotateValues<T>(values: T[], startIndex: number): T[] {
  return values.map((_, index) => values[(startIndex + index) % values.length]);
}

function getBranchRotation(branch: string) {
  const normalizedBranch = normalizeText(branch).toLowerCase();
  const knownRotation = KNOWN_BRANCH_ROTATIONS.get(normalizedBranch);

  if (knownRotation) {
    return knownRotation;
  }

  const hash = [...normalizedBranch].reduce(
    (total, character) => total * 31 + character.charCodeAt(0),
    0,
  );

  return {
    dayOffset: hash % SCHEDULE_DAYS.length,
    timeOffset: Math.floor(hash / SCHEDULE_DAYS.length) % SCHEDULE_TIMES.length,
    roomOffset: Math.floor(hash / (SCHEDULE_DAYS.length * SCHEDULE_TIMES.length)),
  };
}

function extractGrade(className: string) {
  return normalizeText(className).match(/\b(4|5|6|7|8|9|10|11|12)\b/)?.[1] ?? "";
}

function getGradeOrder(className: string) {
  const grade = Number(extractGrade(className));
  return Number.isFinite(grade) ? grade : Number.MAX_SAFE_INTEGER;
}

function getPlannedSessionCount(classEntry: ClassEntry, subject: ScheduleSubject) {
  return subject === "Matematika" &&
    classEntry.activeStudents >= MIN_ACTIVE_STUDENTS_FOR_EXTRA_MATH_SESSION
    ? 2
    : 1;
}

function toScheduleSubject(value: string): ScheduleSubject | null {
  const normalizedValue = normalizeText(value).toUpperCase();

  if (/MAT|MTK/.test(normalizedValue)) {
    return "Matematika";
  }

  if (/INDONESIA|B\.?\s*INDO|BIND/.test(normalizedValue)) {
    return "Bahasa Indonesia";
  }

  if (/INGGRIS|B\.?\s*ING|ENGLISH/.test(normalizedValue)) {
    return "Bahasa Inggris";
  }

  if (/IPA|FISIKA|KIMIA|BIOLOGI/.test(normalizedValue)) {
    return "IPA";
  }

  const exactSubject = SCHEDULE_SUBJECTS.find(
    (subject) => subject.toUpperCase() === normalizedValue,
  );

  return exactSubject ?? null;
}

function buildSlotKey(day: string, time: string): string {
  return `${day.toLowerCase()}|${time.toLowerCase()}`;
}

function getTimeStartMinutes(time: string) {
  const [startTime] = normalizeText(time).split("-");
  const matchedTime = startTime?.trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!matchedTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(matchedTime[1] ?? "0") * 60 + Number(matchedTime[2] ?? "0");
}

function buildClassSlotKey(branch: string, className: string, day: string, time: string): string {
  return `${branch.toLowerCase()}|${className.toLowerCase()}|${buildSlotKey(day, time)}`;
}

function buildTeacherSlotKey(teacherPublicId: string, day: string, time: string): string {
  return `${teacherPublicId}|${buildSlotKey(day, time)}`;
}

function buildTeacherNameSlotKey(teacherName: string, day: string, time: string): string {
  return `${normalizeText(teacherName).toLowerCase()}|${buildSlotKey(day, time)}`;
}

function buildNearbyTeacherNameSlotKeys(teacherName: string, day: string, time: string) {
  const sourceStartMinutes = getTimeStartMinutes(time);

  if (!Number.isFinite(sourceStartMinutes)) {
    return [buildTeacherNameSlotKey(teacherName, day, time)];
  }

  return SCHEDULE_TIMES.filter((candidateTime) => {
    const candidateStartMinutes = getTimeStartMinutes(candidateTime);

    return (
      Number.isFinite(candidateStartMinutes) &&
      Math.abs(candidateStartMinutes - sourceStartMinutes) <
        MIN_CROSS_BRANCH_TEACHER_START_GAP_MINUTES
    );
  }).map((candidateTime) => buildTeacherNameSlotKey(teacherName, day, candidateTime));
}

function buildRoomSlotKey(branch: string, room: string, day: string, time: string): string {
  return `${branch.toLowerCase()}|${room.toLowerCase()}|${buildSlotKey(day, time)}`;
}

function buildClassDayKey(branch: string, className: string, day: string): string {
  return `${branch.toLowerCase()}|${className.toLowerCase()}|${day.toLowerCase()}`;
}

function slugify(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildStableClassId(teacherPublicId: string, branch: string, className: string) {
  return `class-${slugify(teacherPublicId) || "guru"}-${
    slugify(branch) || "cabang"
  }-${slugify(className) || "kelas"}`;
}

function inferRoomBranch(room: { roomId?: string; name?: string }): string {
  const roomId = normalizeText(room.roomId).toUpperCase();

  if (roomId.includes("SLW")) {
    return "Slawi";
  }

  if (roomId.includes("ADI")) {
    return "Adiwerna";
  }

  return "";
}

function getRoomOptions(rooms: Array<{ roomId?: string; name?: string }>): RoomOption[] {
  const seenKeys = new Set<string>();

  return rooms
    .map((room) => ({
      branch: inferRoomBranch(room),
      name: normalizeText(room.name),
    }))
    .filter((room): room is RoomOption => Boolean(room.name))
    .filter((room) => {
      const key = `${room.branch.toLowerCase()}|${room.name.toLowerCase()}`;

      if (seenKeys.has(key)) {
        return false;
      }

      seenKeys.add(key);
      return true;
    })
    .sort(
      (left, right) =>
        left.branch.localeCompare(right.branch, "id-ID") ||
        left.name.localeCompare(right.name, "id-ID"),
    );
}

function getRoomsForBranch(roomOptions: RoomOption[], branch: string): RoomOption[] {
  const normalizedBranch = normalizeText(branch).toLowerCase();
  const branchRooms = roomOptions.filter(
    (room) => room.branch.toLowerCase() === normalizedBranch,
  );

  if (branchRooms.length > 0) {
    return branchRooms;
  }

  return roomOptions.filter((room) => !room.branch);
}

function toTeacherOptions(teachers: PopulatedTeacher[]): TeacherOption[] {
  return teachers
    .map((teacher) => {
      const subject = toScheduleSubject(teacher.subject);

      if (!subject) {
        return null;
      }

      return {
        objectId: teacher._id,
        publicId: teacher.teacherId,
        name: normalizeText(teacher.userId?.nama) || "Nama guru belum diatur",
        subject,
        branch: normalizeText(teacher.branch) || "-",
        capableGrades: (teacher.capableGrades ?? []).map(String).map(normalizeText),
      } satisfies TeacherOption;
    })
    .filter((teacher): teacher is TeacherOption => teacher !== null);
}

async function getActiveClasses(options: {
  branchFilter: string;
  classSourceBranch: string;
}): Promise<ClassEntry[]> {
  const students = await Student.find({ status: "Aktif" })
    .select("branch className")
    .lean()
    .exec();
  const classMap = new Map<string, ClassEntry>();
  const normalizedSourceBranch = normalizeText(
    options.classSourceBranch || options.branchFilter,
  );
  const normalizedSourceBranchKey = normalizedSourceBranch.toLowerCase();
  const targetBranch = normalizeText(options.branchFilter);

  for (const student of students) {
    const sourceBranch = normalizeText(student.branch) || "Tanpa Cabang";

    if (
      normalizedSourceBranchKey &&
      sourceBranch.toLowerCase() !== normalizedSourceBranchKey
    ) {
      continue;
    }

    const branch =
      targetBranch && normalizedSourceBranch ? targetBranch : sourceBranch;
    const canonicalClassName = normalizeCanonicalClassName(student.className);

    if (!canonicalClassName) {
      continue;
    }

    const classKey = `${branch.toLowerCase()}|${canonicalClassName.toLowerCase()}`;
    const currentEntry =
      classMap.get(classKey) ??
      ({
        branch,
        className: canonicalClassName,
        grade: extractGrade(canonicalClassName),
        activeStudents: 0,
        rawNames: new Set<string>(),
      } satisfies ClassEntry);

    currentEntry.activeStudents += 1;
    currentEntry.rawNames.add(normalizeText(student.className));
    classMap.set(classKey, currentEntry);
  }

  return Array.from(classMap.values()).sort(
    (left, right) =>
      left.branch.localeCompare(right.branch, "id-ID") ||
      getGradeOrder(left.className) - getGradeOrder(right.className),
  );
}

function findScheduleSlot(options: {
  classEntry: ClassEntry;
  classIndex: number;
  subject: ScheduleSubject;
  subjectIndex: number;
  eligibleTeachers: TeacherOption[];
  roomOptions: RoomOption[];
  teacherLoad: Map<string, number>;
  occupiedClassSlots: Set<string>;
  occupiedTeacherSlots: Set<string>;
  occupiedTeacherNameSlots: Set<string>;
  occupiedRoomSlots: Set<string>;
  classDayCount: Map<string, number>;
}) {
  const branchRotation = getBranchRotation(options.classEntry.branch);
  const roomOptions = rotateValues(
    getRoomsForBranch(options.roomOptions, options.classEntry.branch),
    branchRotation.roomOffset,
  );

  if (roomOptions.length === 0) {
    return null;
  }

  for (const maxSchedulesPerDay of [1, 2]) {
    const dayOrder = rotateValues(
      SCHEDULE_DAYS,
      (options.classIndex + options.subjectIndex * 2 + branchRotation.dayOffset) %
        SCHEDULE_DAYS.length,
    );
    const timeOrder = rotateValues(
      SCHEDULE_TIMES,
      (options.classIndex + options.subjectIndex + branchRotation.timeOffset) %
        SCHEDULE_TIMES.length,
    );

    const teacherOrder = [...options.eligibleTeachers].sort(
      (left, right) =>
        (options.teacherLoad.get(left.publicId) ?? 0) -
          (options.teacherLoad.get(right.publicId) ?? 0) ||
        left.publicId.localeCompare(right.publicId, "id-ID"),
    );

    for (const teacher of teacherOrder) {
      for (const day of dayOrder) {
        if (
          (options.classDayCount.get(
            buildClassDayKey(options.classEntry.branch, options.classEntry.className, day),
          ) ??
            0) >= maxSchedulesPerDay
        ) {
          continue;
        }

        for (const time of timeOrder) {
          if (
            options.occupiedClassSlots.has(
              buildClassSlotKey(options.classEntry.branch, options.classEntry.className, day, time),
            )
          ) {
            continue;
          }

          if (
            options.occupiedTeacherSlots.has(
              buildTeacherSlotKey(teacher.publicId, day, time),
            ) ||
            options.occupiedTeacherNameSlots.has(
              buildTeacherNameSlotKey(teacher.name, day, time),
            )
          ) {
            continue;
          }

          for (const room of roomOptions) {
            if (
              options.occupiedRoomSlots.has(
                buildRoomSlotKey(options.classEntry.branch, room.name, day, time),
              )
            ) {
              continue;
            }

            return {
              day,
              time,
              room: room.name,
              teacher,
            };
          }
        }
      }
    }
  }

  return null;
}

function buildSchedulePlan(params: {
  classes: ClassEntry[];
  teachers: TeacherOption[];
  roomOptions: RoomOption[];
  preoccupiedTeacherNameSlots?: Set<string>;
}) {
  const occupiedClassSlots = new Set<string>();
  const occupiedTeacherSlots = new Set<string>();
  const occupiedTeacherNameSlots = new Set(params.preoccupiedTeacherNameSlots ?? []);
  const occupiedRoomSlots = new Set<string>();
  const classDayCount = new Map<string, number>();
  const teacherLoad = new Map<string, number>();
  const drafts: ScheduleDraft[] = [];
  const gaps: ScheduleGap[] = [];

  params.classes.forEach((classEntry, classIndex) => {
    CHECKED_SUBJECTS.forEach((subject, subjectIndex) => {
      const isSupportedScheduleSubject = SCHEDULE_SUBJECTS.includes(
        subject as ScheduleSubject,
      );
      const scheduleSubject = subject as ScheduleSubject;
      const eligibleTeachers = isSupportedScheduleSubject
        ? params.teachers.filter(
            (teacher) =>
              teacher.branch.toLowerCase() === classEntry.branch.toLowerCase() &&
              teacher.subject === scheduleSubject &&
              teacher.capableGrades.includes(classEntry.grade),
          )
        : [];

      if (!isSupportedScheduleSubject || eligibleTeachers.length === 0) {
        gaps.push({
          branch: classEntry.branch,
          className: classEntry.className,
          subject,
          reason: "Belum ada guru aktif sesuai tingkat kelas.",
        });
        return;
      }

      const sessionCount = getPlannedSessionCount(classEntry, scheduleSubject);

      for (let occurrenceIndex = 0; occurrenceIndex < sessionCount; occurrenceIndex += 1) {
        const slot = findScheduleSlot({
          classEntry,
          classIndex,
          subject: scheduleSubject,
          subjectIndex: subjectIndex + occurrenceIndex * CHECKED_SUBJECTS.length,
          eligibleTeachers,
          roomOptions: params.roomOptions,
          teacherLoad,
          occupiedClassSlots,
          occupiedTeacherSlots,
          occupiedTeacherNameSlots,
          occupiedRoomSlots,
          classDayCount,
        });

        if (!slot) {
          gaps.push({
            branch: classEntry.branch,
            className: classEntry.className,
            subject:
              occurrenceIndex === 0
                ? scheduleSubject
                : `${scheduleSubject} (sesi ${occurrenceIndex + 1})`,
            reason: "Tidak ada slot kosong tanpa bentrok.",
          });
          continue;
        }

        occupiedClassSlots.add(
          buildClassSlotKey(classEntry.branch, classEntry.className, slot.day, slot.time),
        );
        occupiedTeacherSlots.add(
          buildTeacherSlotKey(slot.teacher.publicId, slot.day, slot.time),
        );
        occupiedTeacherNameSlots.add(
          buildTeacherNameSlotKey(slot.teacher.name, slot.day, slot.time),
        );
        occupiedRoomSlots.add(
          buildRoomSlotKey(classEntry.branch, slot.room, slot.day, slot.time),
        );
        classDayCount.set(
          buildClassDayKey(classEntry.branch, classEntry.className, slot.day),
          (classDayCount.get(
            buildClassDayKey(classEntry.branch, classEntry.className, slot.day),
          ) ?? 0) + 1,
        );
        teacherLoad.set(
          slot.teacher.publicId,
          (teacherLoad.get(slot.teacher.publicId) ?? 0) + 1,
        );

        drafts.push({
          branch: classEntry.branch,
          className: classEntry.className,
          activeStudents: classEntry.activeStudents,
          subject: scheduleSubject,
          teacherObjectId: slot.teacher.objectId,
          teacherPublicId: slot.teacher.publicId,
          teacherName: slot.teacher.name,
          teacherBranch: slot.teacher.branch,
          day: slot.day,
          time: slot.time,
          room: slot.room,
          status: "Siap",
        });
      }
    });
  });

  return {
    drafts,
    gaps,
    teacherLoad,
  };
}

function printPlan(drafts: ScheduleDraft[], gaps: ScheduleGap[], classes: ClassEntry[]) {
  console.log(
    `[generate-teacher-schedules] realClasses=${classes.length} plannedSchedules=${drafts.length} gaps=${gaps.length}`,
  );

  if (classes.length > 0) {
    console.table(
      classes.map((classEntry) => ({
        Cabang: classEntry.branch,
        Kelas: classEntry.className,
        Siswa: classEntry.activeStudents,
        "Nama lama": Array.from(classEntry.rawNames).join("; "),
        Jadwal: drafts.filter(
          (draft) =>
            draft.branch === classEntry.branch &&
            draft.className === classEntry.className,
        ).length,
      })),
    );
  }

  if (drafts.length > 0) {
    console.table(
      drafts.map((draft) => ({
        Cabang: draft.branch,
        Kelas: draft.className,
        Mapel: draft.subject,
        Guru: `${draft.teacherPublicId} - ${draft.teacherName}`,
        Hari: draft.day,
        Jam: draft.time,
        Ruangan: draft.room,
      })),
    );
  }

  if (gaps.length > 0) {
    console.table(
      gaps.map((gap) => ({
        Cabang: gap.branch,
        Kelas: gap.className,
        Mapel: gap.subject,
        Alasan: gap.reason,
      })),
    );
  }
}

async function findLearningOrphans(drafts: ScheduleDraft[], branchFilter: string) {
  const plannedClassIds = new Set(
    drafts.map((draft) =>
      buildStableClassId(draft.teacherPublicId, draft.teacherBranch, draft.className),
    ),
  );
  const [tasks, attendanceSessions] = await Promise.all([
    ClassTask.find().select("taskId classId className subject branch").lean().exec(),
    AttendanceSession.find()
      .select("sessionId classId className subject branch")
      .lean()
      .exec(),
  ]);

  const normalizedBranchFilter = normalizeText(branchFilter).toLowerCase();
  const filteredTasks = normalizedBranchFilter
    ? tasks.filter(
        (task) => normalizeText(task.branch).toLowerCase() === normalizedBranchFilter,
      )
    : tasks;
  const filteredAttendanceSessions = normalizedBranchFilter
    ? attendanceSessions.filter(
        (session) =>
          normalizeText(session.branch).toLowerCase() === normalizedBranchFilter,
      )
    : attendanceSessions;

  return {
    tasks: filteredTasks.filter((task) => !plannedClassIds.has(normalizeText(task.classId))),
    attendanceSessions: filteredAttendanceSessions.filter(
      (session) => !plannedClassIds.has(normalizeText(session.classId)),
    ),
  };
}

function printLearningOrphans(
  orphans: Awaited<ReturnType<typeof findLearningOrphans>>,
) {
  const totalOrphans = orphans.tasks.length + orphans.attendanceSessions.length;

  if (totalOrphans === 0) {
    return;
  }

  console.log(
    `[generate-teacher-schedules] learningRecordsOutsidePlan=${totalOrphans}`,
  );
  console.table([
    ...orphans.tasks.map((task) => ({
      Tipe: "Tugas",
      Cabang: normalizeText(task.branch),
      ID: normalizeText(task.taskId),
      ClassId: normalizeText(task.classId),
      Kelas: normalizeText(task.className),
      Mapel: normalizeText(task.subject),
    })),
    ...orphans.attendanceSessions.map((session) => ({
      Tipe: "Absensi",
      Cabang: normalizeText(session.branch),
      ID: normalizeText(session.sessionId),
      ClassId: normalizeText(session.classId),
      Kelas: normalizeText(session.className),
      Mapel: normalizeText(session.subject),
    })),
  ]);
}

async function getPreoccupiedTeacherNameSlots(branchFilter: string) {
  const normalizedBranchFilter = normalizeText(branchFilter).toLowerCase();

  if (!normalizedBranchFilter) {
    return new Set<string>();
  }

  const schedules = await Schedule.find()
    .select("day time teacherId")
    .populate<{
      teacherId: {
        branch?: string | null;
        userId?: {
          nama?: string | null;
        } | null;
      } | null;
    }>({
      path: "teacherId",
      select: "branch userId",
      populate: {
        path: "userId",
        model: User,
        select: "nama",
      },
    })
    .lean()
    .exec();
  const slots = new Set<string>();

  for (const schedule of schedules) {
    const teacherBranch = normalizeText(schedule.teacherId?.branch);
    const teacherName = normalizeText(schedule.teacherId?.userId?.nama);

    if (!teacherName || teacherBranch.toLowerCase() === normalizedBranchFilter) {
      continue;
    }

    for (const slotKey of buildNearbyTeacherNameSlotKeys(
      teacherName,
      schedule.day,
      schedule.time,
    )) {
      slots.add(slotKey);
    }
  }

  return slots;
}

function getExistingScheduleBranch(schedule: ExistingSchedule): string {
  const teacherId = schedule.teacherId;

  if (!teacherId || teacherId instanceof Types.ObjectId) {
    return "";
  }

  return normalizeText(teacherId.branch);
}

function buildPlanKey(branch: string, className: string, subject: string): string {
  return [
    normalizeText(branch).toLowerCase(),
    normalizeText(className).toLowerCase(),
    normalizeText(subject).toLowerCase(),
  ].join("|");
}

async function applySchedulePlan(drafts: ScheduleDraft[], branchFilter: string) {
  const rawExistingSchedules = (await Schedule.find()
    .select("_id scheduleId className subject teacherId")
    .populate<{ teacherId: { _id: Types.ObjectId; branch?: string | null } | null }>({
      path: "teacherId",
      select: "branch",
    })
    .sort({ scheduleId: 1 })
    .lean()
    .exec()) as ExistingSchedule[];
  const normalizedBranchFilter = normalizeText(branchFilter).toLowerCase();
  const existingSchedules = normalizedBranchFilter
    ? rawExistingSchedules.filter(
        (schedule) =>
          getExistingScheduleBranch(schedule).toLowerCase() === normalizedBranchFilter,
      )
    : rawExistingSchedules;
  const existingSchedulesByKey = new Map<string, ExistingSchedule[]>();
  const usedExistingScheduleIds = new Set<string>();
  const updatedScheduleIds: string[] = [];
  const createdScheduleIds: string[] = [];

  for (const schedule of existingSchedules) {
    const scheduleKey = buildPlanKey(
      getExistingScheduleBranch(schedule),
      schedule.className,
      schedule.subject,
    );

    existingSchedulesByKey.set(scheduleKey, [
      ...(existingSchedulesByKey.get(scheduleKey) ?? []),
      schedule,
    ]);
  }

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    const draftKey = buildPlanKey(draft.branch, draft.className, draft.subject);
    const existingScheduleCandidates = existingSchedulesByKey.get(draftKey) ?? [];
    const existingSchedule = existingScheduleCandidates.shift();
    const payload = {
      day: draft.day,
      time: draft.time,
      className: draft.className,
      subject: draft.subject,
      teacherId: draft.teacherObjectId,
      branch: draft.branch,
      room: draft.room,
      status: draft.status,
    };

    if (existingSchedule) {
      await Schedule.updateOne({ _id: existingSchedule._id }, { $set: payload }).exec();
      updatedScheduleIds.push(existingSchedule.scheduleId);
      usedExistingScheduleIds.add(existingSchedule.scheduleId);
      continue;
    }

    const scheduleId = await getNextPublicId(Schedule, "scheduleId", "SCH");

    await Schedule.create({
      scheduleId,
      ...payload,
    });
    createdScheduleIds.push(scheduleId);
  }

  return {
    updatedScheduleIds,
    createdScheduleIds,
    untouchedExtraScheduleIds: existingSchedules
      .filter((schedule) => !usedExistingScheduleIds.has(schedule.scheduleId))
      .map((schedule) => schedule.scheduleId),
  };
}

function buildTeacherSummary(
  teacherObjectId: string,
  drafts: ScheduleDraft[],
) {
  const ownedDrafts = drafts
    .filter((draft) => draft.teacherObjectId.toString() === teacherObjectId)
    .sort((left, right) => {
      const dayDifference =
        SCHEDULE_DAYS.indexOf(left.day as (typeof SCHEDULE_DAYS)[number]) -
        SCHEDULE_DAYS.indexOf(right.day as (typeof SCHEDULE_DAYS)[number]);

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return left.time.localeCompare(right.time, "id-ID");
    });
  const activeClasses = new Set(ownedDrafts.map((draft) => draft.className)).size;
  const scheduleSummary = ownedDrafts
    .slice(0, 3)
    .map((draft) => `${draft.day} ${draft.time}`)
    .join("; ");

  return {
    activeClasses,
    scheduleSummary,
  };
}

async function updateTeacherSummaries(
  teachers: PopulatedTeacher[],
  drafts: ScheduleDraft[],
) {
  let updatedCount = 0;

  for (const teacher of teachers) {
    const summary = buildTeacherSummary(teacher._id.toString(), drafts);
    const updatePayload: {
      activeClasses: number;
      schedule: string;
    } = {
      activeClasses: summary.activeClasses,
      schedule: summary.scheduleSummary || "-",
    };

    await Teacher.updateOne({ _id: teacher._id }, { $set: updatePayload }).exec();
    updatedCount += 1;
  }

  return updatedCount;
}

async function run() {
  const options = parseOptions(process.argv.slice(2));

  await mongoose.connect(process.env.MONGO_URI as string);

  const [classes, teachers, rooms, preoccupiedTeacherNameSlots] = await Promise.all([
    getActiveClasses({
      branchFilter: options.branchFilter,
      classSourceBranch: options.classSourceBranch,
    }),
    Teacher.find({ status: "Aktif" })
      .populate<{ userId: PopulatedTeacher["userId"] }>({
        path: "userId",
        model: User,
        select: "nama",
      })
      .sort({ teacherId: 1 })
      .lean()
      .exec() as Promise<PopulatedTeacher[]>,
    Room.find().select("roomId name").lean().exec() as Promise<
      Array<{ roomId?: string; name?: string }>
    >,
    getPreoccupiedTeacherNameSlots(options.branchFilter),
  ]);
  const roomOptions = getRoomOptions(rooms);
  const targetTeachers = teachers.filter(
    (teacher) =>
      !options.branchFilter ||
      normalizeText(teacher.branch).toLowerCase() ===
        options.branchFilter.toLowerCase(),
  );
  const teacherOptions = toTeacherOptions(targetTeachers).filter(
    (teacher) =>
      !options.branchFilter ||
      teacher.branch.toLowerCase() === options.branchFilter.toLowerCase(),
  );

  if (roomOptions.length === 0) {
    throw new Error("Tidak ada ruangan di master room. Isi ruangan dulu sebelum generate jadwal.");
  }

  const { drafts, gaps } = buildSchedulePlan({
    classes,
    teachers: teacherOptions,
    roomOptions,
    preoccupiedTeacherNameSlots,
  });
  const learningOrphans = await findLearningOrphans(drafts, options.branchFilter);

  console.log(
    `[generate-teacher-schedules] action=${options.apply ? "apply" : "dry-run"}${
      options.branchFilter ? ` branch=${options.branchFilter}` : ""
    }${
      options.classSourceBranch
        ? ` classSourceBranch=${options.classSourceBranch}`
        : ""
    }`,
  );
  printPlan(drafts, gaps, classes);
  printLearningOrphans(learningOrphans);

  if (!options.apply) {
    console.log(
      "Dry-run selesai. Jalankan dengan --apply untuk menyimpan jadwal ke database.",
    );
    return;
  }

  const orphanCount =
    learningOrphans.tasks.length + learningOrphans.attendanceSessions.length;

  if (orphanCount > 0 && !options.allowLearningOrphans) {
    throw new Error(
      `Ada ${orphanCount} data tugas/absensi lama di luar rencana jadwal. Jalankan lagi dengan --allow-learning-orphans jika tetap ingin apply.`,
    );
  }

  const result = await applySchedulePlan(drafts, options.branchFilter);
  const updatedTeacherCount = await updateTeacherSummaries(targetTeachers, drafts);

  console.log(
    `Selesai. Jadwal diperbarui: ${result.updatedScheduleIds.length}. Jadwal baru: ${result.createdScheduleIds.length}${
      result.createdScheduleIds.length
        ? ` (${result.createdScheduleIds.join(", ")})`
        : ""
    }. Ringkasan guru diperbarui: ${updatedTeacherCount}.`,
  );

  if (result.untouchedExtraScheduleIds.length > 0) {
    console.log(
      `Ada jadwal ekstra yang tidak disentuh: ${result.untouchedExtraScheduleIds.join(", ")}.`,
    );
  }
}

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
