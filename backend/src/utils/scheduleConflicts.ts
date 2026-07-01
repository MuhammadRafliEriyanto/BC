import type { ScheduleStatus } from "../models/Schedule";
import type { PublicSchedule } from "./adminView";

const missingTeacherLabel = "Guru tidak ditemukan";
const MIN_CROSS_BRANCH_TEACHER_START_GAP_MINUTES = 120;

type ScheduleTeacherUser = {
  nama?: string | null;
};

type PopulatedTeacherReference = {
  teacherId?: string | null;
  branch?: string | null;
  userId?: ScheduleTeacherUser | string | null;
};

export type ScheduleWithTeacher = {
  scheduleId: string;
  day: string;
  time: string;
  className: string;
  branch?: string | null;
  subject?: string | null;
  room: string;
  status: ScheduleStatus;
  createdAt?: Date | string | null;
  teacherId?: PopulatedTeacherReference | Record<string, unknown> | string | null;
  teacher?: string | null;
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function isHexObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

function isTeacherReferenceObject(
  value: ScheduleWithTeacher["teacherId"],
): value is PopulatedTeacherReference & Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function getTeacherPublicId(schedule: ScheduleWithTeacher): string {
  if (isTeacherReferenceObject(schedule.teacherId)) {
    return normalizeText(
      typeof schedule.teacherId.teacherId === "string"
        ? schedule.teacherId.teacherId
        : null,
    );
  }

  if (typeof schedule.teacherId !== "string") {
    return "";
  }

  const normalizedTeacherId = normalizeText(schedule.teacherId);

  if (/^TCH[-_]/i.test(normalizedTeacherId)) {
    return normalizedTeacherId;
  }

  return "";
}

function getTeacherNameFromReference(schedule: ScheduleWithTeacher): string {
  if (isTeacherReferenceObject(schedule.teacherId)) {
    const { userId } = schedule.teacherId;

    if (typeof userId === "string") {
      return normalizeText(userId);
    }

    if (userId && typeof userId === "object") {
      return normalizeText(userId.nama);
    }
  }

  if (typeof schedule.teacherId === "string") {
    const normalizedTeacherValue = normalizeText(schedule.teacherId);

    if (normalizedTeacherValue && !isHexObjectId(normalizedTeacherValue)) {
      return normalizedTeacherValue;
    }
  }

  return normalizeText(schedule.teacher);
}

function getTeacherBranch(schedule: ScheduleWithTeacher): string {
  const scheduleBranch = normalizeText(schedule.branch);

  if (scheduleBranch) {
    return scheduleBranch;
  }

  if (isTeacherReferenceObject(schedule.teacherId)) {
    return normalizeText(
      typeof schedule.teacherId.branch === "string"
        ? schedule.teacherId.branch
        : null,
    );
  }

  return "";
}

function getScheduleStartMinutes(schedule: ScheduleWithTeacher) {
  const [startTime] = normalizeText(schedule.time).split("-");
  const matchedTime = startTime?.trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!matchedTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(matchedTime[1] ?? "0") * 60 + Number(matchedTime[2] ?? "0");
}

function getTeacherIdentity(schedule: ScheduleWithTeacher) {
  const teacherPublicId = getTeacherPublicId(schedule);
  const teacherName = getTeacherNameFromReference(schedule) || missingTeacherLabel;

  return {
    teacherPublicId,
    teacherName,
  };
}

function hasTeacherConflict(current: ScheduleWithTeacher, target: ScheduleWithTeacher): boolean {
  const currentTeacher = getTeacherIdentity(current);
  const targetTeacher = getTeacherIdentity(target);

  if (
    currentTeacher.teacherPublicId &&
    targetTeacher.teacherPublicId &&
    currentTeacher.teacherPublicId === targetTeacher.teacherPublicId
  ) {
    return true;
  }

  if (
    currentTeacher.teacherName === missingTeacherLabel ||
    targetTeacher.teacherName === missingTeacherLabel
  ) {
    return false;
  }

  return currentTeacher.teacherName === targetTeacher.teacherName;
}

function hasSameBranchScope(current: ScheduleWithTeacher, target: ScheduleWithTeacher): boolean {
  const currentBranch = getTeacherBranch(current).toLowerCase();
  const targetBranch = getTeacherBranch(target).toLowerCase();

  if (!currentBranch || !targetBranch) {
    return currentBranch === targetBranch;
  }

  return currentBranch === targetBranch;
}

function hasDifferentKnownBranchScope(
  current: ScheduleWithTeacher,
  target: ScheduleWithTeacher,
): boolean {
  const currentBranch = getTeacherBranch(current).toLowerCase();
  const targetBranch = getTeacherBranch(target).toLowerCase();

  return Boolean(currentBranch && targetBranch && currentBranch !== targetBranch);
}

export function buildSchedulePresentation(
  schedules: ScheduleWithTeacher[],
): PublicSchedule[] {
  const conflictMap = new Map<string, string[]>();

  for (let index = 0; index < schedules.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < schedules.length; compareIndex += 1) {
      const current = schedules[index];
      const target = schedules[compareIndex];

      if (current.day !== target.day) {
        continue;
      }

      const reasons: string[] = [];
      const currentTeacher = getTeacherIdentity(current);
      const isSameBranchScope = hasSameBranchScope(current, target);
      const isSameTimeSlot = current.time === target.time;
      const isSameTeacher = hasTeacherConflict(current, target);

      if (isSameTimeSlot && isSameBranchScope && current.room === target.room) {
        reasons.push(
          `Ruangan ${current.room} dipakai oleh ${current.className} dan ${target.className}.`,
        );
      }

      if (isSameTimeSlot && isSameTeacher) {
        reasons.push(
          `Guru ${currentTeacher.teacherName} terjadwal di dua kelas pada slot yang sama.`,
        );
      }

      if (
        !isSameTimeSlot &&
        isSameTeacher &&
        hasDifferentKnownBranchScope(current, target) &&
        Math.abs(getScheduleStartMinutes(current) - getScheduleStartMinutes(target)) <
          MIN_CROSS_BRANCH_TEACHER_START_GAP_MINUTES
      ) {
        reasons.push(
          `Guru ${currentTeacher.teacherName} memiliki jadwal antar cabang yang terlalu berdekatan pada hari ${current.day}.`,
        );
      }

      if (isSameTimeSlot && isSameBranchScope && current.className === target.className) {
        reasons.push(
          `Kelas ${current.className} terjadwal lebih dari satu kali pada slot yang sama.`,
        );
      }

      if (!reasons.length) {
        continue;
      }

      conflictMap.set(current.scheduleId, [
        ...(conflictMap.get(current.scheduleId) ?? []),
        ...reasons,
      ]);
      conflictMap.set(target.scheduleId, [
        ...(conflictMap.get(target.scheduleId) ?? []),
        ...reasons,
      ]);
    }
  }

  return schedules.map((schedule) => {
    const conflicts = Array.from(new Set(conflictMap.get(schedule.scheduleId) ?? []));
    const status: ScheduleStatus =
      conflicts.length > 0 ? "Bentrok" : schedule.status;
    const teacher = getTeacherIdentity(schedule);

    return {
      id: schedule.scheduleId,
      day: schedule.day,
      time: schedule.time,
      className: schedule.className,
      subject: normalizeText(schedule.subject),
      teacherId: teacher.teacherPublicId,
      teacher: teacher.teacherName,
      branch: getTeacherBranch(schedule),
      room: schedule.room,
      status,
      conflicts,
    };
  });
}
