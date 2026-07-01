import fs from "node:fs";
import path from "node:path";

import mongoose, { type Types } from "mongoose";

import "../config/env";
import {
  AssessmentQuestionSet,
  type AssessmentCorrectAnswer,
  type AssessmentDifficulty,
  type AssessmentReviewStatus,
} from "../models/AssessmentQuestionSet";
import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { TeacherTryout } from "../models/TeacherTryout";
import { normalizeCanonicalClassName } from "../utils/studentClass";

type AssessmentBankQuestion = {
  questionId?: string;
  number?: number;
  competency?: string;
  topic?: string;
  indicator?: string;
  cognitiveLevel?: string;
  difficulty?: string;
  question?: string;
  options?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  correctAnswer?: string;
  explanation?: string;
  reviewStatus?: string;
  reviewerNotes?: string;
};

type AssessmentBankQuestionSet = {
  schemaVersion?: string;
  questionSetId?: string;
  assessmentType?: string;
  stage?: number | null;
  className?: string;
  grade?: number;
  phase?: string;
  subject?: string;
  questionCount?: number;
  suggestedDurationMinutes?: number;
  reviewStatus?: string;
  curriculumNote?: string;
  questions?: AssessmentBankQuestion[];
};

type AssessmentBankRoot = {
  questionSets?: AssessmentBankQuestionSet[];
};

type AssessmentManifestPackage = {
  packageId?: string;
  branchCode?: string;
  branch?: string;
  className?: string;
  subject?: string;
  assessmentType?: string;
  stage?: number | null;
  questionSetId?: string;
  questionCount?: number;
  suggestedDurationMinutes?: number;
  status?: string;
};

type AssessmentManifestRoot = {
  packages?: AssessmentManifestPackage[];
};

type ScheduleWithTeacher = {
  _id: Types.ObjectId;
  teacherId: {
    _id: Types.ObjectId;
    teacherId?: string;
    subject?: string;
  } | null;
  className?: string;
  subject?: string;
  branch?: string;
  status?: string;
};

type TryoutImportCandidate = {
  branch: string;
  teacherObjectId: Types.ObjectId;
  teacherId: string;
  classId: string;
  className: string;
  kelasLabel: string;
  canonicalClassName: string;
  jenjang: "SD" | "SMP" | "SMA";
  subject: string;
  scheduleCount: number;
  studentCount: number;
  packageData: AssessmentManifestPackage;
  questionSet: AssessmentBankQuestionSet;
};

const ACTIVE_SCHEDULE_STATUSES = ["Berjalan", "Siap", "Review"] as const;
const FINAL_CANONICAL_CLASSES = ["SD 6", "SMP 9", "SMA 12"] as const;
const STAGE_START_AT_BY_STAGE: Record<number, string> = {
  1: "2026-07-12T08:00:00+07:00",
  2: "2026-08-09T08:00:00+07:00",
  3: "2026-09-06T08:00:00+07:00",
};

void Teacher;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildStableClassId(
  teacherPublicId: string,
  branch: string,
  canonicalClassName: string,
) {
  return [
    "class",
    slugify(teacherPublicId) || "guru",
    slugify(branch) || "cabang",
    slugify(canonicalClassName) || "kelas",
  ].join("-");
}

function buildTryoutId(teacherPublicId: string, packageId: string) {
  const teacherCode = normalizeText(teacherPublicId).replace(/[^a-zA-Z0-9]/g, "");
  const packageCode = normalizeText(packageId).replace(/[^a-zA-Z0-9-]/g, "");

  return `TO-${teacherCode}-${packageCode}`.toUpperCase();
}

function inferJenjang(canonicalClassName: string): "SD" | "SMP" | "SMA" {
  const normalizedClassName = normalizeText(canonicalClassName).toUpperCase();

  if (normalizedClassName.startsWith("SD")) {
    return "SD";
  }

  if (normalizedClassName.startsWith("SMP")) {
    return "SMP";
  }

  return "SMA";
}

function buildKelasLabel(canonicalClassName: string) {
  const grade = normalizeText(canonicalClassName).match(/\b(\d{1,2})\b/)?.[1];

  return grade ? `Kelas ${grade}` : canonicalClassName;
}

