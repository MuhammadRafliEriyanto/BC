import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import mongoose, { Types } from "mongoose";

import "../config/env";

type TeacherRow = {
  _id: Types.ObjectId;
  teacherId: string;
  userId: Types.ObjectId;
  subject: string;
  branch: string;
  branches?: string[];
};

type UserRow = {
  _id: Types.ObjectId;
  nama: string;
  email: string;
};

const TEACHER_PAIRS = Array.from({ length: 13 }, (_, index) => ({
  primaryId: `TCH-${String(index + 1).padStart(3, "0")}`,
  duplicateId: `TCH-${String(index + 14).padStart(3, "0")}`,
}));

const CLASS_SCOPED_COLLECTIONS = [
  "classmaterials",
  "classtasks",
  "attendancesessions",
  "tasksubmissions",
  "taskgrades",
  "academicgrades",
  "teacherclasssettings",
] as const;

const TEACHER_SCOPED_COLLECTIONS = [
  "teachertryouts",
  "teachertryoutquestions",
] as const;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeKey(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function migrateClassId(classId: unknown, primaryId: string, duplicateId: string) {
  const currentClassId = normalizeText(classId);

  if (!currentClassId) {
    return currentClassId;
  }

  const duplicatePrefix = `class-${slugify(duplicateId)}-`;
  const primaryPrefix = `class-${slugify(primaryId)}-`;

  return currentClassId.startsWith(duplicatePrefix)
    ? `${primaryPrefix}${currentClassId.slice(duplicatePrefix.length)}`
    : currentClassId;
}

function toBackupValue(value: unknown): unknown {
  if (value instanceof Date) {
    return { $date: value.toISOString() };
  }

  if (value instanceof Types.ObjectId) {
    return { $oid: value.toString() };
  }

  if (Array.isArray(value)) {
    return value.map(toBackupValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toBackupValue(nestedValue)]),
    );
  }

  return value;
}

async function loadValidatedPairs() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Koneksi database belum tersedia.");
  }

  const teacherIds = TEACHER_PAIRS.flatMap((pair) => [pair.primaryId, pair.duplicateId]);
  const teachers = (await db
    .collection<TeacherRow>("teachers")
    .find({ teacherId: { $in: teacherIds } })
    .toArray()) as TeacherRow[];
  const teacherByPublicId = new Map(teachers.map((teacher) => [teacher.teacherId, teacher]));
  const teacherUsers = (await db
    .collection<UserRow>("users")
    .find({ _id: { $in: teachers.map((teacher) => teacher.userId) } })
    .toArray()) as UserRow[];
  const userById = new Map(teacherUsers.map((user) => [user._id.toString(), user]));

  return TEACHER_PAIRS.map((pair) => {
    const primary = teacherByPublicId.get(pair.primaryId);
    const duplicate = teacherByPublicId.get(pair.duplicateId);

    if (!primary || !duplicate) {
      throw new Error(`Pasangan ${pair.primaryId}/${pair.duplicateId} tidak lengkap.`);
    }

    const primaryUser = userById.get(primary.userId.toString());
    const duplicateUser = userById.get(duplicate.userId.toString());

    if (!primaryUser || !duplicateUser) {
      throw new Error(`User pasangan ${pair.primaryId}/${pair.duplicateId} tidak lengkap.`);
    }

    if (normalizeKey(primaryUser.nama) !== normalizeKey(duplicateUser.nama)) {
      throw new Error(`Nama pasangan ${pair.primaryId}/${pair.duplicateId} tidak sama.`);
    }

    if (normalizeKey(primary.subject) !== normalizeKey(duplicate.subject)) {
      throw new Error(`Mapel pasangan ${pair.primaryId}/${pair.duplicateId} tidak sama.`);
    }

    return { ...pair, primary, duplicate, primaryUser, duplicateUser };
  });
}

async function buildBackup(pairs: Awaited<ReturnType<typeof loadValidatedPairs>>) {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Koneksi database belum tersedia.");
  }

  const affectedTeacherIds = pairs.flatMap(({ primary, duplicate }) => [
    primary._id,
    duplicate._id,
  ]);
  const affectedUserIds = pairs.flatMap(({ primary, duplicate }) => [
    primary.userId,
    duplicate.userId,
  ]);
  const collectionNames = [
    "teachers",
    "users",
    "schedules",
    ...CLASS_SCOPED_COLLECTIONS,
    ...TEACHER_SCOPED_COLLECTIONS,
  ];
  const collections: Record<string, unknown[]> = {};

  for (const collectionName of collectionNames) {
    const filter = collectionName === "users"
      ? { _id: { $in: affectedUserIds } }
      : collectionName === "teachers"
        ? { _id: { $in: affectedTeacherIds } }
        : { teacherId: { $in: affectedTeacherIds } };
    collections[collectionName] = await db.collection(collectionName).find(filter).toArray();
  }

  const backupDirectory = path.resolve(process.cwd(), "storage", "backups");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDirectory, `teacher-branch-merge-${timestamp}.json`);

  await mkdir(backupDirectory, { recursive: true });
  await writeFile(
    backupPath,
    JSON.stringify(
      toBackupValue({
        createdAt: new Date(),
        migration: "merge-duplicate-branch-teachers-v1",
        pairs: TEACHER_PAIRS,
        collections,
      }),
      null,
      2,
    ),
    "utf8",
  );

  return { backupPath, collections };
}

