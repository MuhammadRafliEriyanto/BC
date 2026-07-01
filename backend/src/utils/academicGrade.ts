import type { AcademicGradeScheme, AcademicGradeSemester } from "../models/AcademicGrade";
import { normalizeCanonicalClassName } from "./studentClass";

export type AcademicPeriod = {
  academicYear: string;
  semester: AcademicGradeSemester;
};

export function getCurrentAcademicPeriod(date = new Date()): AcademicPeriod {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? 2026);
  const startYear = month >= 8 ? year : year - 1;

  return {
    academicYear: `${startYear}/${startYear + 1}`,
    semester: month >= 8 ? "Ganjil" : "Genap",
  };
}

export function getAcademicGradeScheme(className: string): AcademicGradeScheme {
  const canonicalClassName = normalizeCanonicalClassName(className) ?? "";
  const grade = Number(canonicalClassName.match(/\b(\d{1,2})\b/)?.[1] ?? 0);

  return grade === 6 || grade === 9 || grade === 12 ? "tryout" : "semester";
}

export function getAcademicGradeScoreKeys(scheme: AcademicGradeScheme) {
  return scheme === "tryout"
    ? (["tryout1", "tryout2", "tryout3"] as const)
    : (["uts", "uas"] as const);
}

export function toPublicAcademicGrade(grade: {
  academicGradeId?: string;
  classId?: string;
  studentId?: string;
  academicYear?: string;
  semester?: AcademicGradeSemester;
  scheme?: AcademicGradeScheme;
  uts: number | null;
  uas: number | null;
  uts1?: number | null;
  uts2?: number | null;
  uts3?: number | null;
  tryout1?: number | null;
  tryout2?: number | null;
  tryout3?: number | null;
  note?: string;
  evaluatedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    academicGradeId: grade.academicGradeId ?? "",
    classId: grade.classId ?? "",
    studentId: grade.studentId ?? "",
    academicYear: grade.academicYear ?? "",
    semester: grade.semester ?? "Genap",
    scheme: grade.scheme ?? "semester",
    scores: {
      uts: grade.uts ?? null,
      uas: grade.uas ?? null,
      uts1: grade.uts1 ?? null,
      uts2: grade.uts2 ?? null,
      uts3: grade.uts3 ?? null,
      tryout1: grade.tryout1 ?? null,
      tryout2: grade.tryout2 ?? null,
      tryout3: grade.tryout3 ?? null,
    },
    note: grade.note?.trim() ?? "",
    evaluatedAt: grade.evaluatedAt?.toISOString() ?? null,
    createdAt: grade.createdAt?.toISOString() ?? null,
    updatedAt: grade.updatedAt?.toISOString() ?? null,
  };
}
