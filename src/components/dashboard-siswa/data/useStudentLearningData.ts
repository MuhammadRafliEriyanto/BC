"use client";

import { useEffect, useState } from "react";

import { clearAuthClientState } from "@/lib/auth";

import type {
  StudentMaterial,
  StudentTask,
  StudentTaskStatus,
  SubmissionMode,
} from "./learning-data";

type StudentLearningApiMaterialItem = {
  id?: string;
  materialId?: string;
  subject?: string;
  title?: string;
  meetingNumber?: number;
  description?: string;
  linkUrl?: string;
  updatedAt?: string | null;
  attachment?: StudentLearningApiAttachmentItem | null;
};

type StudentLearningApiTaskItem = {
  id?: string;
  taskId?: string;
  subject?: string;
  title?: string;
  meetingNumber?: number;
  description?: string;
  deadline?: string;
  reviewStatus?: string;
  attachment?: StudentLearningApiAttachmentItem | null;
};

type StudentLearningApiAttachmentItem = {
  fileName?: string;
  mimeType?: string;
  size?: number;
};

type StudentLearningResponse = {
  success: boolean;
  message?: string;
  data?: {
    materials?: StudentLearningApiMaterialItem[];
    tasks?: StudentLearningApiTaskItem[];
  };
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDisplayDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function buildTextDownloadUrl(title: string, sections: string[]) {
  const body = [title, "", ...sections].join("\n");
  return `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
}

function inferMaterialFormat(params: {
  linkUrl: string;
  attachment: StudentLearningApiAttachmentItem | null | undefined;
}): StudentMaterial["format"] {
  const normalizedLink = normalizeText(params.linkUrl).toLowerCase();
  const normalizedFileName = normalizeText(params.attachment?.fileName).toLowerCase();
  const normalizedMimeType = normalizeText(params.attachment?.mimeType).toLowerCase();

  if (
    normalizedMimeType.startsWith("video/") ||
    normalizedFileName.endsWith(".mp4") ||
    normalizedLink.includes("youtube.com") ||
    normalizedLink.includes("youtu.be") ||
    normalizedLink.endsWith(".mp4")
  ) {
    return "Video";
  }

  if (
    normalizedMimeType.includes("pdf") ||
    normalizedFileName.endsWith(".pdf") ||
    normalizedLink.endsWith(".pdf")
  ) {
    return "PDF";
  }

  return "Modul";
}

function formatUpdatedLabel(updatedAt: string | null | undefined) {
  const normalizedUpdatedAt = normalizeText(updatedAt);

  if (!normalizedUpdatedAt) {
    return "Diperbarui baru-baru ini";
  }

  const updatedDate = new Date(normalizedUpdatedAt);

  if (Number.isNaN(updatedDate.getTime())) {
    return "Diperbarui baru-baru ini";
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const updatedKey = updatedDate.toISOString().slice(0, 10);

  if (updatedKey === todayKey) {
    return "Diperbarui hari ini";
  }

  if (updatedKey === yesterdayKey) {
    return "Diperbarui kemarin";
  }

  return `Diperbarui ${formatDisplayDate(updatedKey)}`;
}

function deriveTaskStatus(
  deadline: string,
  reviewStatus: string,
): StudentTaskStatus {
  if (normalizeText(reviewStatus).toLowerCase() === "sudah dinilai") {
    return "Sudah Dinilai";
  }

  const normalizedDeadline = normalizeText(deadline);
  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDeadline) && normalizedDeadline < today) {
    return "Belum Dikerjakan";
  }

  return "Menunggu Dikirim";
}

function mapApiMaterialToStudentMaterial(
  material: StudentLearningApiMaterialItem,
): StudentMaterial {
  const title = normalizeText(material.title) || "Materi belum diatur";
  const description =
    normalizeText(material.description) || "Ringkasan materi belum tersedia.";
  const linkUrl = normalizeText(material.linkUrl);
  const materialId =
    normalizeText(material.materialId) ||
    normalizeText(material.id) ||
    `materi-${Date.now()}`;
  const attachment = material.attachment;
  const attachmentFileName = normalizeText(attachment?.fileName);
  const format = inferMaterialFormat({ linkUrl, attachment });
  const previewPoints = description
    .split(".")
    .map((point) => normalizeText(point))
    .filter(Boolean)
    .slice(0, 3);

  return {
    id: materialId,
    mapel: normalizeText(material.subject) || "Mapel belum diatur",
    judul: title,
    pertemuan: Math.max(
      typeof material.meetingNumber === "number" ? material.meetingNumber : 1,
      1,
    ),
    durasi: format === "Video" ? "Tonton Online" : "Materi Kelas",
    format,
    status: "Baru",
    ringkasan: description,
    diperbarui: formatUpdatedLabel(material.updatedAt),
    href: "/dashboard-siswa/materi",
    downloadName:
      attachmentFileName || `${slugify(title) || "materi-kelas"}.txt`,
    downloadUrl:
      attachmentFileName
        ? `/api/student/me/learning/materials/${encodeURIComponent(materialId)}/attachment`
        : linkUrl ||
          buildTextDownloadUrl(title, [
            description,
            "Ringkasan materi ini disimpan dari dashboard guru dan tersedia untuk siswa kelas terkait.",
          ]),
    previewHeading: title,
    previewBody: description,
    previewPoints:
      previewPoints.length > 0
        ? previewPoints
        : ["Materi ini sudah dibagikan guru untuk dipelajari mandiri."],
  };
}

function mapApiTaskToStudentTask(task: StudentLearningApiTaskItem): StudentTask {
  const title = normalizeText(task.title) || "Tugas belum diatur";
  const description =
    normalizeText(task.description) || "Instruksi tugas belum tersedia.";
  const deadline = normalizeText(task.deadline);
  const taskId =
    normalizeText(task.taskId) ||
    normalizeText(task.id) ||
    `tugas-${Date.now()}`;
  const attachmentFileName = normalizeText(task.attachment?.fileName);

  return {
    id: taskId,
    mapel: normalizeText(task.subject) || "Mapel belum diatur",
    judul: title,
    pertemuan: Math.max(
      typeof task.meetingNumber === "number" ? task.meetingNumber : 1,
      1,
    ),
    deadline: deadline ? `${formatDisplayDate(deadline)}, 23.59 WIB` : "-",
    estimasi: "Mandiri",
    poin: "Sesuai penilaian guru",
    status: deriveTaskStatus(deadline, normalizeText(task.reviewStatus)),
    deskripsi: description,
    detailHref: "/dashboard-siswa/tugas",
    submitHref: "/dashboard-siswa/kirim-tugas",
    attachmentName: attachmentFileName || undefined,
    attachmentUrl: attachmentFileName
      ? `/api/student/me/learning/tasks/${encodeURIComponent(taskId)}/attachment`
      : undefined,
    submissionModes: ["file", "text", "drive"] satisfies SubmissionMode[],
    instruksiPengumpulan: [
      "Baca instruksi tugas dengan teliti sebelum mengirim jawaban.",
      "Kamu bisa mengirim lewat file, teks langsung, atau link Drive.",
      "Pastikan jawaban final sudah siap sebelum dikirim ke guru.",
    ],
  };
}

export function useStudentLearningData() {
  const [materials, setMaterials] = useState<StudentMaterial[]>([]);
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStudentLearningData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/student/me/learning", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | StudentLearningResponse
          | null;

        if (!isMounted) {
          return;
        }

        if (response.status === 401) {
          clearAuthClientState();
          setMaterials([]);
          setTasks([]);
          setLoadError("Sesi login berakhir. Silakan login ulang.");
          return;
        }

        if (!response.ok || !payload?.success) {
          setMaterials([]);
          setTasks([]);
          setLoadError(
            payload?.message ||
              "Materi dan tugas siswa belum bisa dimuat saat ini.",
          );
          return;
        }

        setMaterials(
          (payload.data?.materials ?? []).map(mapApiMaterialToStudentMaterial),
        );
        setTasks((payload.data?.tasks ?? []).map(mapApiTaskToStudentTask));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("[dashboard-siswa] load_learning_data_failed", { error });
        setMaterials([]);
        setTasks([]);
        setLoadError("Materi dan tugas siswa belum bisa dimuat saat ini.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => {
      void loadStudentLearningData();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    materials,
    tasks,
    isLoading,
    loadError,
  };
}