async function assertDuplicateUsersAreSafeToDelete(
  pairs: Awaited<ReturnType<typeof loadValidatedPairs>>,
) {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Koneksi database belum tersedia.");
  }

  const duplicateUserIds = pairs.map(({ duplicate }) => duplicate.userId);
  const references = await Promise.all([
    db.collection("students").countDocuments({ userId: { $in: duplicateUserIds } }),
    db.collection("payments").countDocuments({ userId: { $in: duplicateUserIds } }),
    db.collection("subscriptions").countDocuments({ userId: { $in: duplicateUserIds } }),
  ]);

  if (references.some((count) => count > 0)) {
    throw new Error(
      `User duplikat masih direferensikan koleksi lain: students=${references[0]}, payments=${references[1]}, subscriptions=${references[2]}.`,
    );
  }
}

async function migratePair(
  pair: Awaited<ReturnType<typeof loadValidatedPairs>>[number],
) {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Koneksi database belum tersedia.");
  }

  const primaryBranches = Array.from(
    new Set(
      [
        pair.primary.branch,
        ...(pair.primary.branches ?? []),
        pair.duplicate.branch,
        ...(pair.duplicate.branches ?? []),
      ]
        .map(normalizeText)
        .filter(Boolean),
    ),
  );

  await db.collection("schedules").updateMany(
    { teacherId: pair.primary._id, $or: [{ branch: { $exists: false } }, { branch: "" }] },
    { $set: { branch: pair.primary.branch } },
  );
  await db.collection("schedules").updateMany(
    { teacherId: pair.duplicate._id },
    { $set: { teacherId: pair.primary._id, branch: pair.duplicate.branch } },
  );

  for (const collectionName of CLASS_SCOPED_COLLECTIONS) {
    const collection = db.collection(collectionName);
    const documents = await collection.find({ teacherId: pair.duplicate._id }).toArray();

    if (documents.length === 0) {
      continue;
    }

    await collection.bulkWrite(
      documents.map((document) => ({
        updateOne: {
          filter: { _id: document._id },
          update: {
            $set: {
              teacherId: pair.primary._id,
              classId: migrateClassId(
                document.classId,
                pair.primaryId,
                pair.duplicateId,
              ),
            },
          },
        },
      })),
      { ordered: true },
    );
  }

  for (const collectionName of TEACHER_SCOPED_COLLECTIONS) {
    await db.collection(collectionName).updateMany(
      { teacherId: pair.duplicate._id },
      { $set: { teacherId: pair.primary._id } },
    );
  }

  await db.collection("teachers").updateOne(
    { _id: pair.primary._id },
    {
      $set: {
        branch: pair.duplicate.branch,
        branches: primaryBranches,
        updatedAt: new Date(),
      },
    },
  );
  await db.collection("teachers").deleteOne({ _id: pair.duplicate._id });
  await db.collection("users").deleteOne({ _id: pair.duplicate.userId });
}

async function auditResult(
  duplicateTeacherObjectIds: Types.ObjectId[],
  duplicateUserIds: Types.ObjectId[],
) {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Koneksi database belum tersedia.");
  }

  const duplicateIds = TEACHER_PAIRS.map((pair) => pair.duplicateId);
  const remainingDuplicateTeachers = await db
    .collection("teachers")
    .countDocuments({ teacherId: { $in: duplicateIds } });
  const primaryTeachers = await db
    .collection<TeacherRow>("teachers")
    .find({ teacherId: { $in: TEACHER_PAIRS.map((pair) => pair.primaryId) } })
    .toArray();
  const remainingDuplicateReferences: Record<string, number> = {};

  for (const collectionName of [
    "schedules",
    ...CLASS_SCOPED_COLLECTIONS,
    ...TEACHER_SCOPED_COLLECTIONS,
  ]) {
    remainingDuplicateReferences[collectionName] = await db.collection(collectionName).countDocuments({
      teacherId: { $in: duplicateTeacherObjectIds },
    });
  }

  const remainingDuplicateUsers = await db
    .collection("users")
    .countDocuments({ _id: { $in: duplicateUserIds } });

  return {
    primaryTeacherCount: primaryTeachers.length,
    remainingDuplicateTeachers,
    remainingDuplicateUsers,
    mergedTeacherBranches: primaryTeachers.map((teacher) => ({
      teacherId: teacher.teacherId,
      branch: teacher.branch,
      branches: teacher.branches,
    })),
    remainingDuplicateReferences,
  };
}

async function run() {
  const apply = process.argv.includes("--apply");
  await mongoose.connect(process.env.MONGO_URI as string);

  try {
    const pairs = await loadValidatedPairs();
    const duplicateTeacherObjectIds = pairs.map(({ duplicate }) => duplicate._id);
    const duplicateUserIds = pairs.map(({ duplicate }) => duplicate.userId);
    await assertDuplicateUsersAreSafeToDelete(pairs);
    const counts = await Promise.all(
      pairs.map(async (pair) => ({
        primaryId: pair.primaryId,
        duplicateId: pair.duplicateId,
        name: pair.primaryUser.nama,
        primaryBranch: pair.primary.branch,
        duplicateBranch: pair.duplicate.branch,
        schedulesToMove: await mongoose.connection.db!
          .collection("schedules")
          .countDocuments({ teacherId: pair.duplicate._id }),
      })),
    );

    console.table(counts);

    if (!apply) {
      console.log("Dry-run selesai. Jalankan dengan --apply untuk menerapkan migrasi.");
      return;
    }

    const { backupPath } = await buildBackup(pairs);
    console.log(`Backup tersimpan: ${backupPath}`);

    for (const pair of pairs) {
      await migratePair(pair);
    }

    console.log(
      JSON.stringify(
        await auditResult(duplicateTeacherObjectIds, duplicateUserIds),
        null,
        2,
      ),
    );
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
