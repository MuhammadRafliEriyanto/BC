import { promises as fs } from "fs";
import path from "path";

type LearningAttachmentKind = "materials" | "tasks" | "task-submissions";

export type StoredLearningAttachment = {
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  originalName: string;
};

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function sanitizeFileName(fileName: string) {
  const normalizedFileName = path.basename(normalizeText(fileName));
  return normalizedFileName.replace(/[^a-zA-Z0-9._-]+/g, "-") || "attachment";
}

function buildStorageRoot() {
  return path.resolve(process.cwd(), "storage", "learning-attachments");
}

function buildRecordDirectory(kind: LearningAttachmentKind, recordId: string) {
  return path.join(buildStorageRoot(), kind, recordId);
}

export function decodeAttachmentBase64(value: string | null | undefined) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  try {
    return Buffer.from(normalizedValue, "base64");
  } catch {
    return null;
  }
}

export function isAttachmentSizeAllowed(size: number) {
  return Number.isFinite(size) && size > 0 && size <= MAX_ATTACHMENT_SIZE_BYTES;
}

export function getAttachmentSizeLimitLabel() {
  return "10 MB";
}

export async function saveLearningAttachment(params: {
  kind: LearningAttachmentKind;
  recordId: string;
  fileName: string;
  originalName?: string;
  mimeType: string;
  fileBuffer: Buffer;
}): Promise<StoredLearningAttachment> {
  const recordDirectory = buildRecordDirectory(params.kind, params.recordId);
  const sanitizedFileName = sanitizeFileName(params.fileName);
  const storedFileName = `${Date.now()}-${sanitizedFileName}`;
  const absolutePath = path.join(recordDirectory, storedFileName);

  await fs.rm(recordDirectory, { recursive: true, force: true });
  await fs.mkdir(recordDirectory, { recursive: true });
  await fs.writeFile(absolutePath, params.fileBuffer);

  return {
    fileName: sanitizeFileName(params.fileName),
    mimeType: normalizeText(params.mimeType) || "application/octet-stream",
    size: params.fileBuffer.byteLength,
    storagePath: path.relative(process.cwd(), absolutePath),
    originalName:
      path.basename(normalizeText(params.originalName || params.fileName)) ||
      sanitizeFileName(params.fileName),
  };
}

export async function deleteLearningAttachment(
  storagePath: string | null | undefined,
) {
  const normalizedStoragePath = normalizeText(storagePath);

  if (!normalizedStoragePath) {
    return;
  }

  const absolutePath = path.resolve(process.cwd(), normalizedStoragePath);
  const parentDirectory = path.dirname(absolutePath);

  await fs.rm(absolutePath, { force: true }).catch(() => undefined);
  await fs.rm(parentDirectory, { recursive: true, force: true }).catch(
    () => undefined,
  );
}

export function resolveLearningAttachmentPath(storagePath: string) {
  return path.resolve(process.cwd(), normalizeText(storagePath));
}
