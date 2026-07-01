export function formatDateOnly(value: Date | null | undefined): string {
  if (!value || Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}
