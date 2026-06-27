export type AcademicGradeScheme = "semester" | "tryout";
export type AcademicScoreKey =
  | "uts"
  | "uas"
  | "uts1"
  | "uts2"
  | "uts3"
  | "tryout1"
  | "tryout2"
  | "tryout3";

export type AcademicScores = Record<AcademicScoreKey, number | null>;

export const EMPTY_ACADEMIC_SCORES: AcademicScores = {
  uts: null,
  uas: null,
  uts1: null,
  uts2: null,
  uts3: null,
  tryout1: null,
  tryout2: null,
  tryout3: null,
};

export const ACADEMIC_SCORE_LABELS: Record<AcademicScoreKey, string> = {
  uts: "Simulasi UTS 1",
  uas: "Simulasi UAS 1",
  uts1: "UTS 1",
  uts2: "UTS 2",
  uts3: "UTS 3",
  tryout1: "Tryout 1",
  tryout2: "Tryout 2",
  tryout3: "Tryout 3",
};

export function getAcademicGradeScheme(className: string): AcademicGradeScheme {
  const match = className.match(/(?:^|\s)(1[0-2]|[2-9])(?:[A-Za-z]|\b)/);
  const grade = match ? Number(match[1]) : 0;
  return grade === 6 || grade === 9 || grade === 12 ? "tryout" : "semester";
}

export function getAcademicScoreKeys(scheme: AcademicGradeScheme) {
  return scheme === "tryout"
    ? (["tryout1", "tryout2", "tryout3"] as const)
    : (["uts", "uas"] as const);
}

export function calculateTotalScores(scores: Array<number | null>) {
  const availableScores = scores.filter(
    (score): score is number => typeof score === "number" && Number.isFinite(score),
  );

  return availableScores.reduce((total, score) => total + score, 0);
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
