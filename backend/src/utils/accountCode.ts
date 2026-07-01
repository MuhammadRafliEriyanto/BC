export function normalizeLoginCode(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function buildPaddedPublicId(prefix: "STD" | "TCH", digits: string): string {
  return `${prefix}-${digits.padStart(3, "0")}`;
}

export function buildStudentLoginCode(studentId: string): string {
  return normalizeLoginCode(studentId);
}

export function buildTeacherLoginCode(teacherId: string): string {
  return normalizeLoginCode(teacherId);
}

export function getLoginCodeLookupCandidates(value: string | null | undefined): string[] {
  const normalizedValue = normalizeLoginCode(value);

  if (!normalizedValue) {
    return [];
  }

  const candidates = new Set<string>([normalizedValue]);
  const compactValue = normalizedValue.replace(/[-_.]/g, "");
  const studentMatch = compactValue.match(/^(?:SISWA|STD)(\d+)$/);
  const teacherMatch = compactValue.match(/^(?:GURU|TCH)(\d+)$/);

  if (studentMatch?.[1]) {
    candidates.add(buildPaddedPublicId("STD", studentMatch[1]));
  }

  if (teacherMatch?.[1]) {
    candidates.add(buildPaddedPublicId("TCH", teacherMatch[1]));
  }

  return Array.from(candidates);
}
