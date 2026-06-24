export type AcademicGradeScheme = "semester" | "tryout";
export type AcademicScoreKey =
  | "uts"
  | "uas"
  | "tryout1"
  | "tryout2"
  | "tryout3";

export type AcademicScores = Record<AcademicScoreKey, number | null>;

export const EMPTY_ACADEMIC_SCORES: AcademicScores = {
  uts: null,
  uas: null,
  tryout1: null,
  tryout2: null,
  tryout3: null,
};

export const ACADEMIC_SCORE_LABELS: Record<AcademicScoreKey, string> = {
  uts: "UTS",
  uas: "UAS",
  tryout1: "Tryout 1",
  tryout2: "Tryout 2",
  tryout3: "Tryout 3",
};

export function getAcademicGradeScheme(className: string): AcademicGradeScheme {
  const grade = Number(className.match(/\b(4|5|6|7|8|9|10|11|12)\b/)?.[1] ?? 0);
  return grade === 6 || grade === 9 || grade === 12 ? "tryout" : "semester";
}

export function getAcademicScoreKeys(scheme: AcademicGradeScheme) {
  return scheme === "tryout"
    ? (["tryout1", "tryout2", "tryout3"] as const)
    : (["uts", "uas"] as const);
}

export function averageAvailableScores(scores: Array<number | null>) {
  const availableScores = scores.filter(
    (score): score is number => typeof score === "number" && Number.isFinite(score),
  );

  if (availableScores.length === 0) {
    return null;
  }

  return Math.round(
    availableScores.reduce((total, score) => total + score, 0) /
      availableScores.length,
  );
}
