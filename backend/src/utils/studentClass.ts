export const STUDENT_LEVELS = ["SD", "SMP", "SMA"] as const;

export type StudentLevel = (typeof STUDENT_LEVELS)[number];

export const STUDENT_GRADE_OPTIONS_BY_LEVEL: Record<StudentLevel, readonly string[]> = {
  SD: ["2", "3", "4", "5", "6"],
  SMP: ["7", "8", "9"],
  SMA: ["10", "11", "12"],
};

const STUDENT_CLASS_SEQUENCE = [
  { level: "SD", grade: "2" },
  { level: "SD", grade: "3" },
  { level: "SD", grade: "4" },
  { level: "SD", grade: "5" },
  { level: "SD", grade: "6" },
  { level: "SMP", grade: "7" },
  { level: "SMP", grade: "8" },
  { level: "SMP", grade: "9" },
  { level: "SMA", grade: "10" },
  { level: "SMA", grade: "11" },
  { level: "SMA", grade: "12" },
] as const satisfies ReadonlyArray<{ level: StudentLevel; grade: string }>;

function normalizeText(value: string | undefined | null) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function normalizeStudentLevel(value: string | undefined | null) {
  const normalizedValue = normalizeText(value).toUpperCase();

  if (normalizedValue === "SD" || normalizedValue === "SMP" || normalizedValue === "SMA") {
    return normalizedValue;
  }

  return null;
}

export function normalizeStudentGrade(value: string | undefined | null) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/(?:^|\s)(1[0-2]|[2-9])(?:[A-Za-z]|\b)/);
  return match?.[1] ?? null;
}

export function buildCanonicalClassName(
  level: StudentLevel,
  grade: string | undefined | null,
) {
  const normalizedGrade = normalizeStudentGrade(grade);

  if (
    !normalizedGrade ||
    !STUDENT_GRADE_OPTIONS_BY_LEVEL[level].includes(normalizedGrade)
  ) {
    return null;
  }

  return `${level} ${normalizedGrade}`;
}

export function normalizeCanonicalClassName(value: string | undefined | null) {
  const normalizedValue = normalizeText(value).toUpperCase();

  if (!normalizedValue) {
    return null;
  }

  const normalizedGrade = normalizeStudentGrade(normalizedValue);

  if (!normalizedGrade) {
    return null;
  }

  if (normalizedValue.includes("SD")) {
    return buildCanonicalClassName("SD", normalizedGrade);
  }

  if (normalizedValue.includes("SMP")) {
    return buildCanonicalClassName("SMP", normalizedGrade);
  }

  if (normalizedValue.includes("SMA")) {
    return buildCanonicalClassName("SMA", normalizedGrade);
  }

  if (["2", "3", "4", "5", "6"].includes(normalizedGrade)) {
    return buildCanonicalClassName("SD", normalizedGrade);
  }

  if (["7", "8", "9"].includes(normalizedGrade)) {
    return buildCanonicalClassName("SMP", normalizedGrade);
  }

  if (["10", "11", "12"].includes(normalizedGrade)) {
    return buildCanonicalClassName("SMA", normalizedGrade);
  }

  return null;
}

export function resolveCanonicalClassSelection(input: {
  level?: string | null;
  grade?: string | null;
  className?: string | null;
}) {
  const level = normalizeStudentLevel(input.level);
  const grade = normalizeStudentGrade(input.grade);
  const canonicalFromClassName = normalizeCanonicalClassName(input.className);
  const canonicalFromLevelAndGrade = level ? buildCanonicalClassName(level, grade) : null;

  if (!level) {
    return null;
  }

  if (!grade && !canonicalFromClassName) {
    return null;
  }

  if (canonicalFromClassName && !canonicalFromClassName.startsWith(`${level} `)) {
    return null;
  }

  if (
    canonicalFromClassName &&
    canonicalFromLevelAndGrade &&
    canonicalFromClassName !== canonicalFromLevelAndGrade
  ) {
    return null;
  }

  const className = canonicalFromLevelAndGrade ?? canonicalFromClassName;
  const resolvedGrade = normalizeStudentGrade(className);

  if (!className || !resolvedGrade) {
    return null;
  }

  return {
    level,
    grade: resolvedGrade,
    className,
  };
}

export function resolveNextAcademicClassSelection(input: {
  program?: string | null;
  className?: string | null;
}) {
  const canonicalClassName =
    normalizeCanonicalClassName(input.className) ??
    (() => {
      const level = normalizeStudentLevel(input.program);
      return level ? buildCanonicalClassName(level, input.className) : null;
    })();

  if (!canonicalClassName) {
    return null;
  }

  const currentIndex = STUDENT_CLASS_SEQUENCE.findIndex(
    (item) => `${item.level} ${item.grade}` === canonicalClassName,
  );

  if (currentIndex < 0) {
    return null;
  }

  const nextClass =
    STUDENT_CLASS_SEQUENCE[Math.min(currentIndex + 1, STUDENT_CLASS_SEQUENCE.length - 1)];

  return {
    level: nextClass.level,
    grade: nextClass.grade,
    className: `${nextClass.level} ${nextClass.grade}`,
  };
}
