"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearAuthClientState } from "@/lib/auth";

type TryoutJenjang = "SD" | "SMP" | "SMA";
type PublishStatus = "Published" | "Draft";
type StatusFilter = "Semua" | PublishStatus;
type JawabanBenar = "A" | "B" | "C" | "D";
type ResultStatus = "Sangat Baik" | "Baik" | "Perlu Bimbingan";
type QuestionSource = "bank" | "file" | "manual";

type TryoutQuestion = {
  id: string;
  order: number;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: JawabanBenar;
};

type TryoutResult = {
  id: string;
  namaSiswa: string;
  benar: number;
  salah: number;
  nilai: number;
  status: ResultStatus;
};

type TryoutItem = {
  id: string;
  judulTryout: string;
  jenjang: TryoutJenjang;
  kelas: string;
  mapel: string;
  jumlahSoal: number;
  durasiMenit: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  publishStatus: PublishStatus;
  questionSource: QuestionSource;
  questionBankId?: string;
  fileName?: string;
  soal: TryoutQuestion[];
  hasil: TryoutResult[];
};

type TryoutDraft = Omit<TryoutItem, "soal" | "hasil">;
type QuestionDraft = Omit<TryoutQuestion, "id" | "order">;
type DialogMode = "add" | "edit";
type BackendPublishStatus = "draft" | "published";

type TeacherTryoutApiItem = {
  id?: string;
  tryoutId?: string;
  title?: string;
  jenjang?: string;
  kelas?: string;
  subject?: string;
  durationMinutes?: number;
  startAt?: string | null;
  endAt?: string | null;
  publishStatus?: string;
  questionSource?: string;
  questionCount?: number;
  questionBankId?: string | null;
  fileName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TeacherTryoutQuestionApiItem = {
  id?: string;
  questionId?: string;
  tryoutId?: string;
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  order?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TeacherTryoutListResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryouts?: TeacherTryoutApiItem[];
  };
};

type TeacherTryoutDetailResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryout?: TeacherTryoutApiItem;
  };
};

type TeacherTryoutQuestionListResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryout?: TeacherTryoutApiItem;
    questions?: TeacherTryoutQuestionApiItem[];
  };
};

type TeacherTryoutQuestionDetailResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryout?: TeacherTryoutApiItem;
    question?: TeacherTryoutQuestionApiItem;
  };
};

const JENJANG_OPTIONS: TryoutJenjang[] = ["SD", "SMP", "SMA"];
const STATUS_FILTERS: StatusFilter[] = ["Semua", "Published", "Draft"];
const FINAL_CLASS_BY_JENJANG: Record<TryoutJenjang, string> = {
  SD: "Kelas 6",
  SMP: "Kelas 9",
  SMA: "Kelas 12",
};

const FIELD_CLASS =
  "w-full border border-orange-100 bg-white px-3 py-2.5 text-sm text-slate-700 transition placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100";
const LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";
const ACTION_BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center border transition";

const QUESTION_SOURCE_OPTIONS: Array<{
  value: QuestionSource;
  label: string;
  description: string;
  available: boolean;
}> = [
  {
    value: "bank",
    label: "Bank Soal",
    description: "Integrasi bank soal akan dibuka pada tahap berikutnya.",
    available: false,
  },
  {
    value: "file",
    label: "Upload File",
    description: "Upload file soal akan aktif setelah parser soal terhubung.",
    available: false,
  },
  {
    value: "manual",
    label: "Input Manual",
    description: "Buat tryout dulu, lalu tambahkan soal manual kapan saja.",
    available: true,
  },
];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toTryoutJenjang(value: string | null | undefined): TryoutJenjang | null {
  const normalizedValue = normalizeText(value).toUpperCase();

  return JENJANG_OPTIONS.find((item) => item === normalizedValue) ?? null;
}

function toTryoutPublishStatus(
  value: string | null | undefined,
): PublishStatus | null {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (normalizedValue === "published") {
    return "Published";
  }

  if (normalizedValue === "draft") {
    return "Draft";
  }

  return null;
}

function toBackendPublishStatus(status: PublishStatus): BackendPublishStatus {
  return status === "Published" ? "published" : "draft";
}

function toTryoutQuestionSource(
  value: string | null | undefined,
): QuestionSource | null {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (
    normalizedValue === "bank" ||
    normalizedValue === "file" ||
    normalizedValue === "manual"
  ) {
    return normalizedValue;
  }

  return null;
}

function toJawabanBenar(value: string | null | undefined): JawabanBenar | null {
  const normalizedValue = normalizeText(value).toUpperCase();

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

function formatDateTimeLocalValue(value: string | null | undefined) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "";
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hour = String(parsedDate.getHours()).padStart(2, "0");
  const minute = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toIsoDateTimeValue(value: string) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "";
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString();
}

async function fetchTeacherTryoutJson<T>(
  url: string,
  init: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as T | null;

  return { response, payload };
}

function mapTeacherTryoutApiItem(
  item: TeacherTryoutApiItem,
  existingTryout?: TryoutItem | null,
): TryoutItem {
  const jenjang = toTryoutJenjang(item.jenjang) ?? existingTryout?.jenjang ?? "SMA";
  const questionSource =
    toTryoutQuestionSource(item.questionSource) ??
    existingTryout?.questionSource ??
    "manual";
  const questionBankId = normalizeText(item.questionBankId) || undefined;
  const fileName = normalizeText(item.fileName) || undefined;

  return {
    id:
      normalizeText(item.tryoutId) ||
      normalizeText(item.id) ||
      existingTryout?.id ||
      createId("tryout"),
    judulTryout:
      normalizeText(item.title) ||
      existingTryout?.judulTryout ||
      "Tryout belum diatur",
    jenjang,
    kelas:
      normalizeText(item.kelas) ||
      existingTryout?.kelas ||
      FINAL_CLASS_BY_JENJANG[jenjang],
    mapel:
      normalizeText(item.subject) ||
      existingTryout?.mapel ||
      "Mapel belum diatur",
    jumlahSoal: Math.max(
      toSafeNumber(item.questionCount, existingTryout?.jumlahSoal ?? 0),
      0,
    ),
    durasiMenit: Math.max(
      toSafeNumber(item.durationMinutes, existingTryout?.durasiMenit ?? 90),
      15,
    ),
    tanggalMulai:
      formatDateTimeLocalValue(item.startAt) || existingTryout?.tanggalMulai || "",
    tanggalSelesai:
      formatDateTimeLocalValue(item.endAt) || existingTryout?.tanggalSelesai || "",
    publishStatus:
      toTryoutPublishStatus(item.publishStatus) ??
      existingTryout?.publishStatus ??
      "Draft",
    questionSource,
    questionBankId: questionSource === "bank" ? questionBankId : undefined,
    fileName: questionSource === "file" ? fileName : undefined,
    soal: existingTryout?.soal ?? [],
    hasil: existingTryout?.hasil ?? [],
  };
}

function mapTeacherTryoutQuestionApiItem(
  item: TeacherTryoutQuestionApiItem,
): TryoutQuestion | null {
  const questionId = normalizeText(item.questionId) || normalizeText(item.id);
  const correctAnswer = toJawabanBenar(item.correctAnswer);
  const questionText = normalizeText(item.questionText);
  const optionA = normalizeText(item.optionA);
  const optionB = normalizeText(item.optionB);
  const optionC = normalizeText(item.optionC);
  const optionD = normalizeText(item.optionD);

  if (
    !questionId ||
    !correctAnswer ||
    !questionText ||
    !optionA ||
    !optionB ||
    !optionC ||
    !optionD
  ) {
    return null;
  }

  return {
    id: questionId,
    order: Math.max(toSafeNumber(item.order, 0), 0),
    pertanyaan: questionText,
    opsiA: optionA,
    opsiB: optionB,
    opsiC: optionC,
    opsiD: optionD,
    jawabanBenar: correctAnswer,
  };
}

function sortTryoutQuestions(questions: TryoutQuestion[]) {
  return [...questions].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.id.localeCompare(right.id);
  });
}

function syncTryoutQuestionsFromApi(
  currentTryouts: TryoutItem[],
  tryoutId: string,
  apiQuestions: TeacherTryoutQuestionApiItem[],
  apiTryout?: TeacherTryoutApiItem,
) {
  const nextTryouts = apiTryout
    ? upsertTryoutFromApi(currentTryouts, apiTryout)
    : currentTryouts;
  const questions = sortTryoutQuestions(
    apiQuestions
      .map(mapTeacherTryoutQuestionApiItem)
      .filter((item): item is TryoutQuestion => item !== null),
  );

  return nextTryouts.map((item) =>
    item.id === tryoutId
      ? {
          ...item,
          jumlahSoal: Math.max(
            apiTryout?.questionCount ?? item.jumlahSoal,
            questions.length,
          ),
          soal: questions,
        }
      : item,
  );
}

