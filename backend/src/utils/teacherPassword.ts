export function buildGeneratedPasswordFromTeacherId(teacherId: string): string {
  const digits = teacherId.replace(/\D/g, "");
  const suffix = (digits || "0").padStart(3, "0");

  return `guru${suffix}`;
}
