function normalizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function escapeCsvCell(value: unknown): string {
  const normalizedValue = normalizeCsvCell(value);

  if (/[",\r\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, "\"\"")}"`;
  }

  return normalizedValue;
}

export function buildCsvContent(
  headers: string[],
  rows: Array<Array<unknown>>,
) {
  const csvLines = [
    headers.map((header) => escapeCsvCell(header)).join(","),
    ...rows.map((row) => row.map((value) => escapeCsvCell(value)).join(",")),
  ];

  return `\uFEFF${csvLines.join("\r\n")}`;
}
