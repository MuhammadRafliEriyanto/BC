export type StudentAcademicPeriod = {
  academicYear?: string;
  semester?: string;
};

export type StudentAcademicAccess = {
  isUpcomingClassLocked?: boolean;
  period?: StudentAcademicPeriod;
  startsAt?: string | null;
  className?: string;
  message?: string | null;
};

const UPCOMING_CLASS_FALLBACK_MESSAGE =
  "Kelas berikutnya sudah terdaftar. Pembelajaran akan dibuka saat periode belajar baru dimulai.";

export function getStudentAcademicAccessMessage(
  academicAccess: StudentAcademicAccess | null | undefined,
) {
  if (!academicAccess?.isUpcomingClassLocked) {
    return null;
  }

  return academicAccess.message?.trim() || UPCOMING_CLASS_FALLBACK_MESSAGE;
}