function getAssessmentBankRoot() {
  return path.resolve(process.cwd(), "..", "data", "assessment-bank");
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function loadAssessmentBank() {
  const assessmentBankRoot = getAssessmentBankRoot();
  const questionSetRoot = readJsonFile<AssessmentBankRoot>(
    path.join(assessmentBankRoot, "all-question-sets.json"),
  );
  const manifestRoot = readJsonFile<AssessmentManifestRoot>(
    path.join(assessmentBankRoot, "manifest.json"),
  );
  const tryoutQuestionSets = (questionSetRoot.questionSets ?? []).filter(
    (questionSet) => questionSet.assessmentType === "Tryout",
  );
  const tryoutPackages = (manifestRoot.packages ?? []).filter(
    (packageData) => packageData.assessmentType === "Tryout",
  );

  return { tryoutQuestionSets, tryoutPackages };
}

function normalizeReviewStatus(value: unknown): AssessmentReviewStatus {
  const normalizedValue = normalizeText(value);

  if (
    normalizedValue === "Perlu Review Guru" ||
    normalizedValue === "Disetujui" ||
    normalizedValue === "Revisi"
  ) {
    return normalizedValue;
  }

  return "Perlu Review Guru";
}

function normalizeDifficulty(value: unknown): AssessmentDifficulty {
  const normalizedValue = normalizeText(value);

  if (
    normalizedValue === "Mudah" ||
    normalizedValue === "Sedang" ||
    normalizedValue === "Sulit"
  ) {
    return normalizedValue;
  }

  return "Sedang";
}

function normalizeCorrectAnswer(value: unknown): AssessmentCorrectAnswer {
  const normalizedValue = normalizeText(value).toUpperCase();

  if (
    normalizedValue === "A" ||
    normalizedValue === "B" ||
    normalizedValue === "C" ||
    normalizedValue === "D"
  ) {
    return normalizedValue;
  }

  throw new Error(`Kunci jawaban tidak valid: ${String(value)}`);
}

function buildQuestionSetDocument(questionSet: AssessmentBankQuestionSet) {
  const questionSetId = normalizeText(questionSet.questionSetId);
  const className = normalizeText(questionSet.className);
  const canonicalClassName =
    normalizeCanonicalClassName(className) ?? className;
  const questions = questionSet.questions ?? [];

  if (!questionSetId) {
    throw new Error("Ada question set tanpa questionSetId.");
  }

  if (!className || !canonicalClassName) {
    throw new Error(`Question set ${questionSetId} tidak memiliki kelas valid.`);
  }

  return {
    schemaVersion: normalizeText(questionSet.schemaVersion) || "1.0.0",
    questionSetId,
    assessmentType: "Tryout" as const,
    stage: typeof questionSet.stage === "number" ? questionSet.stage : null,
    className,
    canonicalClassName,
    grade: typeof questionSet.grade === "number" ? questionSet.grade : 0,
    phase: normalizeText(questionSet.phase),
    subject: normalizeText(questionSet.subject),
    questionCount: questions.length,
    suggestedDurationMinutes:
      typeof questionSet.suggestedDurationMinutes === "number"
        ? questionSet.suggestedDurationMinutes
        : 60,
    reviewStatus: normalizeReviewStatus(questionSet.reviewStatus),
    curriculumNote: normalizeText(questionSet.curriculumNote),
    questions: questions.map((question, index) => ({
      questionId: normalizeText(question.questionId),
      number: typeof question.number === "number" ? question.number : index + 1,
      competency: normalizeText(question.competency),
      topic: normalizeText(question.topic),
      indicator: normalizeText(question.indicator),
      cognitiveLevel: normalizeText(question.cognitiveLevel),
      difficulty: normalizeDifficulty(question.difficulty),
      question: normalizeText(question.question),
      options: {
        A: normalizeText(question.options?.A),
        B: normalizeText(question.options?.B),
        C: normalizeText(question.options?.C),
        D: normalizeText(question.options?.D),
      },
      correctAnswer: normalizeCorrectAnswer(question.correctAnswer),
      explanation: normalizeText(question.explanation),
      reviewStatus: normalizeReviewStatus(question.reviewStatus),
      reviewerNotes: normalizeText(question.reviewerNotes),
    })),
    importedAt: new Date(),
  };
}

function buildPackageLookup(tryoutPackages: AssessmentManifestPackage[]) {
  const packageByScope = new Map<string, AssessmentManifestPackage[]>();

  for (const packageData of tryoutPackages) {
    const branch = normalizeText(packageData.branch);
    const className = normalizeText(packageData.className);
    const canonicalClassName =
      normalizeCanonicalClassName(className) ?? className;
    const subject = normalizeText(packageData.subject);
    const key = `${branch}::${canonicalClassName}::${subject}`;

    packageByScope.set(key, [
      ...(packageByScope.get(key) ?? []),
      packageData,
    ]);
  }

  for (const packages of packageByScope.values()) {
    packages.sort((left, right) => (left.stage ?? 0) - (right.stage ?? 0));
  }

  return packageByScope;
}

function buildQuestionSetLookup(questionSets: AssessmentBankQuestionSet[]) {
  return new Map(
    questionSets.map((questionSet) => [
      normalizeText(questionSet.questionSetId),
      questionSet,
    ]),
  );
}

async function getStudentCountByBranchAndClass() {
  const students = await Student.find({ status: "Aktif" })
    .select("branch className status")
    .lean()
    .exec();
  const studentCountByScope = new Map<string, number>();

  for (const student of students) {
    const branch = normalizeText(student.branch);
    const canonicalClassName =
      normalizeCanonicalClassName(student.className) ??
      normalizeText(student.className);

    if (!branch || !canonicalClassName) {
      continue;
    }

    const key = `${branch}::${canonicalClassName}`;
    studentCountByScope.set(key, (studentCountByScope.get(key) ?? 0) + 1);
  }

  return studentCountByScope;
}

async function buildImportCandidates(
  tryoutPackages: AssessmentManifestPackage[],
  questionSets: AssessmentBankQuestionSet[],
) {
  const packageByScope = buildPackageLookup(tryoutPackages);
  const questionSetById = buildQuestionSetLookup(questionSets);
  const studentCountByScope = await getStudentCountByBranchAndClass();
  const scheduleDocuments = (await Schedule.find({
    status: { $in: ACTIVE_SCHEDULE_STATUSES },
  })
    .select("teacherId className subject branch status")
    .populate("teacherId", "teacherId subject status branches")
    .lean()
    .exec()) as unknown as ScheduleWithTeacher[];
  const scheduleGroups = new Map<
    string,
    Omit<TryoutImportCandidate, "packageData" | "questionSet">
  >();

  for (const schedule of scheduleDocuments) {
    const teacher = schedule.teacherId;
    const branch = normalizeText(schedule.branch);
    const subject = normalizeText(schedule.subject);
    const sourceClassName = normalizeText(schedule.className);
    const canonicalClassName =
      normalizeCanonicalClassName(sourceClassName) ?? sourceClassName;

    if (
      !teacher?._id ||
      !teacher.teacherId ||
      !branch ||
      !subject ||
      !FINAL_CANONICAL_CLASSES.includes(
        canonicalClassName as (typeof FINAL_CANONICAL_CLASSES)[number],
      )
    ) {
      continue;
    }

    const key = [
      branch,
      teacher.teacherId,
      canonicalClassName,
      subject,
    ].join("::");
    const existingGroup = scheduleGroups.get(key);

    if (existingGroup) {
      existingGroup.scheduleCount += 1;
      continue;
    }

    scheduleGroups.set(key, {
      branch,
      teacherObjectId: teacher._id,
      teacherId: teacher.teacherId,
      classId: buildStableClassId(
        teacher.teacherId,
        branch,
        canonicalClassName,
      ),
      className: sourceClassName,
      kelasLabel: buildKelasLabel(canonicalClassName),
      canonicalClassName,
      jenjang: inferJenjang(canonicalClassName),
      subject,
      scheduleCount: 1,
      studentCount:
        studentCountByScope.get(`${branch}::${canonicalClassName}`) ?? 0,
    });
  }

  const candidates: TryoutImportCandidate[] = [];
  const activeScopes = new Set<string>();

  for (const group of scheduleGroups.values()) {
    const scopeKey = `${group.branch}::${group.canonicalClassName}::${group.subject}`;
    activeScopes.add(scopeKey);
    const matchedPackages = packageByScope.get(scopeKey) ?? [];

    for (const packageData of matchedPackages) {
      const questionSetId = normalizeText(packageData.questionSetId);
      const questionSet = questionSetById.get(questionSetId);

      if (!questionSet) {
        throw new Error(`Question set ${questionSetId} tidak ditemukan.`);
      }

      candidates.push({
        ...group,
        packageData,
        questionSet,
      });
    }
  }

  const manifestWithoutActiveSchedule = Array.from(packageByScope.entries())
    .filter(([scopeKey]) => !activeScopes.has(scopeKey))
    .map(([scopeKey, packages]) => {
      const [branch, className, subject] = scopeKey.split("::");

      return {
        branch,
        className,
        subject,
        stages: packages.map((packageData) => packageData.stage).sort(),
        count: packages.length,
      };
    });

  return {
    candidates: candidates.sort((left, right) =>
      [
        left.branch,
        left.teacherId,
        left.canonicalClassName,
        left.subject,
        left.packageData.stage ?? 0,
      ]
        .join("::")
        .localeCompare(
          [
            right.branch,
            right.teacherId,
            right.canonicalClassName,
            right.subject,
            right.packageData.stage ?? 0,
          ].join("::"),
          "id-ID",
        ),
    ),
    manifestWithoutActiveSchedule,
  };
}

function buildTryoutDocument(candidate: TryoutImportCandidate) {
  const packageId = normalizeText(candidate.packageData.packageId);
  const questionSetId = normalizeText(candidate.packageData.questionSetId);
  const stage =
    typeof candidate.packageData.stage === "number"
      ? candidate.packageData.stage
      : null;

  if (!packageId || !questionSetId || !stage) {
    throw new Error(`Paket tryout ${packageId || questionSetId} tidak valid.`);
  }

  const durationMinutes =
    typeof candidate.packageData.suggestedDurationMinutes === "number"
      ? candidate.packageData.suggestedDurationMinutes
      : 60;
  const startAt = new Date(STAGE_START_AT_BY_STAGE[stage]);
  const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

  return {
    teacherId: candidate.teacherObjectId,
    tryoutId: buildTryoutId(candidate.teacherId, packageId),
    classId: candidate.classId,
    branch: candidate.branch,
    canonicalClassName: candidate.canonicalClassName,
    title: `Tryout ${stage} ${candidate.subject} ${candidate.canonicalClassName} - ${candidate.branch}`,
    jenjang: candidate.jenjang,
    kelas: candidate.kelasLabel,
    subject: candidate.subject,
    stage,
    durationMinutes,
    startAt,
    endAt,
    publishStatus: "draft" as const,
    reviewStatus: normalizeReviewStatus(candidate.packageData.status),
    questionSource: "bank" as const,
    questionCount:
      typeof candidate.packageData.questionCount === "number"
        ? candidate.packageData.questionCount
        : candidate.questionSet.questions?.length ?? 0,
    questionBankId: questionSetId,
    questionSetId,
    packageId,
    fileName: null,
  };
}

async function findExistingInvalidTryouts() {
  return TeacherTryout.find({})
    .select(
      "teacherId tryoutId title kelas subject publishStatus questionSource questionCount questionBankId classId branch stage packageId questionSetId",
    )
    .populate("teacherId", "teacherId subject")
    .lean()
    .exec();
}

async function applyImport(
  questionSets: AssessmentBankQuestionSet[],
  candidates: TryoutImportCandidate[],
) {
  let importedQuestionSets = 0;
  let upsertedTryouts = 0;

  for (const questionSet of questionSets) {
    const document = buildQuestionSetDocument(questionSet);

    await AssessmentQuestionSet.findOneAndUpdate(
      { questionSetId: document.questionSetId },
      { $set: document },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).exec();
    importedQuestionSets += 1;
  }

  for (const candidate of candidates) {
    const document = buildTryoutDocument(candidate);

    await TeacherTryout.findOneAndUpdate(
      { tryoutId: document.tryoutId },
      { $set: document },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).exec();
    upsertedTryouts += 1;
  }

  return { importedQuestionSets, upsertedTryouts };
}

function printSummary(input: {
  apply: boolean;
  tryoutQuestionSets: AssessmentBankQuestionSet[];
  candidates: TryoutImportCandidate[];
  manifestWithoutActiveSchedule: Array<{
    branch?: string;
    className?: string;
    subject?: string;
    stages: Array<number | null | undefined>;
    count: number;
  }>;
  existingTryouts: Awaited<ReturnType<typeof findExistingInvalidTryouts>>;
}) {
  const groupedByBranch = input.candidates.reduce<Record<string, number>>(
    (totals, candidate) => {
      totals[candidate.branch] = (totals[candidate.branch] ?? 0) + 1;
      return totals;
    },
    {},
  );
  const candidateRows = input.candidates.map((candidate) => ({
    Cabang: candidate.branch,
    Guru: candidate.teacherId,
    Kelas: candidate.canonicalClassName,
    ClassId: candidate.classId,
    Mapel: candidate.subject,
    Tahap: candidate.packageData.stage,
    Paket: candidate.packageData.packageId,
    Soal: candidate.packageData.questionCount,
    Siswa: candidate.studentCount,
  }));
  const existingTryoutRows = input.existingTryouts.map((tryout) => ({
    Guru:
      typeof tryout.teacherId === "object" && "teacherId" in tryout.teacherId
        ? tryout.teacherId.teacherId
        : String(tryout.teacherId),
    MapelGuru:
      typeof tryout.teacherId === "object" && "subject" in tryout.teacherId
        ? tryout.teacherId.subject
        : "",
    Tryout: tryout.tryoutId,
    Judul: tryout.title,
    Kelas: tryout.kelas,
    Mapel: tryout.subject,
    Cabang: tryout.branch ?? "",
    ClassId: tryout.classId ?? "",
    Source: tryout.questionSource,
    Soal: tryout.questionCount,
  }));

  console.log(
    JSON.stringify(
      {
        mode: input.apply ? "apply" : "dry-run",
        tryoutQuestionSetCount: input.tryoutQuestionSets.length,
        candidateTryoutCount: input.candidates.length,
        groupedByBranch,
        manifestWithoutActiveSchedule: input.manifestWithoutActiveSchedule,
        existingTeacherTryoutCount: input.existingTryouts.length,
      },
      null,
      2,
    ),
  );

  console.table(candidateRows);

  if (input.manifestWithoutActiveSchedule.length > 0) {
    console.log("Paket bank soal tryout yang tidak dibuat menjadi tryout aktif:");
    console.table(input.manifestWithoutActiveSchedule);
  }

  if (existingTryoutRows.length > 0) {
    console.log("Tryout lama yang sudah ada dan tidak disentuh script ini:");
    console.table(existingTryoutRows);
  }
}

async function run() {
  const apply = process.argv.includes("--apply");
  const { tryoutQuestionSets, tryoutPackages } = loadAssessmentBank();

  await mongoose.connect(process.env.MONGO_URI as string);

  try {
    const { candidates, manifestWithoutActiveSchedule } =
      await buildImportCandidates(tryoutPackages, tryoutQuestionSets);
    const existingTryouts = await findExistingInvalidTryouts();

    printSummary({
      apply,
      tryoutQuestionSets,
      candidates,
      manifestWithoutActiveSchedule,
      existingTryouts,
    });

    if (!apply) {
      console.log("Dry-run selesai. Tambahkan --apply untuk menulis ke database.");
      return;
    }

    const result = await applyImport(tryoutQuestionSets, candidates);

    console.log(
      `Import selesai. Bank soal di-upsert: ${result.importedQuestionSets}. Tryout guru di-upsert: ${result.upsertedTryouts}.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