function upsertTryoutQuestionFromApi(
  currentTryouts: TryoutItem[],
  tryoutId: string,
  apiQuestion: TeacherTryoutQuestionApiItem,
  apiTryout?: TeacherTryoutApiItem,
) {
  const question = mapTeacherTryoutQuestionApiItem(apiQuestion);

  if (!question) {
    return currentTryouts;
  }

  const nextTryouts = apiTryout
    ? upsertTryoutFromApi(currentTryouts, apiTryout)
    : currentTryouts;

  return nextTryouts.map((item) => {
    if (item.id !== tryoutId) {
      return item;
    }

    const nextQuestions = sortTryoutQuestions([
      ...item.soal.filter((candidate) => candidate.id !== question.id),
      question,
    ]);

    return {
      ...item,
      jumlahSoal: Math.max(
        apiTryout?.questionCount ?? item.jumlahSoal,
        nextQuestions.length,
      ),
      soal: nextQuestions,
    };
  });
}

function replaceTryoutsFromApi(
  apiTryouts: TeacherTryoutApiItem[],
  currentTryouts: TryoutItem[],
) {
  return apiTryouts.map((item) => {
    const nextTryoutId = normalizeText(item.tryoutId) || normalizeText(item.id);
    const existingTryout =
      currentTryouts.find((candidate) => candidate.id === nextTryoutId) ?? null;

    return mapTeacherTryoutApiItem(item, existingTryout);
  });
}

function upsertTryoutFromApi(
  currentTryouts: TryoutItem[],
  apiTryout: TeacherTryoutApiItem,
) {
  const nextTryoutId = normalizeText(apiTryout.tryoutId) || normalizeText(apiTryout.id);
  const existingTryout =
    currentTryouts.find((candidate) => candidate.id === nextTryoutId) ?? null;
  const nextTryout = mapTeacherTryoutApiItem(apiTryout, existingTryout);
  const nextIndex = currentTryouts.findIndex((candidate) => candidate.id === nextTryout.id);

  if (nextIndex === -1) {
    return [nextTryout, ...currentTryouts];
  }

  return currentTryouts.map((candidate, index) =>
    index === nextIndex ? nextTryout : candidate,
  );
}

function buildTryoutMutationPayload(draft: TryoutDraft) {
  return {
    title: normalizeText(draft.judulTryout),
    jenjang: draft.jenjang,
    kelas: draft.kelas,
    subject: normalizeText(draft.mapel),
    durationMinutes: draft.durasiMenit,
    startAt: toIsoDateTimeValue(draft.tanggalMulai),
    endAt: toIsoDateTimeValue(draft.tanggalSelesai),
    publishStatus: toBackendPublishStatus(draft.publishStatus),
    questionSource: draft.questionSource,
    questionCount: draft.jumlahSoal,
    questionBankId:
      draft.questionSource === "bank" ? draft.questionBankId ?? "" : "",
    fileName: draft.questionSource === "file" ? draft.fileName ?? "" : "",
  };
}

function createEmptyTryoutDraft(jenjang: TryoutJenjang): TryoutDraft {
  return {
    id: "",
    judulTryout: "",
    jenjang,
    kelas: FINAL_CLASS_BY_JENJANG[jenjang],
    mapel: "",
    jumlahSoal: 0,
    durasiMenit: 90,
    tanggalMulai: "",
    tanggalSelesai: "",
    publishStatus: "Draft",
    questionSource: "manual",
    questionBankId: undefined,
    fileName: undefined,
  };
}

function createEmptyQuestionDraft(): QuestionDraft {
  return {
    pertanyaan: "",
    opsiA: "",
    opsiB: "",
    opsiC: "",
    opsiD: "",
    jawabanBenar: "A",
  };
}

function createQuestionDraftFromQuestion(question: TryoutQuestion): QuestionDraft {
  return {
    pertanyaan: question.pertanyaan,
    opsiA: question.opsiA,
    opsiB: question.opsiB,
    opsiC: question.opsiC,
    opsiD: question.opsiD,
    jawabanBenar: question.jawabanBenar,
  };
}

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatScheduleRange(start: string, end: string) {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
}

function normalizeTryoutDraft(
  draft: TryoutDraft,
  tryouts: TryoutItem[],
): TryoutDraft {
  if (draft.questionSource === "bank") {
    return {
      ...draft,
      questionBankId: draft.questionBankId,
      fileName: undefined,
    };
  }

  if (draft.questionSource === "file") {
    return {
      ...draft,
      questionBankId: undefined,
    };
  }

  const existingTryout = tryouts.find((item) => item.id === draft.id);

  return {
    ...draft,
    jumlahSoal: Math.max(
      existingTryout?.jumlahSoal ?? 0,
      existingTryout?.soal.length ?? 0,
    ),
    questionBankId: undefined,
    fileName: undefined,
  };
}

function getPublishBadgeClass(status: PublishStatus) {
  return status === "Published"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-600";
}

function getQuestionBadgeClass(totalQuestion: number) {
  return totalQuestion > 0
    ? "border-orange-200 bg-orange-50 text-orange-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function getResultStatusClass(status: ResultStatus) {
  if (status === "Sangat Baik") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Baik") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
}

function getQuestionSourceLabel(source: QuestionSource) {
  if (source === "bank") {
    return "Bank Soal";
  }

  if (source === "file") {
    return "File";
  }

  return "Manual";
}

