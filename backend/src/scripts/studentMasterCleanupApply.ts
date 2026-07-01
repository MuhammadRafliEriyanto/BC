import mongoose from "mongoose";

import connectDB from "../config/db";
import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { normalizeCanonicalClassName } from "../utils/studentClass";

const AVAILABLE_MODES = [
  "dry-run",
  "apply-normalize-classname",
  "apply-branch-high-confidence",
  "manual-review-report",
] as const;

type CleanupMode = (typeof AVAILABLE_MODES)[number];
type BranchSuggestionConfidence = "high" | "medium";

const CLASS_NAME_NORMALIZATION_MAP = {
  "SMP Kelas 7": "SMP 7",
  "SMA Kelas 10": "SMA 10",
  "SMA Kelas 12": "SMA 12",
} as const satisfies Record<string, string>;

const HIGH_CONFIDENCE_BRANCH_TARGET = {
  canonicalClassName: "SMP 7",
  branch: "Slawi",
} as const;

interface StudentAuditRow {
  studentId: string;
  className: string;
  canonicalClassName: string | null;
  branch: string;
  userId: string | null;
  userResolved: boolean;
}

interface BranchSuggestion {
  suggestedBranch: string;
  confidence: BranchSuggestionConfidence;
  reason: string;
}

interface BranchFillCandidate {
  studentId: string;
  canonicalClassName: string;
  currentClassName: string;
  currentBranch: string;
  suggestedBranch: string;
  confidence: BranchSuggestionConfidence;
  reason: string;
  userId: string | null;
  userResolved: boolean;
}

interface ClassNameNormalizationCandidate {
  studentId: string;
  currentClassName: string;
  canonicalClassName: string;
  branch: string;
  userId: string | null;
  userResolved: boolean;
  autoApplyAllowed: boolean;
  targetClassName: string | null;
}

type AutoApplyClassNameNormalizationCandidate = ClassNameNormalizationCandidate & {
  autoApplyAllowed: true;
  targetClassName: string;
};

interface OrphanUserCandidate {
  studentId: string;
  className: string;
  canonicalClassName: string | null;
  branch: string;
  userId: string | null;
}

interface CanonicalClassGroupReport {
  canonicalClassName: string;
  totalActiveStudents: number;
  branchEmptyCount: number;
  orphanUserCount: number;
  sourceClassNames: string[];
  knownStudentBranches: string[];
  scheduleBranches: string[];
  branchSuggestion: BranchSuggestion | null;
}

interface CleanupReport {
  generatedAt: string;
  auditRows: StudentAuditRow[];
  canonicalGroups: CanonicalClassGroupReport[];
  branchFillCandidates: BranchFillCandidate[];
  classNameNormalizationCandidates: ClassNameNormalizationCandidate[];
  orphanUserCandidates: OrphanUserCandidate[];
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function toId(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    typeof (value as { _id?: { toString?: () => string } })._id?.toString === "function"
  ) {
    return (value as { _id: { toString: () => string } })._id.toString();
  }

  if (typeof (value as { toString?: () => string }).toString === "function") {
    return (value as { toString: () => string }).toString();
  }

  return null;
}

function uniqueSorted(values: Iterable<string>) {
  return [...new Set([...values].map(normalizeText).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, "id-ID"),
  );
}

function buildBranchSuggestion(input: {
  knownStudentBranches: string[];
  scheduleBranches: string[];
}) {
  const knownStudentBranches = uniqueSorted(input.knownStudentBranches);
  const scheduleBranches = uniqueSorted(input.scheduleBranches);

  if (
    knownStudentBranches.length === 1 &&
    scheduleBranches.length === 1 &&
    knownStudentBranches[0] === scheduleBranches[0]
  ) {
    return {
      suggestedBranch: knownStudentBranches[0],
      confidence: "high" as const,
      reason: "Branch siswa non-kosong dan branch schedule sama-sama menunjuk ke satu cabang.",
    };
  }

  if (knownStudentBranches.length === 1 && scheduleBranches.length === 0) {
    return {
      suggestedBranch: knownStudentBranches[0],
      confidence: "medium" as const,
      reason: "Semua siswa yang sudah punya branch pada kelas canonical ini menunjuk ke satu cabang.",
    };
  }

  if (knownStudentBranches.length === 0 && scheduleBranches.length === 1) {
    return {
      suggestedBranch: scheduleBranches[0],
      confidence: "medium" as const,
      reason: "Semua schedule pada kelas canonical ini menunjuk ke satu cabang guru.",
    };
  }

  return null;
}

