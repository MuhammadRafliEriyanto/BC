import mongoose from "mongoose";

import connectDB from "../config/db";
import { Schedule } from "../models/Schedule";
import { Student } from "../models/Student";
import { Teacher } from "../models/Teacher";
import { User } from "../models/User";
import { normalizeCanonicalClassName } from "../utils/studentClass";

type BranchSuggestionConfidence = "high" | "medium";

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
}

interface OrphanUserCandidate {
  studentId: string;
  className: string;
  canonicalClassName: string | null;
  branch: string;
  userId: string | null;
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

function resolveCanonicalClassName(className: string) {
  return normalizeCanonicalClassName(className);
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

async function main() {
  await connectDB();

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
    const canonicalClassName = resolveCanonicalClassName(normalizeText(schedule.className));
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

    return {
      studentId: normalizeText(student.studentId),
      className: normalizeText(student.className),
      canonicalClassName: resolveCanonicalClassName(normalizeText(student.className)),
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

  const output = {
    generatedAt: new Date().toISOString(),
    dryRun: true,
    summary: {
      activeStudentCount: auditRows.length,
      branchEmptyCount: auditRows.filter((row) => !row.branch).length,
      branchUpdateCandidateCount: branchFillCandidates.length,
      branchUpdateHighConfidenceCount: branchFillCandidates.filter(
        (candidate) => candidate.confidence === "high",
      ).length,
      classNameNormalizationCandidateCount: classNameNormalizationCandidates.length,
      orphanUserCount: orphanUserCandidates.length,
    },
    auditRows,
    canonicalGroups,
    candidateUpdates: {
      branchFillCandidates,
      classNameNormalizationCandidates,
      orphanUserCandidates,
    },
    risks: [
      "Update branch otomatis berisiko salah assign jika satu kelas canonical ternyata dipakai lebih dari satu cabang di data master yang belum lengkap.",
      "Normalisasi className relatif lebih aman bila canonicalClassName terdeteksi jelas, tetapi tetap perlu dicek jika ada impor lama yang masih mengandalkan format teks lama.",
      "Relink user orphan tidak aman dilakukan otomatis tanpa verifikasi identitas siswa yang benar dari nama, email, atau sumber data admin.",
    ],
    recommendation:
      "Aman untuk menjalankan update otomatis hanya pada kandidat branch confidence high dan normalisasi className yang canonical-nya jelas. Untuk candidate confidence medium dan semua orphan user, lebih aman diverifikasi manual dulu.",
  };

  console.log(JSON.stringify(output, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
