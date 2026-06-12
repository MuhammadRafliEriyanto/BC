
/*  */"use client";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ban,
  CreditCard,
  Download,
  Eye,
  LoaderCircle,
  Mail,
  Plus,
  RefreshCw,
  Search,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { FormEvent } from "react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requestAdminApi } from "@/lib/admin-api";
import {
  defaultAdminDashboardConfig,
  type AdminBillingPackage,
  type AdminDashboardConfigData,
} from "@/lib/admin-dashboard-config";
import {
  cancelAdminPayment,
  createAdminBatchPaymentSession,
  createAdminPaymentSession,
  exportAdminPaymentActivationsCsv,
  exportAdminPaymentsCsv,
  fetchAdminPaymentActivations,
  fetchAdminPayments,
  resendAdminPaymentLink,
  type AdminBatchPaymentReasonCode,
  type AdminPaymentActivationsData,
  type AdminPaymentListItem,
  type AdminPaymentsListData,
  type CreateAdminBatchPaymentSessionData,
  type CreateAdminBatchPaymentSessionItem,
  type CreateAdminBatchPaymentSessionPayload,
} from "@/lib/admin-payments";
import { type OwnerActivityStudentActivation } from "@/lib/owner-activities";
import {
  findPackageByKey,
  findPackageByName,
} from "@/lib/subscription";
import { cn, formatCurrency } from "@/lib/utils";

import type { AdminStudent } from "./admin-data";
import {
  AdminDataTable,
  type AdminColumnDefinition,
} from "./components/AdminDataTable";
import { AdminPaginationFooter } from "./components/AdminPaginationFooter";
import { AdminSectionCard } from "./components/AdminSectionCard";
import { AdminStatusBadge } from "./components/AdminStatusBadge";

type PaymentTab = "incoming" | "activations";
type IncomingPaymentRecord = AdminPaymentListItem;
type ActivationRecord = OwnerActivityStudentActivation;
type PaymentStatus = IncomingPaymentRecord["status"];
type ActivationStatus = ActivationRecord["activationStatus"];
type StudentLevel = Extract<ActivationRecord["jenjang"], "SD" | "SMP" | "SMA">;
type LevelFilterOption = StudentLevel | "Semua jenjang";
type CreateBillingMode = "massal" | "individual";
type BatchPackageMode = CreateAdminBatchPaymentSessionPayload["packageMode"];
type BillingFeedbackTone = "success" | "warning" | "info";
type BillingFeedback = {
  tone: BillingFeedbackTone;
  title: string;
  message: string;
  checkoutUrl?: string | null;
  statusPagePath?: string | null;
};

type PaymentViewRefreshOptions = {
  includeStudents?: boolean;
  page?: number;
  activationPageValue?: number;
};

type BranchApiItem = {
  name?: string;
};

type PackageFilterOption = {
  value: string;
  label: string;
};

const ALL_PAYMENT_STATUSES = "Semua status";
const ALL_BRANCHES = "Semua cabang";
const ALL_PACKAGES = "Semua paket";
const ALL_LEVELS = "Semua jenjang";
const ALL_CLASSES = "Semua kelas";
const ALL_ACTIVATION_STATUSES = "Semua aktivasi";

const paymentStatusOptions = [
  ALL_PAYMENT_STATUSES,
  "paid",
  "pending",
  "failed",
  "expired",
] as const;

const activationStatusOptions = [
  ALL_ACTIVATION_STATUSES,
  "Aktif",
  "Menunggu Pembayaran",
  "Expired",
  "Pembayaran Gagal",
] as const;

const warmFieldClassName =
  "border-slate-200 hover:border-orange-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 focus-visible:border-orange-300 focus-visible:ring-4 focus-visible:ring-orange-500/10";
const warmSelectTriggerClassName =
  "border-slate-200 hover:border-orange-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 focus-visible:border-orange-300 focus-visible:ring-4 focus-visible:ring-orange-500/10 data-[state=open]:border-orange-300 data-[state=open]:ring-4 data-[state=open]:ring-orange-500/10";
const warmSelectContentClassName =
  "border-orange-100/80 shadow-lg shadow-orange-100/20";
const warmSelectItemClassName =
  "hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 data-[highlighted]:bg-orange-50 data-[highlighted]:text-orange-700 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-700";
const detailDialogClassName =
  "w-[calc(100%-1.5rem)] max-h-[90vh] max-w-2xl gap-0 overflow-hidden border-slate-200/80 bg-white p-0 shadow-[0_24px_48px_-30px_rgba(15,23,42,0.22)]";
const billingDialogClassName =
  "w-[calc(100%-1rem)] max-h-[92vh] max-w-5xl gap-0 overflow-hidden border-slate-200/80 bg-white p-0 shadow-[0_24px_48px_-30px_rgba(15,23,42,0.22)]";
const emptyStudentValue = "__empty_student__";
const defaultIncomingPageLimit = 20;
const emptyIncomingSummary: AdminPaymentsListData["summary"] = {
  totalItems: 0,
  pendingCount: 0,
  paidCount: 0,
  expiredCount: 0,
  failedCount: 0,
  totalAmount: 0,
};

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function formatPaymentSourceLabel(value: IncomingPaymentRecord["source"]) {
  switch (value) {
    case "admin":
      return "Tagihan Admin";
    case "register_online":
      return "Register Online";
    default:
      return value;
  }
}

function formatPaymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "Lunas";
    case "pending":
      return "Pending";
    case "failed":
      return "Gagal";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