function getQuestionSourceBadgeClass(source: QuestionSource) {
  if (source === "bank") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (source === "file") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function isTryoutQuestionSourceReady(source: QuestionSource) {
  return source === "manual";
}

function getTryoutQuestionCountLabel(item: Pick<TryoutItem, "questionSource" | "jumlahSoal">) {
  if (item.questionSource === "manual") {
    return `${item.jumlahSoal} soal`;
  }

  if (item.questionSource === "bank") {
    return "Menunggu Integrasi";
  }

  return "Menunggu Parser";
}

function getTryoutQuestionStatusLabel(item: Pick<TryoutItem, "questionSource" | "jumlahSoal">) {
  if (item.questionSource !== "manual") {
    return "Tahap Berikutnya";
  }

  return item.jumlahSoal > 0 ? "Soal Siap" : "Menunggu Soal";
}

function getQuestionSourceDetail(item: TryoutItem) {
  if (item.questionSource === "bank") {
    return "Integrasi bank soal akan dibuka pada tahap berikutnya.";
  }

  if (item.questionSource === "file") {
    return item.fileName
      ? `Metadata file tersimpan: ${item.fileName}`
      : "Integrasi upload file soal sedang disiapkan.";
  }

  const totalManualQuestions = Math.max(item.jumlahSoal, item.soal.length);

  return totalManualQuestions > 0
    ? `${totalManualQuestions} soal manual tersimpan`
    : "Belum ada soal manual";
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="border border-orange-100 bg-white px-4 py-4 shadow-[0_18px_38px_-34px_rgba(249,115,22,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_22px_42px_-32px_rgba(249,115,22,0.28)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <div className="flex h-10 w-10 items-center justify-center border border-orange-100 bg-orange-50 text-orange-500">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function SegmentedButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "border-orange-500 bg-orange-500 text-white shadow-[0_16px_28px_-20px_rgba(249,115,22,0.55)]"
          : "border-orange-100 bg-white text-slate-600 hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function ActionIconButton({
  title,
  className,
  onClick,
  disabled = false,
  children,
}: {
  title: string;
  className: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`${ACTION_BUTTON_CLASS} ${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
  );
}

function TryoutFormDialog({
  draft,
  mode,
  open,
  onClose,
  onChange,
  onOpenManualManager,
  onSubmit,
}: {
  draft: TryoutDraft | null;
  mode: DialogMode;
  open: boolean;
  onClose: () => void;
  onChange: (field: keyof TryoutDraft, value: string | number) => void;
  onOpenManualManager: () => void;
  onSubmit: () => void;
}) {
  const isBankSource = draft?.questionSource === "bank";
  const isFileSource = draft?.questionSource === "file";
  const isManualSource = draft?.questionSource === "manual";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl gap-0 overflow-y-auto rounded-none border border-orange-100 bg-white p-0 [&>button]:rounded-none [&>button]:border [&>button]:border-orange-100 [&>button]:bg-white [&>button]:text-slate-400 [&>button]:hover:bg-orange-50 [&>button]:hover:text-orange-700">
        <DialogHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50/90 via-white to-amber-50/70 px-4 py-4 md:px-5">
          <DialogTitle>
            {mode === "add" ? "Tambah Tryout Baru" : "Edit Tryout"}
          </DialogTitle>
          <DialogDescription>
            Lengkapi metadata tryout untuk kelas akhir, lalu lanjutkan ke upload
            soal setelah data tryout tersimpan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-4 py-4 md:grid-cols-2 md:px-5">
          <label className="grid gap-2 md:col-span-2">
            <span className={LABEL_CLASS}>Judul Tryout</span>
            <input
              type="text"
              value={draft?.judulTryout ?? ""}
              onChange={(event) => onChange("judulTryout", event.target.value)}
              placeholder="Contoh: Tryout Matematika Final SMA"
              className={FIELD_CLASS}
            />
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Jenjang</span>
            <select
              value={draft?.jenjang ?? "SMA"}
              onChange={(event) => onChange("jenjang", event.target.value)}
              className={FIELD_CLASS}
            >
              {JENJANG_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Kelas</span>
            <input
              type="text"
              value={draft?.kelas ?? ""}
              readOnly
              className={`${FIELD_CLASS} bg-orange-50/40 text-slate-600`}
            />
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Mapel</span>
            <input
              type="text"
              value={draft?.mapel ?? ""}
              onChange={(event) => onChange("mapel", event.target.value)}
              placeholder="Matematika / IPA / Bahasa Indonesia"
              readOnly={isBankSource}
              className={`${FIELD_CLASS} ${
                isBankSource ? "bg-orange-50/40 text-slate-600" : ""
              }`}
            />
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Status Publish</span>
            <select
              value={draft?.publishStatus ?? "Draft"}
              onChange={(event) =>
                onChange("publishStatus", event.target.value)
              }
              className={FIELD_CLASS}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Durasi Menit</span>
            <input
              type="number"
              min={15}
              value={draft?.durasiMenit ?? 90}
              onChange={(event) => onChange("durasiMenit", event.target.value)}
              className={FIELD_CLASS}
            />
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Tanggal Mulai</span>
            <input
              type="datetime-local"
              value={draft?.tanggalMulai ?? ""}
              onChange={(event) => onChange("tanggalMulai", event.target.value)}
              className={FIELD_CLASS}
            />
          </label>

          <label className="grid gap-2">
            <span className={LABEL_CLASS}>Tanggal Selesai</span>
            <input
              type="datetime-local"
              value={draft?.tanggalSelesai ?? ""}
              onChange={(event) =>
                onChange("tanggalSelesai", event.target.value)
              }
              className={FIELD_CLASS}
            />
          </label>

          <div className="grid gap-4 md:col-span-2">
            <div className="grid gap-2">
              <span className={LABEL_CLASS}>Sumber Soal</span>
              <div className="grid gap-3 md:grid-cols-3">
                {QUESTION_SOURCE_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={!item.available}
                    onClick={() =>
                      item.available && onChange("questionSource", item.value)
                    }
                    className={`grid gap-1 border p-3 text-left transition-all ${
                      draft?.questionSource === item.value
                        ? "border-orange-500 bg-orange-50 text-orange-700 shadow-[0_18px_34px_-26px_rgba(249,115,22,0.35)]"
                        : item.available
                          ? "border-orange-100 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50/50"
                          : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-80"
                    } disabled:cursor-not-allowed`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      <span>{item.label}</span>
                      {!item.available ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Tahap Berikutnya
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs leading-5 text-slate-500">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isBankSource ? (
              <div className="grid gap-4 border border-orange-100 bg-orange-50/25 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Status Integrasi</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Integrasi bank soal belum diaktifkan
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pembuatan tryout dengan bank soal akan dibuka setelah
                      modul bank soal guru tersedia penuh.
                    </p>
                  </div>
                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Arah Penggunaan Saat Ini</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Gunakan input manual untuk tryout aktif
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Agar data tryout dapat langsung dipublikasikan, tambahkan
                      soal melalui mode input manual.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isFileSource ? (
              <div className="grid gap-4 border border-orange-100 bg-orange-50/25 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Status Integrasi</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Upload file soal belum diaktifkan
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Parser file soal masih menunggu tahap integrasi backend
                      berikutnya.
                    </p>
                  </div>
                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Arah Penggunaan Saat Ini</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Simpan metadata tryout lebih dulu
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Untuk tryout yang siap dipublikasikan sekarang, gunakan
                      soal manual sampai parser file tersedia.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isManualSource ? (
              <div className="grid gap-4 border border-orange-100 bg-orange-50/25 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className={LABEL_CLASS}>Input Soal Manual</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Tryout dapat dibuat dulu sebagai draft, kemudian soal manual
                      ditambahkan setelah data tryout tersimpan.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Mode aktif saat ini
                    </span>
                    <button
                      type="button"
                      onClick={onOpenManualManager}
                      className="border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Kelola Soal Manual
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Status Soal Manual</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {draft?.id
                        ? `${draft.jumlahSoal} soal manual tersimpan`
                        : "Simpan tryout dulu untuk mulai menambah soal"}
                    </p>
                  </div>
                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Alur Berikutnya</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Draft dulu, isi soal nanti
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Workflow ini cocok saat guru ingin membuat jadwal tryout
                      terlebih dahulu sebelum menyusun seluruh soal.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge className={getQuestionSourceBadgeClass(draft?.questionSource ?? "manual")}>
                  {getQuestionSourceLabel(draft?.questionSource ?? "manual")}
                </StatusBadge>
                <StatusBadge className={getQuestionBadgeClass(draft?.jumlahSoal ?? 0)}>
                  {draft
                    ? getTryoutQuestionCountLabel(draft)
                    : "0 soal"}
                </StatusBadge>
              </div>
          </div>
        </div>

        <DialogFooter className="border-t border-orange-100 px-4 py-3 md:px-5">
          <DialogClose asChild>
            <button
              type="button"
              className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={onSubmit}
            className="border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            {mode === "add" ? "Simpan Tryout" : "Perbarui Tryout"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadSoalDialog({
  open,
  tryout,
  draft,
  editingQuestionId,
  isQuestionLoading,
  questionLoadError,
  isQuestionSubmitting,
  onClose,
  onChange,
  onSubmitQuestion,
  onCancelEditQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onMoveQuestion,
}: {
  open: boolean;
  tryout: TryoutItem | null;
  draft: QuestionDraft;
  editingQuestionId: string | null;
  isQuestionLoading: boolean;
  questionLoadError: string | null;
  isQuestionSubmitting: boolean;
  onClose: () => void;
  onChange: (field: keyof QuestionDraft, value: string) => void;
  onSubmitQuestion: () => void;
  onCancelEditQuestion: () => void;
  onEditQuestion: (question: TryoutQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onMoveQuestion: (questionId: string, direction: "up" | "down") => void;
}) {
  const source = tryout?.questionSource ?? "manual";
  const isManualSource = source === "manual";
  const isBankSource = source === "bank";
  const isEditingQuestion = Boolean(editingQuestionId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-4xl gap-0 overflow-y-auto rounded-none border border-orange-100 bg-white p-0 [&>button]:rounded-none [&>button]:border [&>button]:border-orange-100 [&>button]:bg-white [&>button]:text-slate-400 [&>button]:hover:bg-orange-50 [&>button]:hover:text-orange-700">
        <DialogHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50/90 via-white to-amber-50/70 px-4 py-4 md:px-5">
          <DialogTitle>Upload Soal Tryout</DialogTitle>
          <DialogDescription>
            Kelola sumber soal untuk {tryout?.judulTryout ?? "-"} sesuai mode
            yang dipilih saat tryout dibuat.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-4 py-4 md:px-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4">
            {isManualSource ? (
              <div className="grid gap-4 border border-orange-100 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 pb-3">
                  <div>
                    <p className={LABEL_CLASS}>Input Manual Soal</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {isEditingQuestion
                        ? "Perbarui pertanyaan, opsi jawaban, dan kunci jawaban soal yang sedang dipilih."
                        : "Tambahkan pertanyaan, empat opsi jawaban, dan kunci jawaban untuk setiap soal tryout."}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400 opacity-80"
                  >
                    Integrasi Upload File Menyusul
                  </button>
                </div>

                <label className="grid gap-2">
                  <span className={LABEL_CLASS}>Pertanyaan</span>
                  <textarea
                    value={draft.pertanyaan}
                    onChange={(event) => onChange("pertanyaan", event.target.value)}
                    rows={3}
                    placeholder="Masukkan pertanyaan tryout..."
                    className={FIELD_CLASS}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className={LABEL_CLASS}>Opsi A</span>
                    <input
                      type="text"
                      value={draft.opsiA}
                      onChange={(event) => onChange("opsiA", event.target.value)}
                      className={FIELD_CLASS}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className={LABEL_CLASS}>Opsi B</span>
                    <input
                      type="text"
                      value={draft.opsiB}
                      onChange={(event) => onChange("opsiB", event.target.value)}
                      className={FIELD_CLASS}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className={LABEL_CLASS}>Opsi C</span>
                    <input
                      type="text"
                      value={draft.opsiC}
                      onChange={(event) => onChange("opsiC", event.target.value)}
                      className={FIELD_CLASS}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className={LABEL_CLASS}>Opsi D</span>
                    <input
                      type="text"
                      value={draft.opsiD}
                      onChange={(event) => onChange("opsiD", event.target.value)}
                      className={FIELD_CLASS}
                    />
                  </label>
                </div>

                <label className="grid gap-2 md:max-w-[220px]">
                  <span className={LABEL_CLASS}>Jawaban Benar</span>
                  <select
                    value={draft.jawabanBenar}
                    onChange={(event) =>
                      onChange("jawabanBenar", event.target.value)
                    }
                    className={FIELD_CLASS}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </label>

                <div className="flex flex-wrap justify-end gap-2">
                  {isEditingQuestion ? (
                    <button
                      type="button"
                      disabled={isQuestionSubmitting}
                      onClick={onCancelEditQuestion}
                      className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Batal Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={isQuestionLoading || isQuestionSubmitting}
                    onClick={onSubmitQuestion}
                    className="border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:border-orange-200 disabled:bg-orange-200"
                  >
                    {isQuestionSubmitting
                      ? "Menyimpan..."
                      : isEditingQuestion
                        ? "Simpan Perubahan"
                        : "Tambah Soal"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 border border-orange-100 bg-white p-3">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100 pb-3">
                  <div>
                    <p className={LABEL_CLASS}>
                      {isBankSource ? "Sumber Bank Soal" : "Sumber File Soal"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {isBankSource
                        ? "Tryout ini menggunakan bank soal terpilih sebagai sumber utama. Pengambilan butir soal real akan mengikuti integrasi backend."
                        : "Tryout ini menggunakan file sumber soal. Parsing dan ekstraksi soal akan aktif setelah pipeline backend tersedia."}
                    </p>
                  </div>
                  <StatusBadge
                    className={getQuestionSourceBadgeClass(source)}
                  >
                    {getQuestionSourceLabel(source)}
                  </StatusBadge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border border-orange-100 bg-orange-50/30 p-3">
                    <p className={LABEL_CLASS}>
                      {isBankSource ? "Status Bank Soal" : "Status File Soal"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {isBankSource
                        ? "Bank soal belum terhubung"
                        : tryout?.fileName ?? "File soal belum diunggah"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {isBankSource
                        ? "Sumber bank soal akan ditampilkan di sini setelah integrasi modul bank soal tersedia."
                        : "Metadata file akan ditampilkan di sini setelah fitur upload file soal diaktifkan."}
                    </p>
                  </div>

                  <div className="border border-orange-100 bg-white p-3">
                    <p className={LABEL_CLASS}>Kesiapan Publish</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {isTryoutQuestionSourceReady(source)
                        ? (tryout?.jumlahSoal ?? 0) > 0
                          ? "Siap dipublish"
                          : "Belum siap dipublish"
                        : "Menunggu integrasi sumber soal"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {isTryoutQuestionSourceReady(source)
                        ? "Tryout hanya dapat dipublish ketika jumlah soal lebih dari nol."
                        : "Publish akan dibuka setelah sumber soal ini terhubung penuh ke backend."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="border border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 p-3">
              <p className={LABEL_CLASS}>Ringkasan Sumber Soal</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-800">
                {tryout?.judulTryout ?? "-"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {tryout?.jenjang ?? "-"} - {tryout?.kelas ?? "-"} -{" "}
                {tryout?.mapel ?? "-"}
              </p>
              <div className="mt-4 grid gap-3">
                <StatusBadge
                  className={getQuestionSourceBadgeClass(source)}
                >
                  {getQuestionSourceLabel(source)}
                </StatusBadge>
                <StatusBadge className={getQuestionBadgeClass(tryout?.jumlahSoal ?? 0)}>
                  {tryout
                    ? getTryoutQuestionCountLabel(tryout)
                    : "0 soal"}
                </StatusBadge>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {getQuestionSourceDetail(tryout ?? {
                  id: "",
                  judulTryout: "",
                  jenjang: "SMA",
                  kelas: "Kelas 12",
                  mapel: "",
                  jumlahSoal: 0,
                  durasiMenit: 0,
                  tanggalMulai: "",
                  tanggalSelesai: "",
                  publishStatus: "Draft",
                  questionSource: source,
                  soal: [],
                  hasil: [],
                })}
              </p>
            </div>

            <div className="border border-orange-100 bg-white">
              <div className="border-b border-orange-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {isManualSource ? "Daftar Soal Tersimpan" : "Detail Sumber Soal"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isManualSource
                    ? "Soal yang sudah diinput manual akan muncul di sini."
                    : "Ringkasan sumber soal aktif ditampilkan di panel ini."}
                </p>
              </div>

              <div className="max-h-[320px] overflow-y-auto px-4 py-4">
                {isManualSource && isQuestionLoading ? (
                  <div className="border border-dashed border-orange-200 bg-orange-50/30 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Memuat soal manual dari backend...
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Daftar soal tersimpan sedang disinkronkan untuk tryout ini.
                    </p>
                  </div>
                ) : isManualSource && questionLoadError ? (
                  <div className="border border-rose-200 bg-rose-50/70 px-4 py-4 text-sm text-rose-700">
                    {questionLoadError}
                  </div>
                ) : isManualSource && tryout && tryout.soal.length > 0 ? (
                  <div className="grid gap-3">
                    {tryout.soal.map((question, index) => (
                      <div
                        key={question.id}
                        className="border border-orange-100 bg-orange-50/30 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">
                            {(question.order || index + 1).toString()}.{" "}
                            {question.pertanyaan}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            <ActionIconButton
                              title="Naikkan Urutan"
                              disabled={
                                isQuestionLoading ||
                                isQuestionSubmitting ||
                                index === 0
                              }
                              onClick={() => onMoveQuestion(question.id, "up")}
                              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            >
                              <ChevronUp className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <ActionIconButton
                              title="Turunkan Urutan"
                              disabled={
                                isQuestionLoading ||
                                isQuestionSubmitting ||
                                index === tryout.soal.length - 1
                              }
                              onClick={() => onMoveQuestion(question.id, "down")}
                              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            >
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <ActionIconButton
                              title="Edit Soal"
                              disabled={isQuestionLoading || isQuestionSubmitting}
                              onClick={() => onEditQuestion(question)}
                              className="border-orange-200 bg-white text-orange-700 hover:bg-orange-100"
                            >
                              <Pencil className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <ActionIconButton
                              title="Hapus Soal"
                              disabled={isQuestionLoading || isQuestionSubmitting}
                              onClick={() => onDeleteQuestion(question.id)}
                              className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
                            >
                              <Trash2 className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <StatusBadge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              Jawaban {question.jawabanBenar}
                            </StatusBadge>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-slate-600">
                          <p>A. {question.opsiA}</p>
                          <p>B. {question.opsiB}</p>
                          <p>C. {question.opsiC}</p>
                          <p>D. {question.opsiD}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isBankSource ? (
                  <div className="grid gap-3">
                    <div className="border border-orange-100 bg-orange-50/30 p-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Integrasi bank soal sedang disiapkan
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Bank soal guru belum menjadi sumber data utama untuk
                        tryout ini. Gunakan mode input manual sampai integrasi
                        bank soal selesai.
                      </p>
                    </div>
                  </div>
                ) : source === "file" ? (
                  <div className="grid gap-3">
                    <div className="border border-orange-100 bg-orange-50/30 p-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {tryout?.fileName ?? "Integrasi upload file sedang disiapkan"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Parser soal belum aktif, sehingga file soal belum dapat
                        diproses menjadi butir tryout. Gunakan input manual
                        sampai tahap integrasi berikutnya.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-orange-200 bg-orange-50/30 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      Tryout ini belum memiliki soal.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Tambahkan soal manual terlebih dahulu agar tryout siap
                      dipublikasikan dan dikerjakan siswa.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-orange-100 px-4 py-3 md:px-5">
          <DialogClose asChild>
            <button
              type="button"
              className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Tutup
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HasilTryoutDialog({
  open,
  tryout,
  onClose,
}: {
  open: boolean;
  tryout: TryoutItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl gap-0 overflow-y-auto rounded-none border border-orange-100 bg-white p-0 [&>button]:rounded-none [&>button]:border [&>button]:border-orange-100 [&>button]:bg-white [&>button]:text-slate-400 [&>button]:hover:bg-orange-50 [&>button]:hover:text-orange-700">
        <DialogHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50/90 via-white to-amber-50/70 px-4 py-4 md:px-5">
          <DialogTitle>Hasil Tryout Siswa</DialogTitle>
          <DialogDescription>
            Hasil tryout akan tersedia setelah siswa mengerjakan tryout.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-4 md:px-5">
          {tryout && tryout.hasil.length > 0 ? (
            <div className="overflow-x-auto border border-orange-100">
              <table className="min-w-full">
                <thead className="bg-orange-50/80 text-left">
                  <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                    <th className="px-4 py-3 font-semibold">Benar</th>
                    <th className="px-4 py-3 font-semibold">Salah</th>
                    <th className="px-4 py-3 font-semibold">Nilai</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tryout.hasil.map((result) => (
                    <tr
                      key={result.id}
                      className="border-t border-orange-100/80 text-sm"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {result.namaSiswa}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {result.benar}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {result.salah}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {result.nilai}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          className={getResultStatusClass(result.status)}
                        >
                          {result.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-dashed border-orange-200 bg-orange-50/30 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Belum ada hasil tryout yang tersedia.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Hasil tryout akan tersedia setelah siswa mengerjakan tryout
                dan data penilaian tersimpan.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-orange-100 px-4 py-3 md:px-5">
          <DialogClose asChild>
            <button
              type="button"
              className="border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Tutup
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TryoutGuruSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenjang, setSelectedJenjang] =
    useState<TryoutJenjang>("SMA");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("Semua");
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<DialogMode>("add");
  const [draftTryout, setDraftTryout] = useState<TryoutDraft | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedUploadTryoutId, setSelectedUploadTryoutId] = useState<
    string | null
  >(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft>(
    createEmptyQuestionDraft(),
  );
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [selectedResultTryoutId, setSelectedResultTryoutId] = useState<
    string | null
  >(null);

  const selectedKelas = FINAL_CLASS_BY_JENJANG[selectedJenjang];

  const stats = useMemo(() => {
    return {
      draft: tryouts.filter((item) => item.publishStatus === "Draft").length,
      menungguSoal: tryouts.filter((item) => item.jumlahSoal === 0).length,
      published: tryouts.filter((item) => item.publishStatus === "Published")
        .length,
      total: tryouts.length,
    };
  }, [tryouts]);

  const filteredTryouts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tryouts.filter((item) => {
      const matchesSearch =
        !normalizedQuery ||
        item.judulTryout.toLowerCase().includes(normalizedQuery) ||
        item.mapel.toLowerCase().includes(normalizedQuery) ||
        item.kelas.toLowerCase().includes(normalizedQuery) ||
        item.jenjang.toLowerCase().includes(normalizedQuery) ||
        getQuestionSourceLabel(item.questionSource)
          .toLowerCase()
          .includes(normalizedQuery) ||
        getQuestionSourceDetail(item).toLowerCase().includes(normalizedQuery);

      const matchesJenjang = item.jenjang === selectedJenjang;
      const matchesKelas = item.kelas === selectedKelas;
      const matchesStatus =
        selectedStatus === "Semua" || item.publishStatus === selectedStatus;

      return matchesSearch && matchesJenjang && matchesKelas && matchesStatus;
    });
  }, [searchQuery, selectedJenjang, selectedKelas, selectedStatus, tryouts]);

  const uploadTargetTryout = useMemo(
    () =>
      tryouts.find((item) => item.id === selectedUploadTryoutId) ?? null,
    [selectedUploadTryoutId, tryouts],
  );

  const resultTargetTryout = useMemo(
    () =>
      tryouts.find((item) => item.id === selectedResultTryoutId) ?? null,
    [selectedResultTryoutId, tryouts],
  );

  const loadTeacherTryouts = useEffectEvent(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutListResponse>(
          "/api/teacher/me/tryouts",
          {
            method: "GET",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || "Data tryout guru belum bisa dimuat.",
        );
      }

      setTryouts((current) =>
        replaceTryoutsFromApi(payload.data?.tryouts ?? [], current),
      );
    } catch (error) {
      console.error("[tryout-guru-section] load_tryouts_failed", error);
      setTryouts([]);
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : "Data tryout guru belum bisa dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      void loadTeacherTryouts();
    });
  }, []);

  const loadManualQuestions = useCallback(async (tryoutId: string) => {
    try {
      setIsQuestionLoading(true);
      setQuestionLoadError(null);

      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutQuestionListResponse>(
          `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}/questions`,
          {
            method: "GET",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Soal tryout belum bisa dimuat.");
      }

      setTryouts((current) =>
        syncTryoutQuestionsFromApi(
          current,
          tryoutId,
          payload.data?.questions ?? [],
          payload.data?.tryout,
        ),
      );
      setLoadError(null);
    } catch (error) {
      console.error("[tryout-guru-section] load_questions_failed", error);
      setQuestionLoadError(
        error instanceof Error && error.message
          ? error.message
          : "Soal tryout belum bisa dimuat.",
      );
    } finally {
      setIsQuestionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      !isUploadOpen ||
      !selectedUploadTryoutId ||
      uploadTargetTryout?.questionSource !== "manual"
    ) {
      return;
    }

    queueMicrotask(() => {
      void loadManualQuestions(selectedUploadTryoutId);
    });
  }, [
    isUploadOpen,
    loadManualQuestions,
    selectedUploadTryoutId,
    uploadTargetTryout?.questionSource,
  ]);

  function openAddDialog() {
    setFormMode("add");
    setDraftTryout(createEmptyTryoutDraft(selectedJenjang));
    setIsFormOpen(true);
  }

  function openEditDialog(tryout: TryoutItem) {
    setFormMode("edit");
    setDraftTryout({
      id: tryout.id,
      judulTryout: tryout.judulTryout,
      jenjang: tryout.jenjang,
      kelas: tryout.kelas,
      mapel: tryout.mapel,
      jumlahSoal: tryout.jumlahSoal,
      durasiMenit: tryout.durasiMenit,
      tanggalMulai: tryout.tanggalMulai,
      tanggalSelesai: tryout.tanggalSelesai,
      publishStatus: tryout.publishStatus,
      questionSource: tryout.questionSource,
      questionBankId: tryout.questionBankId,
      fileName: tryout.fileName,
    });
    setIsFormOpen(true);
  }

  function closeFormDialog() {
    setIsFormOpen(false);
    setDraftTryout(null);
  }

  function handleTryoutDraftChange(
    field: keyof TryoutDraft,
    value: string | number,
  ) {
    setDraftTryout((current) => {
      if (!current) {
        return current;
      }

      if (field === "jenjang") {
        const nextJenjang = value as TryoutJenjang;
        return normalizeTryoutDraft(
          {
            ...current,
            jenjang: nextJenjang,
            kelas: FINAL_CLASS_BY_JENJANG[nextJenjang],
          },
          tryouts,
        );
      }

      if (field === "durasiMenit") {
        return normalizeTryoutDraft(
          {
            ...current,
            [field]: Number(value),
          },
          tryouts,
        );
      }

      if (field === "questionSource") {
        return normalizeTryoutDraft(
          {
            ...current,
            questionSource: value as QuestionSource,
          },
          tryouts,
        );
      }

      if (field === "questionBankId") {
        return normalizeTryoutDraft(
          {
            ...current,
            questionBankId: String(value),
          },
          tryouts,
        );
      }

      return normalizeTryoutDraft(
        {
          ...current,
          [field]: String(value),
        },
        tryouts,
      );
    });
  }

  function handleOpenManualManagerFromForm() {
    if (!draftTryout?.id) {
      window.alert(
        "Simpan tryout sebagai draft terlebih dahulu sebelum menambahkan soal manual.",
      );
      return;
    }

    setIsFormOpen(false);
    openUploadDialog(draftTryout.id);
  }

  async function handleSaveTryout() {
    if (!draftTryout) {
      return;
    }

    const normalizedDraft = normalizeTryoutDraft(draftTryout, tryouts);

    if (
      !normalizedDraft.judulTryout.trim() ||
      !normalizedDraft.mapel.trim() ||
      !normalizedDraft.tanggalMulai ||
      !normalizedDraft.tanggalSelesai
    ) {
      window.alert("Lengkapi judul, mapel, tanggal mulai, dan tanggal selesai.");
      return;
    }

    if (
      new Date(normalizedDraft.tanggalSelesai) <=
      new Date(normalizedDraft.tanggalMulai)
    ) {
      window.alert("Tanggal selesai harus lebih besar dari tanggal mulai.");
      return;
    }

    if (normalizedDraft.durasiMenit < 15) {
      window.alert("Durasi tryout minimal 15 menit.");
      return;
    }

    if (
      normalizedDraft.publishStatus === "Published" &&
      !isTryoutQuestionSourceReady(normalizedDraft.questionSource)
    ) {
      window.alert(
        "Publish tryout untuk bank soal dan upload file akan dibuka setelah modul sumber soal tersebut terintegrasi.",
      );
      return;
    }

    if (
      normalizedDraft.publishStatus === "Published" &&
      normalizedDraft.jumlahSoal === 0
    ) {
      window.alert(
        normalizedDraft.questionSource === "manual"
          ? "Tryout manual belum dapat dipublish karena belum memiliki soal."
          : "Tryout belum dapat dipublish karena sumber soal belum siap.",
      );
      return;
    }

    try {
      const isEditMode =
        formMode === "edit" && Boolean(normalizeText(normalizedDraft.id));
      const endpoint = isEditMode
        ? `/api/teacher/me/tryouts/${encodeURIComponent(normalizedDraft.id)}`
        : "/api/teacher/me/tryouts";
      const method = isEditMode ? "PATCH" : "POST";
      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutDetailResponse>(endpoint, {
          method,
          body: JSON.stringify(buildTryoutMutationPayload(normalizedDraft)),
        });

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success || !payload.data?.tryout) {
        throw new Error(payload?.message || "Tryout guru belum bisa disimpan.");
      }

      setTryouts((current) =>
        upsertTryoutFromApi(current, payload.data?.tryout as TeacherTryoutApiItem),
      );
      setLoadError(null);
      closeFormDialog();
    } catch (error) {
      console.error("[tryout-guru-section] save_tryout_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Tryout guru belum bisa disimpan.",
      );
    }
  }

  async function handleDeleteTryout(tryoutId: string) {
    if (!window.confirm("Hapus tryout ini dari daftar guru?")) {
      return;
    }

    try {
      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutDetailResponse>(
          `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}`,
          {
            method: "DELETE",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Tryout guru belum bisa dihapus.");
      }

      setTryouts((current) => current.filter((item) => item.id !== tryoutId));
      setLoadError(null);
    } catch (error) {
      console.error("[tryout-guru-section] delete_tryout_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Tryout guru belum bisa dihapus.",
      );
    }
  }

  async function handleTogglePublish(tryoutId: string) {
    const targetTryout = tryouts.find((item) => item.id === tryoutId);

    if (
      targetTryout &&
      targetTryout.publishStatus === "Draft" &&
      !isTryoutQuestionSourceReady(targetTryout.questionSource)
    ) {
      window.alert(
        "Publish tryout untuk bank soal dan upload file akan dibuka setelah modul sumber soal tersebut terintegrasi.",
      );
      return;
    }

    if (
      targetTryout &&
      targetTryout.publishStatus === "Draft" &&
      targetTryout.jumlahSoal === 0
    ) {
      window.alert(
        targetTryout.questionSource === "manual"
          ? "Tryout manual belum dapat dipublish karena belum memiliki soal."
          : "Tryout belum dapat dipublish karena sumber soal belum siap.",
      );
      return;
    }

    if (!targetTryout) {
      return;
    }

    const nextDraft = normalizeTryoutDraft(
      {
        id: targetTryout.id,
        judulTryout: targetTryout.judulTryout,
        jenjang: targetTryout.jenjang,
        kelas: targetTryout.kelas,
        mapel: targetTryout.mapel,
        jumlahSoal: targetTryout.jumlahSoal,
        durasiMenit: targetTryout.durasiMenit,
        tanggalMulai: targetTryout.tanggalMulai,
        tanggalSelesai: targetTryout.tanggalSelesai,
        publishStatus:
          targetTryout.publishStatus === "Published" ? "Draft" : "Published",
        questionSource: targetTryout.questionSource,
        questionBankId: targetTryout.questionBankId,
        fileName: targetTryout.fileName,
      },
      tryouts,
    );

    try {
      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutDetailResponse>(
          `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}`,
          {
            method: "PATCH",
            body: JSON.stringify(buildTryoutMutationPayload(nextDraft)),
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success || !payload.data?.tryout) {
        throw new Error(payload?.message || "Status tryout belum bisa diperbarui.");
      }

      setTryouts((current) =>
        upsertTryoutFromApi(current, payload.data?.tryout as TeacherTryoutApiItem),
      );
      setLoadError(null);
    } catch (error) {
      console.error("[tryout-guru-section] toggle_publish_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Status tryout belum bisa diperbarui.",
      );
    }
  }

  function openUploadDialog(tryoutId: string) {
    setSelectedUploadTryoutId(tryoutId);
    setQuestionDraft(createEmptyQuestionDraft());
    setEditingQuestionId(null);
    setQuestionLoadError(null);
    setIsUploadOpen(true);
  }

  function closeUploadDialog() {
    setIsUploadOpen(false);
    setSelectedUploadTryoutId(null);
    setQuestionDraft(createEmptyQuestionDraft());
    setEditingQuestionId(null);
    setQuestionLoadError(null);
    setIsQuestionLoading(false);
    setIsQuestionSubmitting(false);
  }

  function resetQuestionEditor() {
    setQuestionDraft(createEmptyQuestionDraft());
    setEditingQuestionId(null);
  }

  function handleQuestionDraftChange(
    field: keyof QuestionDraft,
    value: string,
  ) {
    setQuestionDraft((current) => ({
      ...current,
      [field]:
        field === "jawabanBenar" ? (value as JawabanBenar) : value,
    }));
  }

  function handleEditQuestion(question: TryoutQuestion) {
    setEditingQuestionId(question.id);
    setQuestionDraft(createQuestionDraftFromQuestion(question));
    setQuestionLoadError(null);
  }

  function handleCancelEditQuestion() {
    resetQuestionEditor();
  }

  async function handleSubmitQuestion() {
    if (!selectedUploadTryoutId || uploadTargetTryout?.questionSource !== "manual") {
      return;
    }

    const fields = [
      questionDraft.pertanyaan,
      questionDraft.opsiA,
      questionDraft.opsiB,
      questionDraft.opsiC,
      questionDraft.opsiD,
    ];

    if (fields.some((field) => !field.trim())) {
      window.alert("Lengkapi pertanyaan dan seluruh opsi jawaban terlebih dahulu.");
      return;
    }

    try {
      setIsQuestionSubmitting(true);
      const isEditMode = Boolean(editingQuestionId);

      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutQuestionDetailResponse>(
          isEditMode
            ? `/api/teacher/me/tryouts/${encodeURIComponent(selectedUploadTryoutId)}/questions/${encodeURIComponent(editingQuestionId ?? "")}`
            : `/api/teacher/me/tryouts/${encodeURIComponent(selectedUploadTryoutId)}/questions`,
          {
            method: isEditMode ? "PATCH" : "POST",
            body: JSON.stringify({
              questionText: normalizeText(questionDraft.pertanyaan),
              optionA: normalizeText(questionDraft.opsiA),
              optionB: normalizeText(questionDraft.opsiB),
              optionC: normalizeText(questionDraft.opsiC),
              optionD: normalizeText(questionDraft.opsiD),
              correctAnswer: questionDraft.jawabanBenar,
            }),
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success || !payload.data?.question) {
        throw new Error(payload?.message || "Soal tryout belum bisa disimpan.");
      }

      setTryouts((current) => {
        if (!payload.data?.question) {
          return current;
        }

        return upsertTryoutQuestionFromApi(
          current,
          selectedUploadTryoutId,
          payload.data.question as TeacherTryoutQuestionApiItem,
          payload.data?.tryout,
        );
      });
      resetQuestionEditor();
      setQuestionLoadError(null);
      setLoadError(null);
      await loadManualQuestions(selectedUploadTryoutId);
    } catch (error) {
      console.error("[tryout-guru-section] save_question_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Soal tryout belum bisa disimpan.",
      );
    } finally {
      setIsQuestionSubmitting(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (
      !selectedUploadTryoutId ||
      uploadTargetTryout?.questionSource !== "manual"
    ) {
      return;
    }

    if (!window.confirm("Hapus soal manual ini dari tryout?")) {
      return;
    }

    try {
      setIsQuestionSubmitting(true);

      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutQuestionDetailResponse>(
          `/api/teacher/me/tryouts/${encodeURIComponent(selectedUploadTryoutId)}/questions/${encodeURIComponent(questionId)}`,
          {
            method: "DELETE",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Soal tryout belum bisa dihapus.");
      }

      if (editingQuestionId === questionId) {
        resetQuestionEditor();
      }

      setLoadError(null);
      setQuestionLoadError(null);
      await loadManualQuestions(selectedUploadTryoutId);
    } catch (error) {
      console.error("[tryout-guru-section] delete_question_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Soal tryout belum bisa dihapus.",
      );
    } finally {
      setIsQuestionSubmitting(false);
    }
  }

  async function handleMoveQuestion(
    questionId: string,
    direction: "up" | "down",
  ) {
    if (
      !selectedUploadTryoutId ||
      uploadTargetTryout?.questionSource !== "manual"
    ) {
      return;
    }

    const currentQuestionIndex = uploadTargetTryout.soal.findIndex(
      (question) => question.id === questionId,
    );

    if (currentQuestionIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentQuestionIndex - 1 : currentQuestionIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= uploadTargetTryout.soal.length
    ) {
      return;
    }

    try {
      setIsQuestionSubmitting(true);

      const { response, payload } =
        await fetchTeacherTryoutJson<TeacherTryoutQuestionDetailResponse>(
          `/api/teacher/me/tryouts/${encodeURIComponent(selectedUploadTryoutId)}/questions/${encodeURIComponent(questionId)}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              order: targetIndex + 1,
            }),
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message || "Urutan soal tryout belum bisa diperbarui.",
        );
      }

      setLoadError(null);
      setQuestionLoadError(null);
      await loadManualQuestions(selectedUploadTryoutId);
    } catch (error) {
      console.error("[tryout-guru-section] reorder_question_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Urutan soal tryout belum bisa diperbarui.",
      );
    } finally {
      setIsQuestionSubmitting(false);
    }
  }

  function openResultDialog(tryoutId: string) {
    setSelectedResultTryoutId(tryoutId);
    setIsResultOpen(true);
  }

  function closeResultDialog() {
    setIsResultOpen(false);
    setSelectedResultTryoutId(null);
  }

  return (
    <>
      <div className="mx-auto mt-4 w-full max-w-7xl px-4 py-4 md:mt-6 md:px-6">
        <div className="flex flex-col gap-5">
          <section className="border border-orange-100 bg-white shadow-[0_28px_60px_-42px_rgba(15,23,42,0.28)]">
            <div className="grid gap-px bg-orange-100 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 px-5 py-5 md:px-6 md:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Dashboard Tryout Guru
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-800 md:text-3xl">
                  Manajemen Tryout
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Kelola tryout kelas akhir, upload soal, publish ujian, dan
                  pantau hasil siswa dalam satu workflow yang rapi untuk SD kelas
                  6, SMP kelas 9, dan SMA kelas 12.
                </p>
              </div>

              <div className="flex flex-col justify-between gap-4 bg-white px-5 py-5 md:px-6 md:py-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Fokus Kelas Akhir
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Gunakan satu halaman ini untuk memastikan bank soal,
                    publikasi tryout, dan monitoring hasil siswa tetap konsisten
                    menjelang ujian akhir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddDialog}
                  className="inline-flex items-center justify-center gap-2 border border-orange-500 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Tryout
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={ClipboardList}
              label="Total Tryout"
              value={stats.total}
              helper="Seluruh tryout aktif dan draft milik guru."
            />
            <SummaryCard
              icon={CheckCircle2}
              label="Published"
              value={stats.published}
              helper="Tryout yang sudah siap dibuka untuk siswa."
            />
            <SummaryCard
              icon={FileText}
              label="Draft"
              value={stats.draft}
              helper="Tryout yang masih perlu dilengkapi sebelum publish."
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Menunggu Soal"
              value={stats.menungguSoal}
              helper="Tryout yang metadata-nya ada tetapi bank soal belum masuk."
            />
          </section>

          <section className="border border-orange-100 bg-white px-5 py-5 shadow-[0_22px_48px_-38px_rgba(15,23,42,0.26)] md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Filter Tryout Kelas Akhir
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kombinasikan pencarian, jenjang, kelas akhir otomatis, dan
                  status publish untuk menjaga daftar tryout tetap fokus.
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="flex items-center gap-2 border border-orange-100 bg-orange-50/40 px-3 py-3 transition focus-within:border-orange-200 focus-within:ring-2 focus-within:ring-orange-100">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Cari judul tryout, mapel, atau kelas..."
                    className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.9fr_1fr]">
              <div className="grid gap-3">
                <p className={LABEL_CLASS}>Filter Jenjang</p>
                <div className="flex flex-wrap gap-2">
                  {JENJANG_OPTIONS.map((item) => (
                    <SegmentedButton
                      key={item}
                      active={selectedJenjang === item}
                      label={item}
                      onClick={() => setSelectedJenjang(item)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <p className={LABEL_CLASS}>Kelas Otomatis</p>
                <div className="border border-orange-100 bg-orange-50/40 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedKelas}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Filter kelas akhir akan mengikuti jenjang yang sedang aktif.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <p className={LABEL_CLASS}>Status Publish</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((item) => (
                    <SegmentedButton
                      key={item}
                      active={selectedStatus === item}
                      label={item}
                      onClick={() => setSelectedStatus(item)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge className="border-orange-200 bg-orange-50 text-orange-700">
                  {selectedJenjang}
                </StatusBadge>
                <StatusBadge className="border-slate-200 bg-white text-slate-600">
                  {selectedKelas}
                </StatusBadge>
                <StatusBadge className="border-slate-200 bg-slate-50 text-slate-600">
                  {selectedStatus}
                </StatusBadge>
              </div>

              <p className="text-sm font-semibold text-slate-600">
                {isLoading
                  ? "Memuat tryout..."
                  : `${filteredTryouts.length} tryout ditemukan`}
              </p>
            </div>
          </section>

          <section className="border border-orange-100 bg-white shadow-[0_24px_52px_-40px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col gap-4 border-b border-orange-100 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Daftar Tryout
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pantau daftar tryout aktif, progress soal, dan jadwal publish
                  tanpa mencampur fitur ini dengan detail kelas reguler.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddDialog}
                className="inline-flex items-center justify-center gap-2 border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Tambah Tryout
              </button>
            </div>

            <div className="px-5 py-5 md:px-6">
              {isLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`tryout-loading-${index + 1}`}
                      className="animate-pulse border border-orange-100 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-full max-w-[320px]">
                          <div className="h-3 w-2/3 bg-slate-200" />
                          <div className="mt-2 h-2.5 w-1/3 bg-orange-100" />
                        </div>
                        <div className="h-6 w-24 bg-slate-100" />
                      </div>
                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        <div className="h-10 bg-slate-100" />
                        <div className="h-10 bg-slate-100" />
                        <div className="h-10 bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTryouts.length > 0 ? (
                <>
                  <div className="hidden overflow-x-auto border border-orange-100 lg:block">
                    <table className="min-w-[1320px] w-full">
                      <thead className="bg-orange-50/80 text-left">
                        <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          <th className="px-4 py-3 font-semibold">
                            Judul Tryout
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Jenjang/Kelas
                          </th>
                          <th className="px-4 py-3 font-semibold">Mapel</th>
                          <th className="px-4 py-3 font-semibold">
                            Jumlah Soal
                          </th>
                          <th className="px-4 py-3 font-semibold">Durasi</th>
                          <th className="px-4 py-3 font-semibold">Jadwal</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 text-center font-semibold">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTryouts.map((tryout) => (
                          <tr
                            key={tryout.id}
                            className="border-t border-orange-100/80 text-sm transition hover:bg-orange-50/40"
                          >
                            <td className="px-4 py-4 align-middle">
                              <div className="grid gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="h-8 w-1 bg-orange-400" />
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {tryout.judulTryout}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      ID {tryout.id}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-slate-600">
                              <div className="grid gap-1">
                                <p className="font-semibold text-slate-800">
                                  {tryout.jenjang}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {tryout.kelas}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-slate-600">
                              {tryout.mapel}
                            </td>
                            <td className="px-4 py-4 align-middle text-slate-600">
                              <div className="grid gap-1">
                                <p className="font-semibold text-slate-800">
                                  {getTryoutQuestionCountLabel(tryout)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {getQuestionSourceDetail(tryout)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-slate-600">
                              {tryout.durasiMenit} menit
                            </td>
                            <td className="px-4 py-4 align-middle text-slate-600">
                              <div className="grid gap-1">
                                <p>{formatDateTime(tryout.tanggalMulai)}</p>
                                <p className="text-xs text-slate-500">
                                  sampai {formatDateTime(tryout.tanggalSelesai)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle">
                              <div className="grid gap-2">
                                <div className="flex flex-wrap gap-2">
                                  <StatusBadge
                                    className={getPublishBadgeClass(
                                      tryout.publishStatus,
                                    )}
                                  >
                                    {tryout.publishStatus}
                                  </StatusBadge>
                                  <StatusBadge
                                    className={getQuestionBadgeClass(
                                      tryout.jumlahSoal,
                                    )}
                                  >
                                    {getTryoutQuestionStatusLabel(tryout)}
                                  </StatusBadge>
                                  <StatusBadge
                                    className={getQuestionSourceBadgeClass(
                                      tryout.questionSource,
                                    )}
                                  >
                                    {getQuestionSourceLabel(tryout.questionSource)}
                                  </StatusBadge>
                                </div>
                                <p className="text-xs leading-5 text-slate-500">
                                  {getQuestionSourceDetail(tryout)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-middle text-center">
                              <div className="mx-auto flex w-fit items-center justify-center gap-2">
                                <ActionIconButton
                                  title="Edit Tryout"
                                  onClick={() => openEditDialog(tryout)}
                                  className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                >
                                  <Pencil className="h-4 w-4 shrink-0" />
                                </ActionIconButton>
                                <ActionIconButton
                                  title="Upload Soal"
                                  onClick={() => openUploadDialog(tryout.id)}
                                  className="border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                >
                                  <UploadCloud className="h-4 w-4 shrink-0" />
                                </ActionIconButton>
                                <ActionIconButton
                                  title="Lihat Hasil"
                                  onClick={() => openResultDialog(tryout.id)}
                                  className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                >
                                  <BarChart3 className="h-4 w-4 shrink-0" />
                                </ActionIconButton>
                                <ActionIconButton
                                  title={
                                    tryout.publishStatus === "Published"
                                      ? "Unpublish Tryout"
                                      : "Publish Tryout"
                                  }
                                  onClick={() => handleTogglePublish(tryout.id)}
                                  className={
                                    tryout.publishStatus === "Published"
                                      ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  }
                                >
                                  {tryout.publishStatus === "Published" ? (
                                    <EyeOff className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <Eye className="h-4 w-4 shrink-0" />
                                  )}
                                </ActionIconButton>
                                <ActionIconButton
                                  title="Hapus Tryout"
                                  onClick={() => handleDeleteTryout(tryout.id)}
                                  className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                >
                                  <Trash2 className="h-4 w-4 shrink-0" />
                                </ActionIconButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid gap-4 lg:hidden">
                    {filteredTryouts.map((tryout) => (
                      <article
                        key={tryout.id}
                        className="border border-orange-100 bg-white shadow-[0_20px_42px_-34px_rgba(249,115,22,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200"
                      >
                        <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />
                        <div className="grid gap-4 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-slate-800">
                                {tryout.judulTryout}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {tryout.jenjang} - {tryout.kelas} - {tryout.mapel}
                              </p>
                            </div>
                            <StatusBadge
                              className={getPublishBadgeClass(
                                tryout.publishStatus,
                              )}
                            >
                              {tryout.publishStatus}
                            </StatusBadge>
                          </div>

                          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <div className="grid gap-1">
                              <p className={LABEL_CLASS}>Jumlah Soal</p>
                              <p className="font-semibold text-slate-800">
                                {getTryoutQuestionCountLabel(tryout)}
                              </p>
                            </div>
                            <div className="grid gap-1">
                              <p className={LABEL_CLASS}>Durasi</p>
                              <p className="font-semibold text-slate-800">
                                {tryout.durasiMenit} menit
                              </p>
                            </div>
                            <div className="grid gap-1 sm:col-span-2">
                              <p className={LABEL_CLASS}>Jadwal</p>
                              <p className="font-semibold text-slate-800">
                                {formatScheduleRange(
                                  tryout.tanggalMulai,
                                  tryout.tanggalSelesai,
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <StatusBadge
                              className={getQuestionBadgeClass(tryout.jumlahSoal)}
                            >
                              {getTryoutQuestionStatusLabel(tryout)}
                            </StatusBadge>
                            <StatusBadge
                              className={getQuestionSourceBadgeClass(
                                tryout.questionSource,
                              )}
                            >
                              {getQuestionSourceLabel(tryout.questionSource)}
                            </StatusBadge>
                            <StatusBadge className="border-slate-200 bg-slate-50 text-slate-600">
                              {getTryoutQuestionCountLabel(tryout)}
                            </StatusBadge>
                          </div>

                          <p className="text-xs leading-5 text-slate-500">
                            {getQuestionSourceDetail(tryout)}
                          </p>

                          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-orange-100 pt-4">
                            <ActionIconButton
                              title="Edit Tryout"
                              onClick={() => openEditDialog(tryout)}
                              className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                            >
                              <Pencil className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <ActionIconButton
                              title="Upload Soal"
                              onClick={() => openUploadDialog(tryout.id)}
                              className="border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                            >
                              <UploadCloud className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <ActionIconButton
                              title="Lihat Hasil"
                              onClick={() => openResultDialog(tryout.id)}
                              className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                            >
                              <BarChart3 className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                            <ActionIconButton
                              title={
                                tryout.publishStatus === "Published"
                                  ? "Unpublish Tryout"
                                  : "Publish Tryout"
                              }
                              onClick={() => handleTogglePublish(tryout.id)}
                              className={
                                tryout.publishStatus === "Published"
                                  ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }
                            >
                              {tryout.publishStatus === "Published" ? (
                                <EyeOff className="h-4 w-4 shrink-0" />
                              ) : (
                                <Eye className="h-4 w-4 shrink-0" />
                              )}
                            </ActionIconButton>
                            <ActionIconButton
                              title="Hapus Tryout"
                              onClick={() => handleDeleteTryout(tryout.id)}
                              className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            >
                              <Trash2 className="h-4 w-4 shrink-0" />
                            </ActionIconButton>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="border border-dashed border-orange-200 bg-orange-50/30 px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center border border-orange-100 bg-white text-orange-500">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-700">
                    {loadError
                      ? "Data tryout guru belum berhasil dimuat."
                      : "Belum ada tryout yang cocok dengan filter saat ini."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {loadError ??
                      "Ubah jenjang, status, atau kata kunci pencarian untuk melihat daftar tryout lain yang sudah tersimpan."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <TryoutFormDialog
        draft={draftTryout}
        mode={formMode}
        open={isFormOpen}
        onClose={closeFormDialog}
        onChange={handleTryoutDraftChange}
        onOpenManualManager={handleOpenManualManagerFromForm}
        onSubmit={handleSaveTryout}
      />

      <UploadSoalDialog
        open={isUploadOpen}
        tryout={uploadTargetTryout}
        draft={questionDraft}
        editingQuestionId={editingQuestionId}
        isQuestionLoading={isQuestionLoading}
        questionLoadError={questionLoadError}
        isQuestionSubmitting={isQuestionSubmitting}
        onClose={closeUploadDialog}
        onChange={handleQuestionDraftChange}
        onSubmitQuestion={handleSubmitQuestion}
        onCancelEditQuestion={handleCancelEditQuestion}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onMoveQuestion={handleMoveQuestion}
      />

      <HasilTryoutDialog
        open={isResultOpen}
        tryout={resultTargetTryout}
        onClose={closeResultDialog}
      />
    </>
  );
}
