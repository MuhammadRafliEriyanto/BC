import * as XLSX from "xlsx";

import { AppError } from "./apiResponse";

export type ParsedTryoutXlsxQuestion = {
  order: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  topic: string;
  difficulty: string;
};

export type ParsedTryoutXlsxMetadata = {
  questionSetId: string;
  assessmentType: string;
  stage: number | null;
  className: string;
  subject: string;
  questionCount: number | null;
  suggestedDurationMinutes: number | null;
};

export type ParsedTryoutXlsxResult = {
  questions: ParsedTryoutXlsxQuestion[];
  metadata: ParsedTryoutXlsxMetadata | null;
};

const HEADER_ALIASES = {
  order: ["no", "nomor", "number", "urutan"],
  questionText: ["pertanyaan", "soal", "question", "questiontext"],
  optionA: ["opsia", "pilihana", "optiona", "a"],
  optionB: ["opsib", "pilihanb", "optionb", "b"],
  optionC: ["opsic", "pilihanc", "optionc", "c"],
  optionD: ["opsid", "pilihand", "optiond", "d"],
  correctAnswer: [
    "jawabanbenar",
    "kuncijawaban",
    "jawaban",
    "answer",
    "correctanswer",
  ],
  explanation: ["pembahasan", "penjelasan", "explanation"],
  topic: ["topik", "materi", "topic"],
  difficulty: ["kesulitan", "difficulty", "level"],
} as const;

type HeaderKey = keyof typeof HEADER_ALIASES;
type XlsxRow = Record<string, unknown>;

function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().replace(/\s+/g, " ");
}

function getCell(row: XlsxRow, key: HeaderKey) {
  const aliases = new Set<string>(HEADER_ALIASES[key]);
  const matchedEntry = Object.entries(row).find(([header]) =>
    aliases.has(normalizeHeader(header)),
  );

  return normalizeText(matchedEntry?.[1]);
}

function normalizeCorrectAnswer(value: string) {
  const normalizedValue = value.toUpperCase().trim();

  if (
    normalizedValue === "A" ||
    normalizedValue === "B" ||
    normalizedValue === "C" ||
    normalizedValue === "D"
  ) {
    return normalizedValue;
  }

  return null;
}

function isBlankQuestionRow(row: XlsxRow) {
  return (
    !getCell(row, "questionText") &&
    !getCell(row, "optionA") &&
    !getCell(row, "optionB") &&
    !getCell(row, "optionC") &&
    !getCell(row, "optionD") &&
    !getCell(row, "correctAnswer")
  );
}

function parsePositiveInteger(value: unknown) {
  const parsedValue = Number.parseInt(normalizeText(value), 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function parseMetadata(workbook: XLSX.WorkBook): ParsedTryoutXlsxMetadata | null {
  const metadataSheetName = workbook.SheetNames.find(
    (sheetName) => normalizeHeader(sheetName) === "metadata",
  );

  if (!metadataSheetName) {
    return null;
  }

  const metadataSheet = workbook.Sheets[metadataSheetName];

  if (!metadataSheet) {
    return null;
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(metadataSheet, {
    header: 1,
    defval: "",
  });
  const values = new Map<string, unknown>();

  for (const row of rows.slice(1)) {
    const [field, value] = row;
    const normalizedField = normalizeHeader(normalizeText(field));

    if (normalizedField) {
      values.set(normalizedField, value);
    }
  }

  const assessmentType = normalizeText(values.get("assessmenttype"));

  if (
    assessmentType &&
    !["uts", "uas", "tryout"].includes(assessmentType.toLowerCase())
  ) {
    throw new AppError(
      400,
      "Metadata XLSX wajib bertipe UTS, UAS, atau Tryout.",
    );
  }

  return {
    questionSetId: normalizeText(values.get("questionsetid")),
    assessmentType,
    stage: parsePositiveInteger(values.get("stage")),
    className: normalizeText(values.get("classname")),
    subject: normalizeText(values.get("subject")),
    questionCount: parsePositiveInteger(values.get("questioncount")),
    suggestedDurationMinutes: parsePositiveInteger(
      values.get("suggesteddurationminutes"),
    ),
  };
}

export function parseTryoutXlsxBuffer(buffer: Buffer): ParsedTryoutXlsxResult {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new AppError(400, "File XLSX tidak memiliki sheet soal.");
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new AppError(400, "Sheet soal tidak ditemukan pada file XLSX.");
  }

  const rows = XLSX.utils.sheet_to_json<XlsxRow>(sheet, {
    defval: "",
  });
  const questions: ParsedTryoutXlsxQuestion[] = [];

  rows.forEach((row, index) => {
    if (isBlankQuestionRow(row)) {
      return;
    }

    const rowNumber = index + 2;
    const questionText = getCell(row, "questionText");
    const optionA = getCell(row, "optionA");
    const optionB = getCell(row, "optionB");
    const optionC = getCell(row, "optionC");
    const optionD = getCell(row, "optionD");
    const correctAnswer = normalizeCorrectAnswer(getCell(row, "correctAnswer"));

    if (!questionText) {
      throw new AppError(400, `Baris ${rowNumber}: pertanyaan wajib diisi.`);
    }

    if (!optionA || !optionB || !optionC || !optionD) {
      throw new AppError(
        400,
        `Baris ${rowNumber}: opsi A, B, C, dan D wajib diisi.`,
      );
    }

    if (!correctAnswer) {
      throw new AppError(
        400,
        `Baris ${rowNumber}: jawaban benar wajib A, B, C, atau D.`,
      );
    }

    const order = Number.parseInt(getCell(row, "order"), 10);

    questions.push({
      order: Number.isInteger(order) && order > 0 ? order : questions.length + 1,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation: getCell(row, "explanation"),
      topic: getCell(row, "topic"),
      difficulty: getCell(row, "difficulty") || "Sedang",
    });
  });

  if (questions.length === 0) {
    throw new AppError(
      400,
      "File XLSX belum berisi soal. Pastikan ada kolom Pertanyaan, Opsi A-D, dan Jawaban Benar.",
    );
  }

  const metadata = parseMetadata(workbook);

  if (
    metadata?.questionCount != null &&
    metadata?.questionCount !== questions.length
  ) {
    throw new AppError(
      400,
      `Metadata menyebutkan ${metadata.questionCount} soal, tetapi sheet Soal berisi ${questions.length} soal.`,
    );
  }

  return {
    questions: questions.sort((left, right) => left.order - right.order),
    metadata,
  };
}
