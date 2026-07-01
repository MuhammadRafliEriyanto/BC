export function buildGeneratedPasswordFromBirthDate(birthDate: string): string {
  const [year, month, day] = birthDate.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}${month}${year}`;
}

export function buildGeneratedPasswordFromStudentId(studentId: string): string {
  const digits = studentId.replace(/\D/g, "");
  const suffix = (digits || "0").padStart(3, "0");

  return `siswa${suffix}`;
}

export function buildGeneratedPasswordForStudent(input: {
  birthDate?: string;
  studentId: string;
}): string {
  const passwordFromBirthDate = input.birthDate
    ? buildGeneratedPasswordFromBirthDate(input.birthDate)
    : "";

  return passwordFromBirthDate || buildGeneratedPasswordFromStudentId(input.studentId);
}