function parseMode(args: string[]) {
  const modeArgument =
    args.find((arg) => arg.startsWith("--mode="))?.slice("--mode=".length) ?? args[0] ?? "dry-run";

  if (AVAILABLE_MODES.includes(modeArgument as CleanupMode)) {
    return modeArgument as CleanupMode;
  }

  throw new Error(
    `Mode tidak dikenali: "${modeArgument}". Gunakan salah satu: ${AVAILABLE_MODES.join(", ")}`,
  );
}

async function buildCleanupReport(): Promise<CleanupReport> {
  const [students, users, teachers, schedules] = await Promise.all([
    Student.find({ status: "Aktif" })
      .select("studentId className branch userId status")
      .sort({ studentId: 1 })
      .lean(),
    User.find().select("_id").lean(),
    Teacher.find().select("_id branch").lean(),
    Schedule.find().select("scheduleId className teacherId").lean(),
  ]);

  const resolvedUserIdSet = new Set(users.map((user) => toId(user._id)).filter(Boolean) as string[]);
  const teacherBranchById = new Map<string, string>();

  for (const teacher of teachers) {
    const teacherId = toId(teacher._id);

    if (!teacherId) {
      continue;
    }

    teacherBranchById.set(teacherId, normalizeText(teacher.branch));
  }

  const scheduleBranchesByCanonicalClass = new Map<string, Set<string>>();

  for (const schedule of schedules) {
    const canonicalClassName = normalizeCanonicalClassName(normalizeText(schedule.className));
    const teacherId = toId(schedule.teacherId);
    const branch = teacherId ? teacherBranchById.get(teacherId) ?? "" : "";

    if (!canonicalClassName || !branch) {
      continue;
    }

    const existingBranches =
      scheduleBranchesByCanonicalClass.get(canonicalClassName) ?? new Set<string>();
    existingBranches.add(branch);
    scheduleBranchesByCanonicalClass.set(canonicalClassName, existingBranches);
  }

  const auditRows: StudentAuditRow[] = students.map((student) => {
    const userId = toId(student.userId);
    const className = normalizeText(student.className);

    return {
      studentId: normalizeText(student.studentId),
      className,
      canonicalClassName: normalizeCanonicalClassName(className),
      branch: normalizeText(student.branch),
      userId,
      userResolved: userId ? resolvedUserIdSet.has(userId) : false,
    };
  });

  const rowsByCanonicalClass = new Map<string, StudentAuditRow[]>();

  for (const row of auditRows) {
    const canonicalClassName = row.canonicalClassName ?? "(UNRESOLVED)";
    rowsByCanonicalClass.set(canonicalClassName, [
      ...(rowsByCanonicalClass.get(canonicalClassName) ?? []),
      row,
    ]);
  }

  const canonicalGroups: CanonicalClassGroupReport[] = [];
  const branchFillCandidates: BranchFillCandidate[] = [];
  const classNameNormalizationCandidates: ClassNameNormalizationCandidate[] = [];
  const orphanUserCandidates: OrphanUserCandidate[] = [];

  for (const [canonicalClassName, rows] of rowsByCanonicalClass.entries()) {
    const sourceClassNames = uniqueSorted(rows.map((row) => row.className));
    const knownStudentBranches = uniqueSorted(
      rows.filter((row) => row.branch).map((row) => row.branch),
    );
    const scheduleBranches = uniqueSorted(
      scheduleBranchesByCanonicalClass.get(canonicalClassName) ?? [],
    );
    const branchSuggestion =
      canonicalClassName === "(UNRESOLVED)"
        ? null
        : buildBranchSuggestion({ knownStudentBranches, scheduleBranches });

    canonicalGroups.push({
      canonicalClassName,
      totalActiveStudents: rows.length,
      branchEmptyCount: rows.filter((row) => !row.branch).length,
      orphanUserCount: rows.filter((row) => row.userId && !row.userResolved).length,
      sourceClassNames,
      knownStudentBranches,
      scheduleBranches,
      branchSuggestion,
    });

    if (branchSuggestion) {
      for (const row of rows.filter((candidateRow) => !candidateRow.branch)) {
        branchFillCandidates.push({
          studentId: row.studentId,
          canonicalClassName,
          currentClassName: row.className,
          currentBranch: row.branch,
          suggestedBranch: branchSuggestion.suggestedBranch,
          confidence: branchSuggestion.confidence,
          reason: branchSuggestion.reason,
          userId: row.userId,
          userResolved: row.userResolved,
        });
      }
    }

    for (const row of rows) {
      const targetClassName =
        CLASS_NAME_NORMALIZATION_MAP[row.className as keyof typeof CLASS_NAME_NORMALIZATION_MAP] ?? null;
      const autoApplyAllowed = Boolean(targetClassName && targetClassName === row.canonicalClassName);

      if (
        row.canonicalClassName &&
        normalizeText(row.className).toUpperCase() !== row.canonicalClassName.toUpperCase()
      ) {
        classNameNormalizationCandidates.push({
          studentId: row.studentId,
          currentClassName: row.className,
          canonicalClassName: row.canonicalClassName,
          branch: row.branch,
          userId: row.userId,
          userResolved: row.userResolved,
          autoApplyAllowed,
          targetClassName,
        });
      }

      if (row.userId && !row.userResolved) {
        orphanUserCandidates.push({
          studentId: row.studentId,
          className: row.className,
          canonicalClassName: row.canonicalClassName,
          branch: row.branch,
          userId: row.userId,
        });
      }
    }
  }

  canonicalGroups.sort((left, right) =>
    left.canonicalClassName.localeCompare(right.canonicalClassName, "id-ID"),
  );
  branchFillCandidates.sort((left, right) => left.studentId.localeCompare(right.studentId, "id-ID"));
  classNameNormalizationCandidates.sort((left, right) =>
    left.studentId.localeCompare(right.studentId, "id-ID"),
  );
  orphanUserCandidates.sort((left, right) => left.studentId.localeCompare(right.studentId, "id-ID"));

  return {
    generatedAt: new Date().toISOString(),
    auditRows,
    canonicalGroups,
    branchFillCandidates,
    classNameNormalizationCandidates,
    orphanUserCandidates,
  };
}

