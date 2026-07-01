const CANONICAL_SUBJECT_BY_KEY = new Map<string, string>([
  ["MATEMATIKA", "Matematika"],
  ["MAT", "Matematika"],
  ["MTK", "Matematika"],
  ["BAHASAINDONESIA", "Bahasa Indonesia"],
  ["BINDONESIA", "Bahasa Indonesia"],
  ["BINDO", "Bahasa Indonesia"],
  ["BIND", "Bahasa Indonesia"],
  ["BAHASAINGGRIS", "Bahasa Inggris"],
  ["BINGGRIS", "Bahasa Inggris"],
  ["BING", "Bahasa Inggris"],
  ["ENGLISH", "Bahasa Inggris"],
  ["IPA", "IPA"],
  ["ILMUPENGETAHUANALAM", "IPA"],
  ["SAINS", "IPA"],
  ["SCIENCE", "IPA"],
  ["FISIKA", "IPA"],
  ["KIMIA", "IPA"],
  ["BIOLOGI", "IPA"],
  ["IPS", "IPS"],
  ["ILMUPENGETAHUANSOSIAL", "IPS"],
]);

function normalizeText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function buildSubjectKey(value: string | null | undefined): string {
  return normalizeText(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function canonicalizeAssessmentSubject(
  value: string | null | undefined,
): string {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "";
  }

  return CANONICAL_SUBJECT_BY_KEY.get(buildSubjectKey(normalizedValue)) ?? normalizedValue;
}

export function areAssessmentSubjectsEquivalent(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const leftSubject = canonicalizeAssessmentSubject(left);
  const rightSubject = canonicalizeAssessmentSubject(right);

  return Boolean(
    leftSubject &&
      rightSubject &&
      leftSubject.localeCompare(rightSubject, "id-ID", {
        sensitivity: "base",
      }) === 0,
  );
}