function formatPaymentStatusTone(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "failed":
    case "expired":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

function formatActivationStatusTone(status: ActivationStatus) {
  switch (status) {
    case "Aktif":
      return "success" as const;
    case "Menunggu Pembayaran":
      return "warning" as const;
    case "Expired":
    case "Pembayaran Gagal":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

function formatDateTimeLabel(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPaymentMethodLabel(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "-";
  }

  const knownLabels: Record<string, string> = {
    xendit_payment_link: "Xendit Payment Link",
    manual_confirmation: "Konfirmasi Manual",
    manual_transfer: "Transfer Manual",
  };

  return (
    knownLabels[normalizedValue] ??
    normalizedValue
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function formatProviderLabel(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "-";
  }

  return normalizedValue
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCancelReasonLabel(value: IncomingPaymentRecord["cancelReason"]) {
  switch (value) {
    case "admin_cancelled":
      return "Dibatalkan admin";
    case "replaced_by_new_session":
      return "Diganti sesi baru";
    case "provider_canceled":
      return "Dibatalkan provider";
    default:
      return "-";
  }
}

function formatStudentOptionLabel(student: AdminStudent) {
  return `${student.id} • ${student.name} • ${student.className}`;
}

function buildPaymentStatusPagePath(paymentId: string | null | undefined) {
  return paymentId
    ? `/register-online/status?paymentId=${encodeURIComponent(paymentId)}`
    : null;
}

function getIncomingDisplayDate(record: IncomingPaymentRecord) {
  return record.paidAt ?? record.createdAt;
}

function getIncomingDisplayDateLabel(record: IncomingPaymentRecord) {
  return record.paidAt ? "Tanggal bayar" : "Tanggal dibuat";
}

function compareTextValue(first: string, second: string) {
  return first.localeCompare(second, "id-ID", { sensitivity: "base" });
}

function compareClassValue(first: string, second: string) {
  const firstNumber = Number(first);
  const secondNumber = Number(second);

  if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
    return firstNumber - secondNumber;
  }

  return compareTextValue(first, second);
}

function createSelectOptions(
  values: Array<string | null | undefined>,
  allLabel: string,
  compare: (first: string, second: string) => number = compareTextValue,
) {
  const uniqueValues = Array.from(
    new Set(values.map((value) => normalizeText(value)).filter(Boolean)),
  ).sort(compare);

  return [allLabel, ...uniqueValues];
}

function buildPackageFilterValue(packageKey?: string | null, packageName?: string | null) {
  const normalizedPackageKey = normalizeText(packageKey);

  if (normalizedPackageKey) {
    return `key:${normalizedPackageKey.toLowerCase()}`;
  }

  const normalizedPackageName = normalizeText(packageName);

  return normalizedPackageName
    ? `name:${normalizedPackageName.toLowerCase()}`
    : "";
}

function formatPackageFilterLabel(input: {
  packageKey?: string | null;
  packageName?: string | null;
  durationMonth?: number | null;
  amount?: number | null;
}) {
  const knownPackage =
    findPackageByKey(input.packageKey) ?? findPackageByName(input.packageName);
  const packageName = normalizeText(knownPackage?.packageName ?? input.packageName) || "-";
  const amount =
    typeof knownPackage?.amount === "number"
      ? knownPackage.amount
      : typeof input.amount === "number"
        ? input.amount
        : null;
  const durationMonth =
    typeof knownPackage?.durationMonth === "number"
      ? knownPackage.durationMonth
      : typeof input.durationMonth === "number"
        ? input.durationMonth
        : null;
  const segments = [packageName];

  if (
    typeof durationMonth === "number" &&
    durationMonth > 0 &&
    !/(bulan|tahun)/i.test(packageName)
  ) {
    segments.push(`${durationMonth} bulan`);
  }

  if (typeof amount === "number") {
    segments.push(formatCurrency(amount));
  }

  return segments.join(" - ");
}

function createPackageFilterOptions(
  items: Array<{
    packageKey?: string | null;
    packageName?: string | null;
    durationMonth?: number | null;
    amount?: number | null;
  }>,
  allLabel: string,
) {
  const options = new Map<string, PackageFilterOption>();

  for (const item of items) {
    const value = buildPackageFilterValue(item.packageKey, item.packageName);

    if (!value || options.has(value)) {
      continue;
    }

    options.set(value, {
      value,
      label: formatPackageFilterLabel(item),
    });
  }

  return [
    { value: allLabel, label: allLabel },
    ...Array.from(options.values()).sort((first, second) =>
      compareTextValue(first.label, second.label),
    ),
  ];
}

function getIncomingAnomalyReasons(record: IncomingPaymentRecord) {
  const reasons = [...record.anomalyReasons];

  if (!record.student.studentId) {
    reasons.push("Student ID belum tersedia.");
  }

  if (record.student.name === "Siswa tidak ditemukan") {
    reasons.push("Relasi student atau user tidak ditemukan.");
  }

  if (!record.student.email) {
    reasons.push("Email siswa belum tersedia.");
  }

  if (!record.paymentId) {
    reasons.push("Payment ID kosong.");
  }

  if (!record.subscription?.subscriptionCode) {
    reasons.push("Subscription code kosong.");
  }

  if (record.status === "pending" && record.source === "admin" && !record.checkoutUrl) {
    reasons.push("Checkout URL belum tersedia.");
  }

  return Array.from(new Set(reasons));
}

function getActivationAnomalyReasons(record: ActivationRecord) {
  const reasons: string[] = [];

  if (!record.studentId) {
    reasons.push("Student ID kosong.");
  }

  if (record.studentName === "Siswa tidak ditemukan") {
    reasons.push("Relasi user siswa tidak ditemukan.");
  }

  if (!record.studentEmail) {
    reasons.push("Email siswa belum tersedia.");
  }

  if (record.activationStatus === "Aktif" && !record.paymentId) {
    reasons.push("Status aktif belum memiliki payment ID.");
  }

  return reasons;
}

function extractGradeFromClassOption(classOption: string) {
  const match = classOption.match(/\b(4|5|6|7|8|9|10|11|12)\b/);
  return match?.[1] ?? "";
}

function buildCanonicalBatchClassName(level: StudentLevel, classOption: string) {
  const grade = extractGradeFromClassOption(classOption);
  return grade ? `${level} ${grade}` : level;
}

function formatBatchReasonLabel(reasonCode: AdminBatchPaymentReasonCode) {
  switch (reasonCode) {
    case "NO_PREVIOUS_PACKAGE":
      return "Belum pernah punya paket";
    case "INVALID_PREVIOUS_PACKAGE":
      return "Paket terakhir tidak valid";
    case "STUDENT_USER_NOT_FOUND":
      return "User siswa tidak ditemukan";
    case "STUDENT_INACTIVE":
      return "Siswa nonaktif";
    case "BLOCKING_PENDING_PAYMENT":
      return "Masih ada pending payment";
    case "XENDIT_SESSION_FAILED":
      return "Gagal buat sesi Xendit";
    case "UNKNOWN_ERROR":
      return "Error tidak diketahui";
    default:
      return reasonCode;
  }
}

function formatBatchItemStatusTone(
  status: CreateAdminBatchPaymentSessionItem["status"],
) {
  switch (status) {
    case "created":
      return "success" as const;
    case "skipped":
      return "warning" as const;
    case "failed":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

function formatBatchItemStatusLabel(
  status: CreateAdminBatchPaymentSessionItem["status"],
) {
  switch (status) {
    case "created":
      return "Berhasil";
    case "skipped":
      return "Skipped";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function formatResolvedPackageSourceLabel(
  source: NonNullable<CreateAdminBatchPaymentSessionItem["resolvedPackage"]>["source"],
) {
  switch (source) {
    case "fixed_package":
      return "Paket tetap";
    case "latest_subscription":
      return "Paket subscription terakhir";
    default:
      return source;
  }
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  helper,
  tone,
  accentLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone: "orange" | "amber" | "emerald" | "rose" | "slate";
  accentLabel: string;
}) {
  const toneClasses = {
    orange:
      "border-orange-100/80 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-700",
    amber:
      "border-amber-100/80 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700",
    emerald:
      "border-emerald-100/80 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-700",
    rose:
      "border-rose-100/80 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-700",
    slate:
      "border-slate-200/80 bg-gradient-to-br from-slate-50 to-white text-slate-700",
  } as const;
  const accentClasses = {
    orange: {
      glow: "bg-orange-100/90",
      badge:
        "border-orange-100/80 bg-orange-50/90 text-orange-700 shadow-orange-100/70",
      divider: "from-transparent via-orange-200 to-transparent",
    },
    amber: {
      glow: "bg-amber-100/90",
      badge:
        "border-amber-100/80 bg-amber-50/90 text-amber-700 shadow-amber-100/70",
      divider: "from-transparent via-amber-200 to-transparent",
    },
    emerald: {
      glow: "bg-emerald-100/90",
      badge:
        "border-emerald-100/80 bg-emerald-50/90 text-emerald-700 shadow-emerald-100/70",
      divider: "from-transparent via-emerald-200 to-transparent",
    },
    rose: {
      glow: "bg-rose-100/90",
      badge:
        "border-rose-100/80 bg-rose-50/90 text-rose-700 shadow-rose-100/70",
      divider: "from-transparent via-rose-200 to-transparent",
    },
    slate: {
      glow: "bg-slate-100/90",
      badge:
        "border-slate-200/90 bg-slate-100/90 text-slate-700 shadow-slate-100/70",
      divider: "from-transparent via-slate-200 to-transparent",
    },
  } as const;
  const accents = accentClasses[tone];

  return (
    <Card className="group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/96 shadow-[0_20px_34px_-30px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_26px_44px_-34px_rgba(15,23,42,0.16)]">
      <div
        className={cn(
          "absolute inset-x-5 top-0 h-px bg-gradient-to-r",
          accents.divider,
        )}
      />
      <div
        className={cn(
          "absolute -right-10 top-0 size-24 rounded-full blur-3xl transition-transform duration-300 group-hover:scale-110",
          accents.glow,
        )}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
          </div>

          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 shadow-sm shadow-slate-950/5",
              toneClasses[tone],
            )}
          >
            <Icon className="size-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm",
              accents.badge,
            )}
          >
            {accentLabel}
          </Badge>
          <p className="text-[11px] leading-5 text-slate-400">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.14)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function BillingFeedbackBanner({
  feedback,
  onDismiss,
}: {
  feedback: BillingFeedback;
  onDismiss: () => void;
}) {
  const toneClassNames: Record<BillingFeedbackTone, string> = {
    success:
      "border-emerald-100/80 bg-emerald-50/90 text-emerald-700 shadow-[0_14px_24px_-24px_rgba(16,185,129,0.2)]",
    warning:
      "border-amber-100/80 bg-amber-50/90 text-amber-700 shadow-[0_14px_24px_-24px_rgba(245,158,11,0.2)]",
    info: "border-sky-100/80 bg-sky-50/90 text-sky-700 shadow-[0_14px_24px_-24px_rgba(14,165,233,0.2)]",
  };

  return (
    <div
      className={cn(
        "rounded-[24px] px-5 py-4",
        toneClassNames[feedback.tone],
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{feedback.title}</p>
          <p className="mt-1 text-sm leading-6">{feedback.message}</p>

          {feedback.checkoutUrl || feedback.statusPagePath ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {feedback.checkoutUrl ? (
                <a
                  href={feedback.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                >
                  Buka Checkout Link
                </a>
              ) : null}
              {feedback.statusPagePath ? (
                <a
                  href={feedback.statusPagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white"
                >
                  Buka Status Page
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
          Tutup
        </Button>
      </div>
    </div>
  );
}

function AnomalyBanner({
  count,
  message,
}: {
  count: number;
  message: string;
}) {
  if (!count) {
    return null;
  }

  return (
    <div className="rounded-[22px] border border-rose-100/80 bg-rose-50/90 px-4 py-3 text-sm leading-6 text-rose-700 shadow-[0_14px_24px_-24px_rgba(244,63,94,0.18)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white text-rose-600 shadow-sm">
          <AlertTriangle className="size-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {count} data perlu perhatian admin
          </p>
          <p className="mt-1 text-rose-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingPanel({ title }: { title: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-[linear-gradient(180deg,rgba(255,247,237,0.38),rgba(255,255,255,0.94))] px-5 py-12 text-center shadow-[0_14px_24px_-24px_rgba(15,23,42,0.1)]">
      <LoaderCircle className="size-7 animate-spin text-orange-500" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="text-sm leading-6 text-slate-500">
          Data pembayaran real sedang diambil dari backend.
        </p>
      </div>
    </div>
  );
}

function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-rose-100/80 bg-[linear-gradient(180deg,rgba(255,241,242,0.92),rgba(255,255,255,0.98))] px-5 py-8 shadow-[0_16px_28px_-24px_rgba(244,63,94,0.2)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100/80 bg-white text-rose-600 shadow-sm shadow-white/60">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-950">
              Data pembayaran belum bisa dimuat
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Coba lagi
        </Button>
      </div>
    </div>
  );
}

function CreateMembershipBillingDialog({
  open,
  onOpenChange,
  students,
  studentsLoading,
  studentsError,
  createMode,
  levelOptions,
  batchLevel,
  batchClassOptions,
  batchClassOption,
  branchOptions,
  batchBranchFilter,
  billingPackages,
  batchPackageMode,
  batchPackageKey,
  batchIncludeInactive,
  batchResult,
  batchError,
  studentSearchQuery,
  selectedStudentId,
  selectedPackageKey,
  expiresAtValue,
  isSubmitting,
  onCreateModeChange,
  onBatchLevelChange,
  onBatchClassOptionChange,
  onBatchBranchFilterChange,
  onBatchPackageModeChange,
  onBatchPackageKeyChange,
  onBatchIncludeInactiveChange,
  onStudentSearchQueryChange,
  onStudentIdChange,
  onPackageKeyChange,
  onExpiresAtChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: AdminStudent[];
  studentsLoading: boolean;
  studentsError: string | null;
  createMode: CreateBillingMode;
  levelOptions: StudentLevel[];
  batchLevel: StudentLevel;
  batchClassOptions: string[];
  batchClassOption: string;
  branchOptions: string[];
  billingPackages: AdminBillingPackage[];
  batchBranchFilter: string;
  batchPackageMode: BatchPackageMode;
  batchPackageKey: string;
  batchIncludeInactive: boolean;
  batchResult: CreateAdminBatchPaymentSessionData | null;
  batchError: string | null;
  studentSearchQuery: string;
  selectedStudentId: string;
  selectedPackageKey: string;
  expiresAtValue: string;
  isSubmitting: boolean;
  onCreateModeChange: (value: CreateBillingMode) => void;
  onBatchLevelChange: (value: StudentLevel) => void;
  onBatchClassOptionChange: (value: string) => void;
  onBatchBranchFilterChange: (value: string) => void;
  onBatchPackageModeChange: (value: BatchPackageMode) => void;
  onBatchPackageKeyChange: (value: string) => void;
  onBatchIncludeInactiveChange: (value: boolean) => void;
  onStudentSearchQueryChange: (value: string) => void;
  onStudentIdChange: (value: string) => void;
  onPackageKeyChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const filteredStudents = useMemo(() => {
    const normalizedQuery = studentSearchQuery.trim().toLowerCase();

    return [...students]
      .sort((first, second) => first.name.localeCompare(second.name, "id-ID"))
      .filter((student) =>
        normalizedQuery
          ? [
              student.id,
              student.name,
              student.email,
              student.className,
              student.program,
              student.branch,
            ].some((value) => value.toLowerCase().includes(normalizedQuery))
          : true,
      );
  }, [studentSearchQuery, students]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={billingDialogClassName}>
        <form className="flex max-h-[90vh] flex-col" onSubmit={onSubmit}>
          <DialogHeader className="gap-3 border-b border-slate-100 px-5 pb-4 pt-5 pr-12 sm:px-6">
            <DialogTitle className="text-xl sm:text-2xl">
              Buat Tagihan Membership
            </DialogTitle>
            <DialogDescription>
              Buat payment session Xendit baru untuk siswa existing. Status paid
              atau expired tetap ditentukan webhook Xendit.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-5 py-4 sm:px-6">
            <Tabs
              value={createMode}
              onValueChange={(value) => onCreateModeChange(value as CreateBillingMode)}
            >
              <TabsList className="w-full justify-start">
                <TabsTrigger value="massal" className="min-w-[144px]">
                  Massal
                </TabsTrigger>
                <TabsTrigger value="individual" className="min-w-[144px]">
                  Individual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="massal" className="mt-4 space-y-4">
                <div className="rounded-[22px] border border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,0.98))] px-4 py-4 shadow-[0_18px_32px_-30px_rgba(15,23,42,0.16)]">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-950">
                        Mode massal per jenjang dan kelas
                      </p>
                      <p className="text-sm leading-6 text-slate-600">
                        Default batch akan mengikuti paket membership terakhir
                        tiap siswa. Gunakan paket tetap jika admin ingin semua
                        siswa memakai durasi yang sama.
                      </p>
                    </div>
                    <Badge variant="info" className="w-fit">
                      Default: follow latest package
                    </Badge>
                  </div>
                </div>

                {batchError ? (
                  <div className="rounded-[20px] border border-rose-100/80 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                    {batchError}
                  </div>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Jenjang / program
                    </label>
                    <Select
                      value={batchLevel}
                      onValueChange={(value) => onBatchLevelChange(value as StudentLevel)}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {levelOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Kelas
                    </label>
                    <Select
                      value={batchClassOption}
                      onValueChange={onBatchClassOptionChange}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {batchClassOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                    </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Cabang
                    </label>
                    <Select
                      value={batchBranchFilter}
                      onValueChange={onBatchBranchFilterChange}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Pilih cabang" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {branchOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Mode paket
                    </label>
                    <Select
                      value={batchPackageMode}
                      onValueChange={(value) =>
                        onBatchPackageModeChange(value as BatchPackageMode)
                      }
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Pilih mode paket" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        <SelectItem
                          value="follow_latest_package"
                          className={warmSelectItemClassName}
                        >
                          Ikuti paket membership terakhir siswa
                        </SelectItem>
                        <SelectItem
                          value="fixed_package"
                          className={warmSelectItemClassName}
                        >
                          Pilih paket sama untuk semua siswa
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Expired at opsional
                    </label>
                    <Input
                      type="datetime-local"
                      value={expiresAtValue}
                      onChange={(event) => onExpiresAtChange(event.target.value)}
                      className={warmFieldClassName}
                    />
                  </div>
                </div>

                {batchPackageMode === "fixed_package" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Paket membership
                    </label>
                    <Select
                      value={batchPackageKey}
                      onValueChange={onBatchPackageKeyChange}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Pilih paket membership" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {billingPackages.map((item) => (
                          <SelectItem
                            key={item.packageKey}
                            value={item.packageKey}
                            className={warmSelectItemClassName}
                          >
                            {item.packageName} • {formatCurrency(item.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                <label className="flex items-start gap-3 rounded-[20px] border border-slate-200/80 bg-slate-50/75 px-4 py-3 text-sm text-slate-700 shadow-[0_12px_22px_-24px_rgba(15,23,42,0.16)]">
                  <input
                    type="checkbox"
                    checked={batchIncludeInactive}
                    onChange={(event) =>
                      onBatchIncludeInactiveChange(event.target.checked)
                    }
                    className="mt-0.5 size-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="leading-6">
                    Sertakan siswa nonaktif. Jika dimatikan, siswa nonaktif tetap
                    ikut dihitung sebagai target batch tetapi akan ditandai
                    skipped dengan reason code <code>STUDENT_INACTIVE</code>.
                  </span>
                </label>

                {batchResult ? (
                  <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.16)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-950">
                          Hasil batch tagihan
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Target {batchResult.filters.level}{" "}
                          {batchResult.filters.className} dengan mode paket{" "}
                          {batchResult.filters.packageMode ===
                          "follow_latest_package"
                            ? "follow latest package"
                            : "fixed package"}
                          .
                        </p>
                      </div>
                      <Badge
                        variant={
                          batchResult.summary.failedCount > 0
                            ? "warning"
                            : "success"
                        }
                        className="w-fit"
                      >
                        {batchResult.summary.createdCount} berhasil
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <InfoField
                        label="Total target"
                        value={String(batchResult.summary.totalTargetStudents)}
                      />
                      <InfoField
                        label="Berhasil dibuat"
                        value={String(batchResult.summary.createdCount)}
                      />
                      <InfoField
                        label="Skipped"
                        value={String(batchResult.summary.skippedCount)}
                      />
                      <InfoField
                        label="Failed"
                        value={String(batchResult.summary.failedCount)}
                      />
                      <InfoField
                        label="Cabang"
                        value={batchResult.filters.branch ?? "Semua cabang"}
                      />
                    </div>

                    {Object.keys(batchResult.summary.reasonCounts).length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-800">
                          Reason counts
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(batchResult.summary.reasonCounts).map(
                            ([reasonCode, count]) => (
                              <Badge key={reasonCode} variant="outline">
                                {formatBatchReasonLabel(
                                  reasonCode as AdminBatchPaymentReasonCode,
                                )}{" "}
                                • {count}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Detail siswa
                      </p>
                      <div className="max-h-[38vh] space-y-3 overflow-y-auto pr-1">
                        {batchResult.items.map((item) => (
                          <div
                            key={`${item.studentId}-${item.paymentId ?? item.reasonCode ?? item.status}`}
                            className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[0_12px_22px_-24px_rgba(15,23,42,0.14)]"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-slate-950">
                                    {item.studentName}
                                  </p>
                                  <Badge
                                    variant={formatBatchItemStatusTone(item.status)}
                                  >
                                    {formatBatchItemStatusLabel(item.status)}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {item.studentStatus}
                                  </Badge>
                                  {item.reasonCode ? (
                                    <Badge variant="outline">
                                      {formatBatchReasonLabel(item.reasonCode)}
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="text-sm text-slate-500">
                                  {item.studentId} • {item.className}
                                </p>
                                {item.email ? (
                                  <p className="text-sm text-slate-500">
                                    {item.email}
                                  </p>
                                ) : null}
                                <p className="text-sm leading-6 text-slate-600">
                                  {item.message}
                                </p>
                              </div>

                              {item.resolvedPackage ? (
                                <div className="rounded-[18px] border border-orange-100/80 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                                  <p className="font-semibold text-slate-900">
                                    {item.resolvedPackage.packageName}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {item.resolvedPackage.durationMonth} bulan •{" "}
                                    {formatResolvedPackageSourceLabel(
                                      item.resolvedPackage.source,
                                    )}
                                  </p>
                                  {item.resolvedPackage.sourceSubscriptionCode ? (
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      Dari subscription{" "}
                                      {item.resolvedPackage.sourceSubscriptionCode}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            {item.status === "created" ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.paymentId ? (
                                  <Badge variant="success">
                                    Payment ID: {item.paymentId}
                                  </Badge>
                                ) : null}
                                {item.subscriptionCode ? (
                                  <Badge variant="secondary">
                                    {item.subscriptionCode}
                                  </Badge>
                                ) : null}
                                {item.checkoutUrl ? (
                                  <a
                                    href={item.checkoutUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                                  >
                                    Buka checkout
                                  </a>
                                ) : null}
                                {item.statusPagePath ? (
                                  <a
                                    href={item.statusPagePath}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                                  >
                                    Buka status
                                  </a>
                                ) : null}
                              </div>
                            ) : null}

                            {item.reasonCode === "BLOCKING_PENDING_PAYMENT" ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.blockingPaymentId ? (
                                  <Badge variant="warning">
                                    Blocking payment: {item.blockingPaymentId}
                                  </Badge>
                                ) : null}
                                {item.blockingSubscriptionCode ? (
                                  <Badge variant="warning">
                                    {item.blockingSubscriptionCode}
                                  </Badge>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="individual" className="mt-4 space-y-4">
                {studentsError ? (
                  <div className="rounded-[20px] border border-rose-100/80 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                    {studentsError}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Cari siswa existing
                  </label>
                  <Input
                    value={studentSearchQuery}
                    onChange={(event) => onStudentSearchQueryChange(event.target.value)}
                    placeholder="Cari berdasarkan student ID, nama, email, kelas, atau cabang..."
                    className={warmFieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Pilih siswa
                  </label>
                  <Select
                    value={selectedStudentId || undefined}
                    onValueChange={onStudentIdChange}
                    disabled={studentsLoading || filteredStudents.length === 0}
                  >
                    <SelectTrigger className={warmSelectTriggerClassName}>
                      <SelectValue
                        placeholder={
                          studentsLoading
                            ? "Memuat daftar siswa..."
                            : "Pilih siswa existing"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className={warmSelectContentClassName}>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <SelectItem
                            key={student.id}
                            value={student.id}
                            className={warmSelectItemClassName}
                          >
                            {formatStudentOptionLabel(student)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          value={emptyStudentValue}
                          disabled
                          className={warmSelectItemClassName}
                        >
                          Tidak ada siswa yang cocok
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Paket membership
                    </label>
                    <Select
                      value={selectedPackageKey}
                      onValueChange={onPackageKeyChange}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Pilih paket membership" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {billingPackages.map((item) => (
                          <SelectItem
                            key={item.packageKey}
                            value={item.packageKey}
                            className={warmSelectItemClassName}
                          >
                            {item.packageName} • {formatCurrency(item.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Expired at opsional
                    </label>
                    <Input
                      type="datetime-local"
                      value={expiresAtValue}
                      onChange={(event) => onExpiresAtChange(event.target.value)}
                      className={warmFieldClassName}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Tutup
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {createMode === "massal"
                ? batchResult
                  ? "Proses Batch Lagi"
                  : "Proses Tagihan Massal"
                : "Buat Tagihan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IncomingPaymentDetailDialog({
  record,
  open,
  onOpenChange,
}: {
  record: IncomingPaymentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const anomalyReasons = record ? getIncomingAnomalyReasons(record) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={detailDialogClassName}>
        {record ? (
          <div className="flex max-h-[84vh] flex-col">
            <DialogHeader className="gap-3 border-b border-slate-100 px-5 pb-4 pt-5 pr-12 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge
                  status={formatPaymentStatusLabel(record.status)}
                  tone={formatPaymentStatusTone(record.status)}
                  className="w-fit"
                />
                {anomalyReasons.length ? (
                  <Badge variant="danger">Anomali data</Badge>
                ) : null}
              </div>
              <DialogTitle className="text-xl sm:text-2xl">
                {record.student.name}
              </DialogTitle>
              <DialogDescription>
                Detail tagihan membership dan status payment Xendit berdasarkan
                endpoint admin payment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              {anomalyReasons.length ? (
                <div className="rounded-[22px] border border-rose-100/80 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  {anomalyReasons.join(" ")}
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <InfoField label="Payment ID" value={record.paymentId} />
                <InfoField
                  label="Subscription Code"
                  value={record.subscription?.subscriptionCode ?? "-"}
                />
                <InfoField
                  label="Student ID"
                  value={record.student.studentId ?? "-"}
                />
                <InfoField label="Nama siswa" value={record.student.name} />
                <InfoField
                  label="Email siswa"
                  value={record.student.email ?? "Email tidak tersedia"}
                />
                <InfoField label="Cabang" value={record.student.branch} />
                <InfoField
                  label="Program / Kelas"
                  value={`${record.student.program || "-"} / ${record.student.className || "-"}`}
                />
                <InfoField label="Paket membership" value={record.packageName} />
                <InfoField label="Nominal" value={formatCurrency(record.amount)} />
                <InfoField
                  label="Durasi"
                  value={
                    record.durationMonth
                      ? `${record.durationMonth} bulan`
                      : "Durasi belum tersedia"
                  }
                />
                <InfoField
                  label="Provider"
                  value={formatProviderLabel(record.provider)}
                />
                <InfoField
                  label="Metode"
                  value={formatPaymentMethodLabel(record.method)}
                />
                <InfoField
                  label="Sumber"
                  value={formatPaymentSourceLabel(record.source)}
                />
                <InfoField
                  label="Status"
                  value={formatPaymentStatusLabel(record.status)}
                />
                <InfoField
                  label={getIncomingDisplayDateLabel(record)}
                  value={formatDateTimeLabel(getIncomingDisplayDate(record))}
                />
                <InfoField
                  label="Expired at"
                  value={formatDateTimeLabel(record.expiresAt)}
                />
                <InfoField
                  label="Link terakhir dikirim"
                  value={formatDateTimeLabel(record.checkoutLastSentAt)}
                />
                <InfoField
                  label="Jumlah resend"
                  value={`${record.checkoutSendCount}x`}
                />
                <InfoField
                  label="Alasan cancel"
                  value={formatCancelReasonLabel(record.cancelReason)}
                />
                <InfoField
                  label="Dibatalkan pada"
                  value={formatDateTimeLabel(record.canceledAt)}
                />
              </div>

              {record.checkoutUrl ? (
                <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/90 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Checkout link
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={record.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-orange-50"
                    >
                      Buka checkout
                    </a>
                    {buildPaymentStatusPagePath(record.paymentId) ? (
                      <a
                        href={buildPaymentStatusPagePath(record.paymentId) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-orange-50"
                      >
                        Buka status page
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ActivationDetailDialog({
  record,
  open,
  onOpenChange,
}: {
  record: ActivationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const anomalyReasons = record ? getActivationAnomalyReasons(record) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={detailDialogClassName}>
        {record ? (
          <div className="flex max-h-[84vh] flex-col">
            <DialogHeader className="gap-3 border-b border-slate-100 px-5 pb-4 pt-5 pr-12 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge
                  status={formatPaymentStatusLabel(record.paymentStatus)}
                  tone={formatPaymentStatusTone(record.paymentStatus)}
                  className="w-fit"
                />
                <AdminStatusBadge
                  status={record.activationStatus}
                  tone={formatActivationStatusTone(record.activationStatus)}
                  className="w-fit"
                />
                {anomalyReasons.length ? (
                  <Badge variant="danger">Anomali data</Badge>
                ) : null}
              </div>
              <DialogTitle className="text-xl sm:text-2xl">
                {record.studentName}
              </DialogTitle>
              <DialogDescription>
                Detail aktivasi membership siswa berdasarkan data backend real.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              {anomalyReasons.length ? (
                <div className="rounded-[22px] border border-rose-100/80 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  {anomalyReasons.join(" ")}
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <InfoField label="Student ID" value={record.studentId ?? "-"} />
                <InfoField label="Payment ID" value={record.paymentId ?? "-"} />
                <InfoField label="Nama siswa" value={record.studentName} />
                <InfoField
                  label="Email siswa"
                  value={record.studentEmail ?? "Email tidak tersedia"}
                />
                <InfoField label="Cabang" value={record.branch} />
                <InfoField label="Jenjang" value={record.jenjang} />
                <InfoField label="Kelas" value={record.classLabel} />
                <InfoField
                  label="Paket membership"
                  value={record.membershipPackage}
                />
                <InfoField
                  label="Status pembayaran"
                  value={formatPaymentStatusLabel(record.paymentStatus)}
                />
                <InfoField
                  label="Status aktivasi"
                  value={record.activationStatus}
                />
                <InfoField
                  label="Registered at"
                  value={formatDateTimeLabel(record.registeredAt)}
                />
                <InfoField
                  label="Active until"
                  value={formatDateTimeLabel(record.activeUntil)}
                />
                <InfoField
                  label="Subscription Code"
                  value={record.subscriptionCode}
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function AdminPaymentVerification({
  dashboardConfig = defaultAdminDashboardConfig,
  onRefresh,
  globalSearchQuery = "",
}: {
  dashboardConfig?: AdminDashboardConfigData;
  onRefresh?: () => Promise<void> | void;
  globalSearchQuery?: string;
}) {
  const billingPackages = dashboardConfig.payment.billingPackages;
  const batchClassOptionsByLevel =
    dashboardConfig.payment.batchClassOptionsByLevel;
  const billingLevelOptions = dashboardConfig.academic.levels as StudentLevel[];
  const levelFilterOptions: LevelFilterOption[] = [
    ALL_LEVELS,
    ...billingLevelOptions,
  ];
  const defaultBatchLevel = billingLevelOptions[0] ?? "SD";
  const defaultBatchClassOption =
    batchClassOptionsByLevel[defaultBatchLevel]?.[0] ?? "";
  const defaultBillingPackageKey = billingPackages[0]?.packageKey ?? "";
  const [activeTab, setActiveTab] = useState<PaymentTab>("incoming");
  const [incomingPayments, setIncomingPayments] = useState<
    IncomingPaymentRecord[]
  >([]);
  const [activationStudents, setActivationStudents] = useState<ActivationRecord[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [studentBranchAvailable, setStudentBranchAvailable] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [activationsLoading, setActivationsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [activationsError, setActivationsError] = useState<string | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [incomingPage, setIncomingPage] = useState(1);
  const [incomingPageLimit, setIncomingPageLimit] = useState(
    defaultIncomingPageLimit,
  );
  const [incomingTotalPages, setIncomingTotalPages] = useState(1);
  const [incomingTotalItems, setIncomingTotalItems] = useState(0);
  const [activationPage, setActivationPage] = useState(1);
  const [activationPageLimit, setActivationPageLimit] =
    useState(defaultIncomingPageLimit);
  const [activationTotalPages, setActivationTotalPages] = useState(1);
  const [activationTotalItems, setActivationTotalItems] = useState(0);
  const [activationSummary, setActivationSummary] =
    useState<AdminPaymentActivationsData["summary"]>({
      totalItems: 0,
      activeCount: 0,
      pendingCount: 0,
      expiredCount: 0,
      failedCount: 0,
    });
  const [incomingSummary, setIncomingSummary] =
    useState<AdminPaymentsListData["summary"]>(emptyIncomingSummary);
  const [billingFeedback, setBillingFeedback] = useState<BillingFeedback | null>(
    null,
  );

  const [incomingSearchQuery, setIncomingSearchQuery] = useState("");
  const [incomingStatusFilter, setIncomingStatusFilter] =
    useState<(typeof paymentStatusOptions)[number]>(ALL_PAYMENT_STATUSES);
  const [incomingPackageFilter, setIncomingPackageFilter] = useState(ALL_PACKAGES);
  const [incomingBranchFilter, setIncomingBranchFilter] = useState(ALL_BRANCHES);

  const [activationSearchQuery, setActivationSearchQuery] = useState("");
  const [activationPaymentStatusFilter, setActivationPaymentStatusFilter] =
    useState<(typeof paymentStatusOptions)[number]>(ALL_PAYMENT_STATUSES);
  const [activationPackageFilter, setActivationPackageFilter] =
    useState(ALL_PACKAGES);
  const [activationBranchFilter, setActivationBranchFilter] =
    useState(ALL_BRANCHES);
  const [activationStatusFilter, setActivationStatusFilter] =
    useState<(typeof activationStatusOptions)[number]>(ALL_ACTIVATION_STATUSES);
  const [levelFilter, setLevelFilter] = useState<LevelFilterOption>(ALL_LEVELS);
  const [classFilter, setClassFilter] = useState(ALL_CLASSES);

  const [selectedIncomingPaymentId, setSelectedIncomingPaymentId] = useState<
    string | null
  >(null);
  const [selectedActivationId, setSelectedActivationId] = useState<string | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [createBillingMode, setCreateBillingMode] =
    useState<CreateBillingMode>("massal");
  const [batchLevel, setBatchLevel] = useState<StudentLevel>(defaultBatchLevel);
  const [batchClassOption, setBatchClassOption] =
    useState<string>(defaultBatchClassOption);
  const [batchBranchFilter, setBatchBranchFilter] = useState(ALL_BRANCHES);
  const [batchPackageMode, setBatchPackageMode] =
    useState<BatchPackageMode>("follow_latest_package");
  const [batchPackageKey, setBatchPackageKey] =
    useState<string>(defaultBillingPackageKey);
  const [batchIncludeInactive, setBatchIncludeInactive] = useState(false);
  const [batchResult, setBatchResult] =
    useState<CreateAdminBatchPaymentSessionData | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedPackageKey, setSelectedPackageKey] =
    useState<string>(defaultBillingPackageKey);
  const [expiresAtValue, setExpiresAtValue] = useState("");
  const [activePaymentActionKey, setActivePaymentActionKey] = useState<
    string | null
  >(null);
  const previousIncomingFiltersRef = useRef<string | null>(null);
  const previousActivationFiltersRef = useRef<string | null>(null);
  const deferredIncomingSearchQuery = useDeferredValue(incomingSearchQuery);
  const deferredGlobalSearchQuery = useDeferredValue(globalSearchQuery);
  const deferredActivationSearchQuery = useDeferredValue(activationSearchQuery);

  const isRefreshing =
    paymentsLoading || activationsLoading || studentsLoading;

  function resetCreateDialogState() {
    setCreateBillingMode("massal");
    setBatchLevel(defaultBatchLevel);
    setBatchClassOption(defaultBatchClassOption);
    setBatchBranchFilter(ALL_BRANCHES);
    setBatchPackageMode("follow_latest_package");
    setBatchPackageKey(defaultBillingPackageKey);
    setBatchIncludeInactive(false);
    setBatchResult(null);
    setBatchError(null);
    setStudentSearchQuery("");
    setSelectedStudentId("");
    setSelectedPackageKey(defaultBillingPackageKey);
    setExpiresAtValue("");
  }

  function clearBatchOutcome() {
    setBatchError(null);
    setBatchResult(null);
  }

  function handleCreateModeChange(value: CreateBillingMode) {
    setCreateBillingMode(value);
    clearBatchOutcome();
  }

  function handleBatchLevelChange(value: StudentLevel) {
    setBatchLevel(value);
    setBatchClassOption(batchClassOptionsByLevel[value]?.[0] ?? "");
    clearBatchOutcome();
  }

  function handleBatchClassOptionChange(value: string) {
    setBatchClassOption(value);
    clearBatchOutcome();
  }

  function handleBatchBranchFilterChange(value: string) {
    setBatchBranchFilter(value);
    clearBatchOutcome();
  }

  function handleBatchPackageModeChange(value: BatchPackageMode) {
    setBatchPackageMode(value);
    clearBatchOutcome();
  }

  function handleBatchPackageKeyChange(value: string) {
    setBatchPackageKey(value);
    clearBatchOutcome();
  }

  function handleBatchIncludeInactiveChange(value: boolean) {
    setBatchIncludeInactive(value);
    clearBatchOutcome();
  }

  function handleExpiresAtValueChange(value: string) {
    setExpiresAtValue(value);
    clearBatchOutcome();
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadBranchOptions() {
      try {
        const payload = await requestAdminApi<{ branches: BranchApiItem[] }>(
          "/api/branches",
          {
            method: "GET",
          },
        );

        if (isCancelled) {
          return;
        }

        const nextBranchOptions = Array.from(
          new Set(
            (payload.data?.branches ?? [])
              .map((branch) => branch.name?.trim() ?? "")
              .filter(Boolean),
          ),
        ).sort((first, second) => first.localeCompare(second, "id-ID"));

        setBranchOptions(nextBranchOptions);
      } catch {
        if (!isCancelled) {
          setBranchOptions([]);
        }
      }
    }

    void loadBranchOptions();

    return () => {
      isCancelled = true;
    };
  }, []);

  const normalizedIncomingSearchQuery = normalizeText(deferredIncomingSearchQuery);
  const normalizedGlobalIncomingSearchQuery = normalizeText(deferredGlobalSearchQuery);
  const incomingServerSearchQuery = [
    normalizedIncomingSearchQuery,
    normalizedGlobalIncomingSearchQuery,
  ]
    .filter(Boolean)
    .join(" ");
  const incomingRequestFiltersKey = [
    incomingServerSearchQuery.toLowerCase(),
    incomingStatusFilter,
    incomingPackageFilter,
    incomingBranchFilter,
    incomingPageLimit,
  ].join("|");
  const activationServerSearchQuery = [
    normalizeText(deferredActivationSearchQuery),
    normalizedGlobalIncomingSearchQuery,
  ]
    .filter(Boolean)
    .join(" ");
  const activationRequestFiltersKey = [
    activationServerSearchQuery.toLowerCase(),
    activationPaymentStatusFilter,
    activationPackageFilter,
    activationBranchFilter,
    activationStatusFilter,
    levelFilter,
    classFilter,
    activationPageLimit,
  ].join("|");

  const loadIncomingPayments = useCallback(
    async (page: number = incomingPage) => {
      setPaymentsLoading(true);
      setPaymentsError(null);

      try {
        const result = await fetchAdminPayments({
          page,
          limit: incomingPageLimit,
          q: incomingServerSearchQuery || undefined,
          status:
            incomingStatusFilter === ALL_PAYMENT_STATUSES
              ? undefined
              : incomingStatusFilter,
          package:
            incomingPackageFilter === ALL_PACKAGES
              ? undefined
              : incomingPackageFilter,
          branch:
            incomingBranchFilter === ALL_BRANCHES
              ? undefined
              : incomingBranchFilter,
        });

        setIncomingPayments(result.items);
        setIncomingSummary(result.summary);
        setIncomingPage(result.pagination.page);
        setIncomingPageLimit(result.pagination.limit);
        setIncomingTotalPages(result.pagination.totalPages);
        setIncomingTotalItems(result.pagination.totalItems);
        setPaymentsError(null);
      } catch (error) {
        setIncomingPayments([]);
        setIncomingSummary(emptyIncomingSummary);
        setIncomingTotalPages(1);
        setIncomingTotalItems(0);
        setPaymentsError(
          error instanceof Error
            ? error.message
            : "Gagal memuat daftar payment admin.",
        );
      } finally {
        setPaymentsLoading(false);
      }
    },
    [
      incomingBranchFilter,
      incomingPage,
      incomingPageLimit,
      incomingPackageFilter,
      incomingServerSearchQuery,
      incomingStatusFilter,
    ],
  );

  const loadActivationStudents = useCallback(async (page: number = activationPage) => {
    setActivationsLoading(true);
    setActivationsError(null);

    try {
      const result = await fetchAdminPaymentActivations({
        page,
        limit: activationPageLimit,
        q: activationServerSearchQuery || undefined,
        paymentStatus:
          activationPaymentStatusFilter === ALL_PAYMENT_STATUSES
            ? undefined
            : activationPaymentStatusFilter,
        activationStatus:
          activationStatusFilter === ALL_ACTIVATION_STATUSES
            ? undefined
            : activationStatusFilter,
        package:
          activationPackageFilter === ALL_PACKAGES
            ? undefined
            : activationPackageFilter,
        branch:
          activationBranchFilter === ALL_BRANCHES
            ? undefined
            : activationBranchFilter,
        level: levelFilter === ALL_LEVELS ? undefined : levelFilter,
        className: classFilter === ALL_CLASSES ? undefined : classFilter,
      });

      setActivationStudents(result.items);
      setActivationSummary(result.summary);
      setActivationPage(result.pagination.page);
      setActivationPageLimit(result.pagination.limit);
      setActivationTotalPages(result.pagination.totalPages);
      setActivationTotalItems(result.pagination.totalItems);
      setStudentBranchAvailable(result.studentBranchAvailable);
      setActivationsError(null);
    } catch (error) {
      setActivationStudents([]);
      setActivationSummary({
        totalItems: 0,
        activeCount: 0,
        pendingCount: 0,
        expiredCount: 0,
        failedCount: 0,
      });
      setActivationTotalPages(1);
      setActivationTotalItems(0);
      setStudentBranchAvailable(false);
      setActivationsError(
        error instanceof Error
          ? error.message
          : "Gagal memuat aktivasi membership siswa.",
      );
    } finally {
      setActivationsLoading(false);
    }
  }, [
    activationBranchFilter,
    activationPage,
    activationPageLimit,
    activationPackageFilter,
    activationPaymentStatusFilter,
    activationServerSearchQuery,
    activationStatusFilter,
    classFilter,
    levelFilter,
  ]);

  const loadStudentsList = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError(null);

    try {
      const result = await requestAdminApi<{ students: AdminStudent[] }>(
        "/api/students",
        {
          method: "GET",
        },
      );

      setStudents(result.data?.students ?? []);
      setStudentsError(null);
    } catch (error) {
      setStudents([]);
      setStudentsError(
        error instanceof Error
          ? error.message
          : "Gagal memuat daftar siswa existing.",
      );
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const loadPaymentView = useCallback(
    async ({
      includeStudents = true,
      page = incomingPage,
      activationPageValue = activationPage,
    }: PaymentViewRefreshOptions = {}) => {
      await Promise.allSettled([
        loadIncomingPayments(page),
        loadActivationStudents(activationPageValue),
        includeStudents ? loadStudentsList() : Promise.resolve(),
      ]);
    },
    [
      activationPage,
      incomingPage,
      loadActivationStudents,
      loadIncomingPayments,
      loadStudentsList,
    ],
  );

  const refreshPaymentViews = useCallback(
    async (options: PaymentViewRefreshOptions = {}) => {
      await Promise.allSettled([
        loadPaymentView(options),
        Promise.resolve(onRefresh?.()),
      ]);
    },
    [loadPaymentView, onRefresh],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.allSettled([
        loadActivationStudents(activationPage),
        loadStudentsList(),
      ]);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activationPage, loadActivationStudents, loadStudentsList]);

  useEffect(() => {
    const filtersChanged =
      previousIncomingFiltersRef.current !== null &&
      previousIncomingFiltersRef.current !== incomingRequestFiltersKey;

    previousIncomingFiltersRef.current = incomingRequestFiltersKey;

    if (filtersChanged && incomingPage !== 1) {
      setIncomingPage(1);
      return;
    }

    const timer = window.setTimeout(() => {
      void loadIncomingPayments(incomingPage);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [incomingPage, incomingRequestFiltersKey, loadIncomingPayments]);

  useEffect(() => {
    const filtersChanged =
      previousActivationFiltersRef.current !== null &&
      previousActivationFiltersRef.current !== activationRequestFiltersKey;

    previousActivationFiltersRef.current = activationRequestFiltersKey;

    if (filtersChanged && activationPage !== 1) {
      setActivationPage(1);
      return;
    }

    const timer = window.setTimeout(() => {
      void loadActivationStudents(activationPage);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    activationPage,
    activationRequestFiltersKey,
    loadActivationStudents,
  ]);

  useEffect(() => {
    const refreshOnFocus = () => {
      void refreshPaymentViews({
        includeStudents: false,
      });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshOnFocus();
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshPaymentViews]);

  const sharedBranchOptions = useMemo(
    () =>
      createSelectOptions(
        [
          ...branchOptions,
          ...incomingPayments.map((payment) => payment.student.branch),
          ...activationStudents.map((student) => student.branch),
          ...students.map((student) => student.branch),
        ],
        ALL_BRANCHES,
      ),
    [activationStudents, branchOptions, incomingPayments, students],
  );

  const incomingBranchOptions = sharedBranchOptions;
  const activationBranchOptions = sharedBranchOptions;
  const batchBranchOptions = sharedBranchOptions;

  const incomingPackageOptions = useMemo(
    () =>
      createPackageFilterOptions(
        [
          ...billingPackages.map((item) => ({
            packageKey: item.packageKey,
            packageName: item.packageName,
            durationMonth: item.durationMonth,
            amount: item.amount,
          })),
          ...incomingPayments.map((payment) => ({
            packageKey: payment.packageKey,
            packageName: payment.packageName,
            durationMonth: payment.durationMonth,
            amount: payment.amount,
          })),
        ],
        ALL_PACKAGES,
      ),
    [billingPackages, incomingPayments],
  );

  const activationPackageOptions = useMemo(
    () =>
      createPackageFilterOptions(
        [
          ...billingPackages.map((item) => ({
            packageKey: item.packageKey,
            packageName: item.packageName,
            durationMonth: item.durationMonth,
            amount: item.amount,
          })),
          ...activationStudents.map((student) => ({
            packageKey: student.packageKey,
            packageName: student.membershipPackage,
            durationMonth: student.durationMonth,
            amount: null,
          })),
        ],
        ALL_PACKAGES,
      ),
    [activationStudents, billingPackages],
  );

  const activationClassOptions = useMemo(() => {
    if (levelFilter === ALL_LEVELS) {
      return [ALL_CLASSES];
    }

    return createSelectOptions(
      [...(batchClassOptionsByLevel[levelFilter as StudentLevel] ?? [])],
      ALL_CLASSES,
      compareClassValue,
    );
  }, [batchClassOptionsByLevel, levelFilter]);

  const filteredIncomingPayments = incomingPayments;
  const filteredActivationStudents = activationStudents;

  const incomingAnomalyCount = useMemo(
    () =>
      filteredIncomingPayments.filter(
        (payment) => getIncomingAnomalyReasons(payment).length > 0,
      ).length,
    [filteredIncomingPayments],
  );

  const activationAnomalyCount = useMemo(
    () =>
      activationStudents.filter(
        (student) => getActivationAnomalyReasons(student).length > 0,
      ).length,
    [activationStudents],
  );

  const totalPaidAmount = useMemo(
    () =>
      incomingPayments
        .filter((payment) => payment.status === "paid")
        .reduce((total, payment) => total + payment.amount, 0),
    [incomingPayments],
  );

  const activeMembershipCount = useMemo(
    () => activationSummary.activeCount,
    [activationSummary.activeCount],
  );

  const incomingOverview = useMemo(
    () => ({
      totalCount: incomingTotalItems,
      filteredAmount: incomingSummary.totalAmount,
      paidCount: incomingSummary.paidCount,
      visibleCount: incomingPayments.length,
    }),
    [incomingPayments.length, incomingSummary.paidCount, incomingSummary.totalAmount, incomingTotalItems],
  );
  const incomingPageStart =
    incomingTotalItems > 0 ? (incomingPage - 1) * incomingPageLimit + 1 : 0;
  const incomingPageEnd =
    incomingPageStart > 0 && filteredIncomingPayments.length > 0
      ? incomingPageStart + filteredIncomingPayments.length - 1
      : 0;

  const activationOverview = useMemo(
    () => ({
      totalCount: activationSummary.totalItems,
      activeCount: activationSummary.activeCount,
      pendingCount: activationSummary.pendingCount,
    }),
    [activationSummary],
  );

  const selectedIncomingPayment = useMemo(
    () =>
      selectedIncomingPaymentId
        ? incomingPayments.find((payment) => payment.id === selectedIncomingPaymentId) ??
          null
        : null,
    [incomingPayments, selectedIncomingPaymentId],
  );

  const selectedActivationStudent = useMemo(
    () =>
      selectedActivationId
        ? activationStudents.find((student) => student.id === selectedActivationId) ??
          null
        : null,
    [activationStudents, selectedActivationId],
  );

  async function handleCreateBatchPaymentSession(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (batchPackageMode === "fixed_package" && !batchPackageKey) {
      const message =
        "Belum ada paket membership dari backend yang bisa dipakai untuk batch tagihan.";
      setBatchError(message);
      window.alert(message);
      return;
    }

    const selectedGrade = extractGradeFromClassOption(batchClassOption);

    if (!selectedGrade) {
      const message = "Pilih kelas yang valid untuk batch tagihan.";
      setBatchError(message);
      window.alert(message);
      return;
    }

    setIsCreatingPayment(true);
    setBatchError(null);
    setBatchResult(null);

    try {
      const response = await createAdminBatchPaymentSession({
        level: batchLevel,
        grade: selectedGrade,
        className: buildCanonicalBatchClassName(batchLevel, batchClassOption),
        branch: batchBranchFilter === ALL_BRANCHES ? undefined : batchBranchFilter,
        packageMode: batchPackageMode,
        packageKey:
          batchPackageMode === "fixed_package" ? batchPackageKey : undefined,
        expiresAt: expiresAtValue
          ? new Date(expiresAtValue).toISOString()
          : undefined,
        includeInactive: batchIncludeInactive,
      });

      setBatchResult(response);
      setBillingFeedback({
        tone:
          response.summary.failedCount > 0 || response.summary.skippedCount > 0
            ? "warning"
            : "success",
        title: "Batch tagihan selesai diproses",
        message: `${response.summary.createdCount} berhasil dibuat, ${response.summary.skippedCount} skipped, dan ${response.summary.failedCount} failed untuk ${response.summary.totalTargetStudents} siswa target.`,
      });
      setIncomingPage(1);
      await refreshPaymentViews({
        includeStudents: false,
        page: 1,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Batch tagihan belum bisa diproses.";

      setBatchError(message);
      setBillingFeedback({
        tone: "warning",
        title: "Batch tagihan belum bisa diproses",
        message,
      });
      window.alert(message);
    } finally {
      setIsCreatingPayment(false);
    }
  }

  async function handleCreatePaymentSession(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedStudentId) {
      window.alert("Pilih siswa existing terlebih dahulu.");
      return;
    }

    if (!selectedPackageKey) {
      window.alert(
        "Belum ada paket membership dari backend yang bisa dipilih untuk tagihan individual.",
      );
      return;
    }

    setIsCreatingPayment(true);

    try {
      const response = await createAdminPaymentSession({
        studentId: selectedStudentId,
        packageKey: selectedPackageKey,
        expiresAt: expiresAtValue
          ? new Date(expiresAtValue).toISOString()
          : undefined,
      });

      const statusPagePath =
        response.statusPagePath ??
        buildPaymentStatusPagePath(response.payment.paymentId);

      setBillingFeedback({
        tone: "success",
        title: "Tagihan membership berhasil dibuat",
        message: `Checkout link untuk ${response.student.name} sudah dibuat. Admin bisa mengirim link ini ke siswa tanpa approval manual tambahan.`,
        checkoutUrl: response.payment.checkoutUrl ?? null,
        statusPagePath,
      });
      window.alert("Tagihan membership berhasil dibuat.");
      setIsCreateDialogOpen(false);
      resetCreateDialogState();
      setIncomingPage(1);
      await refreshPaymentViews({
        includeStudents: false,
        page: 1,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Tagihan membership belum bisa dibuat.";

      setBillingFeedback({
        tone: "warning",
        title: "Tagihan belum bisa dibuat",
        message,
      });
      window.alert(message);
    } finally {
      setIsCreatingPayment(false);
    }
  }

  async function handleCreateBillingSubmit(event: FormEvent<HTMLFormElement>) {
    if (createBillingMode === "massal") {
      await handleCreateBatchPaymentSession(event);
      return;
    }

    await handleCreatePaymentSession(event);
  }

  async function handleResendPaymentLink(payment: IncomingPaymentRecord) {
    setActivePaymentActionKey(`${payment.id}:resend`);

    try {
      const response = await resendAdminPaymentLink(payment.paymentId);

      setBillingFeedback({
        tone: "info",
        title: "Checkout link siap dikirim ulang",
        message: `Link pembayaran untuk ${payment.student.name} tetap memakai sesi yang sama. Admin bisa langsung membagikan ulang link checkout ke siswa.`,
        checkoutUrl: response.checkoutUrl,
        statusPagePath: buildPaymentStatusPagePath(response.paymentId),
      });
      window.alert("Checkout link berhasil dikirim ulang.");
      await refreshPaymentViews({
        includeStudents: false,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Checkout link belum bisa dikirim ulang.";

      setBillingFeedback({
        tone: "warning",
        title: "Kirim ulang link gagal",
        message,
      });
      window.alert(message);
      await refreshPaymentViews({
        includeStudents: false,
      });
    } finally {
      setActivePaymentActionKey(null);
    }
  }

  async function handleCancelPayment(payment: IncomingPaymentRecord) {
    const confirmed = window.confirm(
      `Batalkan tagihan ${payment.paymentId} untuk ${payment.student.name}? Status local akan menjadi expired dan sesi pending Xendit akan dicancel jika masih aktif.`,
    );

    if (!confirmed) {
      return;
    }

    setActivePaymentActionKey(`${payment.id}:cancel`);

    try {
      const response = await cancelAdminPayment(payment.paymentId);

      setBillingFeedback({
        tone: "warning",
        title: "Tagihan berhasil dibatalkan",
        message: `Payment ${response.paymentId} sudah diubah menjadi expired dengan alasan ${formatCancelReasonLabel(response.cancelReason)}.`,
      });
      window.alert("Tagihan berhasil dibatalkan.");
      await refreshPaymentViews({
        includeStudents: false,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Tagihan belum bisa dibatalkan.";

      setBillingFeedback({
        tone: "warning",
        title: "Pembatalan tagihan gagal",
        message,
      });
      window.alert(message);
      await refreshPaymentViews({
        includeStudents: false,
      });
    } finally {
      setActivePaymentActionKey(null);
    }
  }

  const incomingColumns: AdminColumnDefinition<IncomingPaymentRecord>[] = [
    {
      key: "number",
      header: "No",
      className: "w-16 text-center",
      cell: (_payment, index) => (
        <span className="text-sm font-semibold text-slate-500">
          {incomingPageStart + index}
        </span>
      ),
    },
    {
      key: "paymentId",
      header: "Payment ID",
      className: "min-w-[210px]",
      cell: (payment) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-950">{payment.paymentId}</p>
            <Badge variant={payment.source === "admin" ? "secondary" : "outline"}>
              {formatPaymentSourceLabel(payment.source)}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            {payment.subscription?.subscriptionCode
              ? `Subscription: ${payment.subscription.subscriptionCode}`
              : "Subscription code belum tersedia"}
          </p>
        </div>
      ),
    },
    {
      key: "student",
      header: "Siswa",
      className: "min-w-[250px]",
      cell: (payment) => {
        const anomalyReasons = getIncomingAnomalyReasons(payment);

        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{payment.student.name}</p>
              {anomalyReasons.length ? (
                <Badge variant="danger" className="px-2.5 py-1 text-[11px]">
                  Anomali data
                </Badge>
              ) : null}
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="size-3.5 text-slate-400" />
              {payment.student.email ?? "Email siswa tidak tersedia"}
            </p>
            <p className="text-xs text-slate-400">
              {payment.student.studentId ?? "-"} | {payment.student.program || "-"} |{" "}
              {payment.student.className || "-"}
            </p>
            {anomalyReasons.length ? (
              <p className="text-xs leading-5 text-rose-600">
                {anomalyReasons.join(" ")}
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "branch",
      header: "Cabang",
      className: "min-w-[140px]",
      cell: (payment) => (
        <span className="text-sm font-medium text-slate-700">
          {payment.student.branch}
        </span>
      ),
    },
    {
      key: "package",
      header: "Paket Membership",
      className: "min-w-[180px]",
      cell: (payment) => (
        <span className="text-sm leading-6 text-slate-700">{payment.packageName}</span>
      ),
    },
    {
      key: "amount",
      header: "Nominal",
      className: "min-w-[140px]",
      cell: (payment) => (
        <span className="text-sm font-semibold text-slate-900">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Provider / Method",
      className: "min-w-[180px]",
      cell: (payment) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">
            {formatPaymentMethodLabel(payment.method)}
          </p>
          <p className="text-xs text-slate-400">
            Provider: {formatProviderLabel(payment.provider)}
          </p>
          {payment.source === "admin" ? (
            <p className="text-xs text-slate-400">
              Resend: {payment.checkoutSendCount}x
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[120px]",
      cell: (payment) => (
        <AdminStatusBadge
          status={formatPaymentStatusLabel(payment.status)}
          tone={formatPaymentStatusTone(payment.status)}
          className="w-fit"
        />
      ),
    },
    {
      key: "date",
      header: "Tanggal Bayar / Dibuat",
      className: "min-w-[170px]",
      cell: (payment) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">
            {formatDateTimeLabel(getIncomingDisplayDate(payment))}
          </p>
          <p className="text-xs text-slate-400">
            {getIncomingDisplayDateLabel(payment)}
          </p>
        </div>
      ),
    },
    {
      key: "subscriptionCode",
      header: "Subscription Code",
      className: "min-w-[160px]",
      cell: (payment) => (
        <span className="text-sm text-slate-700">
          {payment.subscription?.subscriptionCode ?? "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "min-w-[280px] text-center",
      cell: (payment) => {
        const isResending =
          activePaymentActionKey === `${payment.id}:resend`;
        const isCanceling =
          activePaymentActionKey === `${payment.id}:cancel`;
        const isProcessing = isResending || isCanceling;

        return (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {payment.canResendLink ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isProcessing}
                onClick={() => {
                  void handleResendPaymentLink(payment);
                }}
              >
                {isResending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Kirim Ulang Link
              </Button>
            ) : null}
            {payment.canCancel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
                disabled={isProcessing}
                onClick={() => {
                  void handleCancelPayment(payment);
                }}
              >
                {isCanceling ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Ban className="size-4" />
                )}
                Batalkan Tagihan
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-600"
              onClick={() => {
                setSelectedIncomingPaymentId(payment.id);
              }}
            >
              <Eye className="size-4" />
              Detail
            </Button>
          </div>
        );
      },
    },
  ];

  const activationColumns: AdminColumnDefinition<ActivationRecord>[] = [
    {
      key: "number",
      header: "No",
      className: "w-16 text-center",
      cell: (_student, index) => (
        <span className="text-sm font-semibold text-slate-500">{index + 1}</span>
      ),
    },
    {
      key: "studentId",
      header: "Student ID",
      className: "min-w-[130px]",
      cell: (student) => (
        <span className="text-sm font-semibold text-slate-900">
          {student.studentId ?? "-"}
        </span>
      ),
    },
    {
      key: "student",
      header: "Siswa",
      className: "min-w-[250px]",
      cell: (student) => {
        const anomalyReasons = getActivationAnomalyReasons(student);

        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{student.studentName}</p>
              {anomalyReasons.length ? (
                <Badge variant="danger" className="px-2.5 py-1 text-[11px]">
                  Anomali data
                </Badge>
              ) : null}
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="size-3.5 text-slate-400" />
              {student.studentEmail ?? "Email siswa tidak tersedia"}
            </p>
            {anomalyReasons.length ? (
              <p className="text-xs leading-5 text-rose-600">
                {anomalyReasons.join(" ")}
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "branch",
      header: "Cabang",
      className: "min-w-[140px]",
      cell: (student) => (
        <span className="text-sm font-medium text-slate-700">{student.branch}</span>
      ),
    },
    {
      key: "level",
      header: "Jenjang",
      className: "min-w-[100px]",
      cell: (student) => (
        <span className="text-sm text-slate-700">{student.jenjang}</span>
      ),
    },
    {
      key: "class",
      header: "Kelas",
      className: "min-w-[120px]",
      cell: (student) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{student.kelas}</p>
          <p className="text-xs text-slate-400">{student.classLabel}</p>
        </div>
      ),
    },
    {
      key: "package",
      header: "Paket Membership",
      className: "min-w-[180px]",
      cell: (student) => (
        <span className="text-sm leading-6 text-slate-700">
          {student.membershipPackage}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Status Pembayaran",
      className: "min-w-[150px]",
      cell: (student) => (
        <AdminStatusBadge
          status={formatPaymentStatusLabel(student.paymentStatus)}
          tone={formatPaymentStatusTone(student.paymentStatus)}
          className="w-fit"
        />
      ),
    },
    {
      key: "activationStatus",
      header: "Status Aktivasi",
      className: "min-w-[160px]",
      cell: (student) => (
        <AdminStatusBadge
          status={student.activationStatus}
          tone={formatActivationStatusTone(student.activationStatus)}
          className="w-fit"
        />
      ),
    },
    {
      key: "registeredAt",
      header: "Registered At",
      className: "min-w-[170px]",
      cell: (student) => (
        <span className="text-sm text-slate-700">
          {formatDateTimeLabel(student.registeredAt)}
        </span>
      ),
    },
    {
      key: "activeUntil",
      header: "Active Until",
      className: "min-w-[170px]",
      cell: (student) => (
        <span className="text-sm text-slate-700">
          {formatDateTimeLabel(student.activeUntil)}
        </span>
      ),
    },
    {
      key: "paymentId",
      header: "Payment ID",
      className: "min-w-[150px]",
      cell: (student) => (
        <span className="text-sm text-slate-700">{student.paymentId ?? "-"}</span>
      ),
    },
    {
      key: "subscriptionCode",
      header: "Subscription Code",
      className: "min-w-[160px]",
      cell: (student) => (
        <span className="text-sm text-slate-700">{student.subscriptionCode}</span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "w-[96px] text-center",
      cell: (student) => (
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-600"
            onClick={() => {
              setSelectedActivationId(student.id);
            }}
          >
            <Eye className="size-4" />
            Detail
          </Button>
        </div>
      ),
    },
  ];

  function resetIncomingFilters() {
    setIncomingPage(1);
    setIncomingSearchQuery("");
    setIncomingStatusFilter(ALL_PAYMENT_STATUSES);
    setIncomingPackageFilter(ALL_PACKAGES);
    setIncomingBranchFilter(ALL_BRANCHES);
  }

  function resetActivationFilters() {
    setActivationSearchQuery("");
    setActivationPaymentStatusFilter(ALL_PAYMENT_STATUSES);
    setActivationPackageFilter(ALL_PACKAGES);
    setActivationBranchFilter(ALL_BRANCHES);
    setActivationStatusFilter(ALL_ACTIVATION_STATUSES);
    setLevelFilter(ALL_LEVELS);
    setClassFilter(ALL_CLASSES);
  }

  async function exportIncomingPaymentsCsv() {
    try {
      await exportAdminPaymentsCsv({
        q: incomingServerSearchQuery || undefined,
        status:
          incomingStatusFilter === ALL_PAYMENT_STATUSES
            ? undefined
            : incomingStatusFilter,
        package:
          incomingPackageFilter === ALL_PACKAGES
            ? undefined
            : incomingPackageFilter,
        branch:
          incomingBranchFilter === ALL_BRANCHES
            ? undefined
            : incomingBranchFilter,
      });
    } catch (error) {
      setPaymentsError(
        error instanceof Error
          ? error.message
          : "Gagal mengunduh export pembayaran masuk.",
      );
    }
  }

  async function exportActivationMembershipCsv() {
    try {
      await exportAdminPaymentActivationsCsv({
        q: activationServerSearchQuery || undefined,
        paymentStatus:
          activationPaymentStatusFilter === ALL_PAYMENT_STATUSES
            ? undefined
            : activationPaymentStatusFilter,
        activationStatus:
          activationStatusFilter === ALL_ACTIVATION_STATUSES
            ? undefined
            : activationStatusFilter,
        package:
          activationPackageFilter === ALL_PACKAGES
            ? undefined
            : activationPackageFilter,
        branch:
          activationBranchFilter === ALL_BRANCHES
            ? undefined
            : activationBranchFilter,
        level: levelFilter === ALL_LEVELS ? undefined : levelFilter,
        className: classFilter === ALL_CLASSES ? undefined : classFilter,
      });
    } catch (error) {
      setActivationsError(
        error instanceof Error
          ? error.message
          : "Gagal mengunduh export aktivasi membership.",
      );
    }
  }

  return (
    <>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile
            icon={CreditCard}
            label="Pembayaran Masuk"
            value={`${incomingOverview.totalCount}`}
            helper="Total transaksi yang cocok dengan filter payment aktif."
            tone="orange"
            accentLabel="Transaksi"
          />
          <SummaryTile
            icon={WalletCards}
            label="Nominal Lunas"
            value={formatCurrency(totalPaidAmount)}
            helper="Akumulasi transaksi paid pada halaman yang sedang tampil."
            tone="emerald"
            accentLabel="Lunas"
          />
          <SummaryTile
            icon={UsersRound}
            label="Membership Aktif"
            value={`${activeMembershipCount}`}
            helper="Siswa dengan membership aktif saat ini."
            tone="amber"
            accentLabel="Aktif"
          />
          <SummaryTile
            icon={AlertTriangle}
            label="Anomali Data"
            value={`${incomingAnomalyCount + activationAnomalyCount}`}
            helper="Data yang masih perlu dicek admin."
            tone="rose"
            accentLabel="Perlu cek"
          />
        </section>

        {billingFeedback ? (
          <BillingFeedbackBanner
            feedback={billingFeedback}
            onDismiss={() => {
              setBillingFeedback(null);
            }}
          />
        ) : null}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PaymentTab)}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="bg-slate-100/90">
              <TabsTrigger value="incoming">Pembayaran Masuk</TabsTrigger>
              <TabsTrigger value="activations">Aktivasi Membership</TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-2">
              {!studentBranchAvailable ? (
                <Badge variant="warning">
                  Sebagian cabang siswa belum tersedia di backend
                </Badge>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void refreshPaymentViews();
                }}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh data
              </Button>
            </div>
          </div>

          <TabsContent value="incoming" className="mt-6">
            <AdminSectionCard
              title="Pembayaran Masuk"
              description="Kelola tagihan membership Xendit untuk siswa existing sekaligus memonitor histori payment yang sudah tersimpan di backend."
              action={
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {incomingOverview.totalCount} transaksi tampil
                  </Badge>
                  <Badge variant="info">
                    {formatCurrency(incomingOverview.filteredAmount)}
                  </Badge>
                  <Badge variant="success">
                    {incomingOverview.paidCount} lunas
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="size-4" />
                    Buat Tagihan
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/75 p-4 shadow-[0_12px_22px_-24px_rgba(15,23,42,0.16)]">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:max-w-xl">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={incomingSearchQuery}
                        onChange={(event) =>
                          setIncomingSearchQuery(event.target.value)
                        }
                        placeholder="Cari nama siswa, payment ID, atau subscription code..."
                        className={cn("pl-10", warmFieldClassName)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={exportIncomingPaymentsCsv}
                        disabled={
                          paymentsLoading || filteredIncomingPayments.length === 0
                        }
                      >
                        <Download className="size-4" />
                        Export CSV Filter
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetIncomingFilters}
                      >
                        Reset filter
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <Select
                      value={incomingStatusFilter}
                      onValueChange={(value) =>
                        setIncomingStatusFilter(
                          value as (typeof paymentStatusOptions)[number],
                        )
                      }
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {paymentStatusOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option === ALL_PAYMENT_STATUSES
                              ? option
                              : formatPaymentStatusLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={incomingPackageFilter}
                      onValueChange={setIncomingPackageFilter}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter paket" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {incomingPackageOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className={warmSelectItemClassName}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={incomingBranchFilter}
                      onValueChange={setIncomingBranchFilter}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter cabang" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {incomingBranchOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentsError ? (
                  <ErrorPanel
                    message={paymentsError}
                    onRetry={() => {
                      void refreshPaymentViews({
                        includeStudents: false,
                      });
                    }}
                  />
                ) : paymentsLoading ? (
                  <LoadingPanel title="Memuat pembayaran masuk" />
                ) : (
                  <>
                    <AnomalyBanner
                      count={incomingAnomalyCount}
                      message="Sebagian transaksi memiliki relasi user, student, atau metadata checkout yang belum lengkap. Data tetap ditampilkan agar admin bisa memonitor anomali tanpa mengubah histori payment."
                    />

                    <AdminDataTable
                      columns={incomingColumns}
                      data={filteredIncomingPayments}
                      keyExtractor={(payment) => payment.id}
                      minWidthClassName="min-w-[1760px]"
                      emptyTitle="Belum ada pembayaran masuk"
                      emptyDescription="Belum ada payment membership yang tercatat di endpoint admin atau semua data tersaring oleh filter aktif."
                      getRowClassName={(payment) =>
                        getIncomingAnomalyReasons(payment).length
                          ? "bg-rose-50/30"
                          : undefined
                      }
                    />

                    <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_12px_22px_-26px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-800">
                          Halaman {incomingPage} dari {incomingTotalPages}
                        </p>
                        <p className="text-xs text-slate-500">
                          Menampilkan {filteredIncomingPayments.length} transaksi
                          pada halaman ini.
                          {incomingTotalItems > 0 && incomingPageEnd > 0
                            ? ` Rentang data ${incomingPageStart}-${incomingPageEnd} dari total ${incomingTotalItems} transaksi.`
                            : incomingTotalItems > 0
                              ? ` Total ada ${incomingTotalItems} transaksi, tetapi belum ada yang lolos filter tambahan pada halaman ini.`
                              : " Belum ada transaksi yang cocok dengan filter aktif."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setIncomingPage((currentPage) =>
                              Math.max(1, currentPage - 1),
                            )
                          }
                          disabled={paymentsLoading || incomingPage <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setIncomingPage((currentPage) =>
                              Math.min(incomingTotalPages, currentPage + 1),
                            )
                          }
                          disabled={
                            paymentsLoading || incomingPage >= incomingTotalPages
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AdminSectionCard>
          </TabsContent>

          <TabsContent value="activations" className="mt-6">
            <AdminSectionCard
              title="Aktivasi Membership"
              description="Pantau status aktivasi siswa berdasarkan subscription terbaru dan status pembayaran yang tersedia."
              action={
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {activationOverview.totalCount} siswa tampil
                  </Badge>
                  <Badge variant="success">
                    {activationOverview.activeCount} aktif
                  </Badge>
                  <Badge variant="warning">
                    {activationOverview.pendingCount} menunggu pembayaran
                  </Badge>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/75 p-4 shadow-[0_12px_22px_-24px_rgba(15,23,42,0.16)]">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:max-w-xl">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={activationSearchQuery}
                        onChange={(event) =>
                          setActivationSearchQuery(event.target.value)
                        }
                        placeholder="Cari nama siswa, student ID, payment ID, atau subscription code..."
                        className={cn("pl-10", warmFieldClassName)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={exportActivationMembershipCsv}
                        disabled={
                          activationsLoading ||
                          filteredActivationStudents.length === 0
                        }
                      >
                        <Download className="size-4" />
                        Export CSV
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetActivationFilters}
                      >
                        Reset filter
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <Select
                      value={activationPaymentStatusFilter}
                      onValueChange={(value) =>
                        setActivationPaymentStatusFilter(
                          value as (typeof paymentStatusOptions)[number],
                        )
                      }
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Status pembayaran" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {paymentStatusOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option === ALL_PAYMENT_STATUSES
                              ? option
                              : formatPaymentStatusLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={activationStatusFilter}
                      onValueChange={(value) =>
                        setActivationStatusFilter(
                          value as (typeof activationStatusOptions)[number],
                        )
                      }
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Status aktivasi" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {activationStatusOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={activationPackageFilter}
                      onValueChange={setActivationPackageFilter}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter paket" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {activationPackageOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className={warmSelectItemClassName}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={activationBranchFilter}
                      onValueChange={setActivationBranchFilter}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter cabang" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {activationBranchOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={levelFilter}
                      onValueChange={(value) => {
                        setLevelFilter(value as LevelFilterOption);
                        setClassFilter(ALL_CLASSES);
                      }}
                    >
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter jenjang" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {levelFilterOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className={warmSelectTriggerClassName}>
                        <SelectValue placeholder="Filter kelas" />
                      </SelectTrigger>
                      <SelectContent className={warmSelectContentClassName}>
                        {activationClassOptions.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className={warmSelectItemClassName}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {activationsError ? (
                  <ErrorPanel
                    message={activationsError}
                    onRetry={() => {
                      void refreshPaymentViews({
                        includeStudents: false,
                      });
                    }}
                  />
                ) : activationsLoading ? (
                  <LoadingPanel title="Memuat aktivasi membership" />
                ) : (
                  <>
                    <AnomalyBanner
                      count={activationAnomalyCount}
                      message="Sebagian aktivasi memiliki relasi user atau payment reference yang belum lengkap. Kondisi ini ikut terbaca dari data existing agar admin bisa memonitor tanpa menyembunyikan anomali."
                    />

                    <AdminDataTable
                      columns={activationColumns}
                      data={filteredActivationStudents}
                      keyExtractor={(student) => student.id}
                      minWidthClassName="min-w-[1880px]"
                      emptyTitle="Belum ada data aktivasi membership"
                      emptyDescription="Belum ada subscription siswa yang bisa ditampilkan atau semua data tersaring oleh filter."
                      getRowClassName={(student) =>
                        getActivationAnomalyReasons(student).length
                          ? "bg-rose-50/30"
                          : undefined
                      }
                    />
                    <div className="mt-4">
                      <AdminPaginationFooter
                        page={activationPage}
                        totalPages={activationTotalPages}
                        totalItems={activationTotalItems}
                        visibleCount={filteredActivationStudents.length}
                        limit={activationPageLimit}
                        isLoading={activationsLoading}
                        label="aktivasi"
                        onPrevious={() => {
                          setActivationPage((currentPage) =>
                            Math.max(1, currentPage - 1),
                          );
                        }}
                        onNext={() => {
                          setActivationPage((currentPage) =>
                            Math.min(activationTotalPages, currentPage + 1),
                          );
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </AdminSectionCard>
          </TabsContent>
        </Tabs>
      </div>

      <CreateMembershipBillingDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);

          if (!open) {
            resetCreateDialogState();
          }
        }}
        students={students}
        studentsLoading={studentsLoading}
        studentsError={studentsError}
        createMode={createBillingMode}
        levelOptions={billingLevelOptions}
        batchLevel={batchLevel}
        batchClassOptions={batchClassOptionsByLevel[batchLevel] ?? []}
        batchClassOption={batchClassOption}
        branchOptions={batchBranchOptions}
        batchBranchFilter={batchBranchFilter}
        billingPackages={billingPackages}
        batchPackageMode={batchPackageMode}
        batchPackageKey={batchPackageKey}
        batchIncludeInactive={batchIncludeInactive}
        batchResult={batchResult}
        batchError={batchError}
        studentSearchQuery={studentSearchQuery}
        selectedStudentId={selectedStudentId}
        selectedPackageKey={selectedPackageKey}
        expiresAtValue={expiresAtValue}
        isSubmitting={isCreatingPayment}
        onCreateModeChange={handleCreateModeChange}
        onBatchLevelChange={handleBatchLevelChange}
        onBatchClassOptionChange={handleBatchClassOptionChange}
        onBatchBranchFilterChange={handleBatchBranchFilterChange}
        onBatchPackageModeChange={handleBatchPackageModeChange}
        onBatchPackageKeyChange={handleBatchPackageKeyChange}
        onBatchIncludeInactiveChange={handleBatchIncludeInactiveChange}
        onStudentSearchQueryChange={setStudentSearchQuery}
        onStudentIdChange={setSelectedStudentId}
        onPackageKeyChange={setSelectedPackageKey}
        onExpiresAtChange={handleExpiresAtValueChange}
        onSubmit={(event) => {
          void handleCreateBillingSubmit(event);
        }}
      />

      <IncomingPaymentDetailDialog
        record={selectedIncomingPayment}
        open={selectedIncomingPayment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIncomingPaymentId(null);
          }
        }}
      />

      <ActivationDetailDialog
        record={selectedActivationStudent}
        open={selectedActivationStudent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedActivationId(null);
          }
        }}
      />
    </>
  );
}