function getSummary(report: CleanupReport) {
  return {
    activeStudentCount: report.auditRows.length,
    branchEmptyCount: report.auditRows.filter((row) => !row.branch).length,
    classNameNormalizationCandidateCount: report.classNameNormalizationCandidates.length,
    classNameNormalizationAutoApplyCount: report.classNameNormalizationCandidates.filter(
      (candidate) => candidate.autoApplyAllowed,
    ).length,
    branchUpdateCandidateCount: report.branchFillCandidates.length,
    branchUpdateHighConfidenceCount: report.branchFillCandidates.filter(
      (candidate) => candidate.confidence === "high",
    ).length,
    branchUpdateMediumConfidenceCount: report.branchFillCandidates.filter(
      (candidate) => candidate.confidence === "medium",
    ).length,
    orphanUserCount: report.orphanUserCandidates.length,
  };
}

function buildDryRunOutput(report: CleanupReport, mode: CleanupMode) {
  return {
    generatedAt: report.generatedAt,
    mode,
    dryRun: true,
    availableModes: AVAILABLE_MODES,
    summary: getSummary(report),
    autoApplyCandidates: {
      classNameNormalization: report.classNameNormalizationCandidates.filter(
        (candidate) => candidate.autoApplyAllowed,
      ),
      branchHighConfidence: report.branchFillCandidates.filter(
        (candidate) =>
          candidate.confidence === "high" &&
          candidate.canonicalClassName === HIGH_CONFIDENCE_BRANCH_TARGET.canonicalClassName &&
          candidate.suggestedBranch === HIGH_CONFIDENCE_BRANCH_TARGET.branch,
      ),
    },
    manualReviewCandidates: {
      branchMediumConfidence: report.branchFillCandidates.filter(
        (candidate) => candidate.confidence === "medium",
      ),
      orphanUser: report.orphanUserCandidates,
    },
    risks: [
      "Mode apply tidak pernah menyentuh orphan userId.",
      "Mode apply branch hanya menyentuh kandidat high confidence untuk canonical class SMP 7 -> Slawi.",
      "Kandidat branch confidence medium tetap harus diverifikasi manual sebelum update apa pun.",
    ],
  };
}

function buildManualReviewOutput(report: CleanupReport, mode: CleanupMode) {
  const mediumBranchCandidates = report.branchFillCandidates.filter(
    (candidate) => candidate.confidence === "medium",
  );
  const groupedMediumBranchCandidates = mediumBranchCandidates.reduce<
    Record<string, { suggestedBranch: string; candidateCount: number }>
  >((accumulator, candidate) => {
    const key = candidate.canonicalClassName;
    const currentGroup = accumulator[key] ?? {
      suggestedBranch: candidate.suggestedBranch,
      candidateCount: 0,
    };
    currentGroup.candidateCount += 1;
    accumulator[key] = currentGroup;
    return accumulator;
  }, {});

  return {
    generatedAt: report.generatedAt,
    mode,
    dryRun: true,
    summary: getSummary(report),
    mediumBranchCandidateSummary: groupedMediumBranchCandidates,
    mediumBranchCandidates,
    orphanUserCandidates: report.orphanUserCandidates,
    recommendation:
      "Verifikasi manual branch confidence medium dari sumber admin/schedule, lalu relink orphan userId secara manual berdasarkan identitas siswa yang benar.",
  };
}

function getNormalizeApplyCandidates(report: CleanupReport) {
  return report.classNameNormalizationCandidates.filter(
    (candidate): candidate is AutoApplyClassNameNormalizationCandidate =>
      candidate.autoApplyAllowed && typeof candidate.targetClassName === "string",
  );
}

function getBranchHighConfidenceApplyCandidates(report: CleanupReport) {
  return report.branchFillCandidates.filter(
    (candidate) =>
      candidate.confidence === "high" &&
      candidate.canonicalClassName === HIGH_CONFIDENCE_BRANCH_TARGET.canonicalClassName &&
      candidate.suggestedBranch === HIGH_CONFIDENCE_BRANCH_TARGET.branch &&
      !candidate.currentBranch,
  );
}

async function applyNormalizeClassName(report: CleanupReport, mode: CleanupMode) {
  const candidates = getNormalizeApplyCandidates(report);

  console.log(
    JSON.stringify(
      {
        generatedAt: report.generatedAt,
        mode,
        dryRun: false,
        willUpdateCount: candidates.length,
        targetMappings: CLASS_NAME_NORMALIZATION_MAP,
        candidates,
      },
      null,
      2,
    ),
  );

  if (candidates.length === 0) {
    return;
  }

  const result = await Student.bulkWrite(
    candidates.map((candidate) => ({
      updateOne: {
        filter: {
          studentId: candidate.studentId,
          status: "Aktif",
          className: candidate.currentClassName,
        },
        update: {
          $set: {
            className: candidate.targetClassName,
          },
        },
      },
    })),
    { ordered: true },
  );

  console.log(
    JSON.stringify(
      {
        mode,
        applied: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      null,
      2,
    ),
  );
}

async function applyBranchHighConfidence(report: CleanupReport, mode: CleanupMode) {
  const candidates = getBranchHighConfidenceApplyCandidates(report);

  console.log(
    JSON.stringify(
      {
        generatedAt: report.generatedAt,
        mode,
        dryRun: false,
        willUpdateCount: candidates.length,
        target: HIGH_CONFIDENCE_BRANCH_TARGET,
        candidates,
      },
      null,
      2,
    ),
  );

  if (candidates.length === 0) {
    return;
  }

  const result = await Student.bulkWrite(
    candidates.map((candidate) => ({
      updateOne: {
        filter: {
          studentId: candidate.studentId,
          status: "Aktif",
          branch: "",
        },
        update: {
          $set: {
            branch: HIGH_CONFIDENCE_BRANCH_TARGET.branch,
          },
        },
      },
    })),
    { ordered: true },
  );

  console.log(
    JSON.stringify(
      {
        mode,
        applied: true,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      null,
      2,
    ),
  );
}

async function main() {
  const mode = parseMode(process.argv.slice(2));

  await connectDB();

  const report = await buildCleanupReport();

  if (mode === "dry-run") {
    console.log(JSON.stringify(buildDryRunOutput(report, mode), null, 2));
    return;
  }

  if (mode === "manual-review-report") {
    console.log(JSON.stringify(buildManualReviewOutput(report, mode), null, 2));
    return;
  }

  if (mode === "apply-normalize-classname") {
    await applyNormalizeClassName(report, mode);
    return;
  }

  if (mode === "apply-branch-high-confidence") {
    await applyBranchHighConfidence(report, mode);
    return;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
