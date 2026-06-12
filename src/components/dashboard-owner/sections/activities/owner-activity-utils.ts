import type { BadgeProps } from "@/components/ui/badge";
import type { OwnerActivitiesRouteState } from "@/lib/owner-dashboard-routing";

import type {
  BranchFilter,
  IncomingPaymentStatusFilter,
  MembershipActivationFilter,
  OutgoingPaymentStatusFilter,
  StudentClass,
  StudentLevel,
  StudentLevelFilter,
  SurfaceTone,
} from "./owner-activity-types";
import {
  combinedIncomingPaymentStatusFilter,
  inactiveActivationStatusFilter,
  allBranchFilter,
} from "./owner-activity-types";

export const incomingStatusOptions = [
  "Semua",
  "paid",
  "pending",
  combinedIncomingPaymentStatusFilter,
  "failed",
  "expired",
] as const satisfies readonly IncomingPaymentStatusFilter[];

export const outgoingStatusOptions = [
  "Semua",
  "Menunggu",
  "Dijadwalkan",
  "Selesai",
  "Dibatalkan",
] as const satisfies readonly OutgoingPaymentStatusFilter[];

export const activationFilterOptions = [
  "Semua",
  "Aktif",
  inactiveActivationStatusFilter,
  "Menunggu Pembayaran",
  "Expired",
  "Pembayaran Gagal",
] as const satisfies readonly MembershipActivationFilter[];

export const levelFilterOptions = [
  "Semua",
  "SD",
  "SMP",
  "SMA",
] as const satisfies readonly StudentLevelFilter[];

export const classOptionsByLevel = {
  SD: ["4", "5", "6"],
  SMP: ["7", "8", "9"],
  SMA: ["10", "11", "12"],
} as const satisfies Record<Exclude<StudentLevel, "-">, readonly StudentClass[]>;

export const allClassOptions = [
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const satisfies readonly StudentClass[];

type ActivityStatusMeta = {
  badgeVariant: BadgeProps["variant"];
  label: string;
};

export const incomingStatusMeta = {
  paid: {
    badgeVariant: "success",
    label: "Lunas",
  },
  pending: {
    badgeVariant: "warning",
    label: "Pending",
  },
  failed: {
    badgeVariant: "danger",
    label: "Gagal",
  },
  expired: {
    badgeVariant: "danger",
    label: "Expired",
  },
} as const satisfies Record<Exclude<IncomingPaymentStatusFilter, "Semua" | typeof combinedIncomingPaymentStatusFilter>, ActivityStatusMeta>;

export const outgoingStatusMeta = {
  Menunggu: {
    badgeVariant: "warning",
    label: "Menunggu",
  },
  Dijadwalkan: {
    badgeVariant: "secondary",
    label: "Dijadwalkan",
  },
  Selesai: {
    badgeVariant: "success",
    label: "Selesai",
  },
  Dibatalkan: {
    badgeVariant: "danger",
    label: "Dibatalkan",
  },
} as const satisfies Record<Exclude<OutgoingPaymentStatusFilter, "Semua">, ActivityStatusMeta>;

export const paymentStatusMeta = {
  paid: {
    badgeVariant: "success",
    label: "Lunas",
  },
  pending: {
    badgeVariant: "warning",
    label: "Pending",
  },
  failed: {
    badgeVariant: "danger",
    label: "Gagal",
  },
  expired: {
    badgeVariant: "danger",
    label: "Expired",
  },
} as const;

export const activationStatusMeta = {
  Aktif: {
    badgeVariant: "success",
    label: "Aktif",
  },
  "Menunggu Pembayaran": {
    badgeVariant: "warning",
    label: "Menunggu Pembayaran",
  },
  Expired: {
    badgeVariant: "danger",
    label: "Expired",
  },
  "Pembayaran Gagal": {
    badgeVariant: "danger",
    label: "Pembayaran Gagal",
  },
} as const;

export const surfaceToneStyles: Record<
  SurfaceTone,
  {
    shell: string;
    accentText: string;
    badge: string;
    orbPrimary: string;
    orbSecondary: string;
    toolbar: string;
    metric: string;
    iconWrap: string;
    icon: string;
    dot: string;
    table: string;
    empty: string;
  }
> = {
  orange: {
    shell: "border-slate-200/80 bg-white",
    accentText: "text-orange-600",
    badge: "border-orange-100 bg-orange-50 text-orange-700",
    orbPrimary: "bg-transparent",
    orbSecondary: "bg-transparent",
    toolbar: "border-slate-200/80 bg-slate-50/70",
    metric: "border-slate-200/80 bg-white",
    iconWrap: "bg-orange-50 text-orange-600",
    icon: "text-orange-500",
    dot: "bg-orange-500",
    table: "border-slate-200/80 bg-white",
    empty: "bg-orange-50 text-orange-600",
  },
  sky: {
    shell: "border-slate-200/80 bg-white",
    accentText: "text-sky-600",
    badge: "border-sky-100 bg-sky-50 text-sky-700",
    orbPrimary: "bg-transparent",
    orbSecondary: "bg-transparent",
    toolbar: "border-slate-200/80 bg-slate-50/70",
    metric: "border-slate-200/80 bg-white",
    iconWrap: "bg-sky-50 text-sky-600",
    icon: "text-sky-500",
    dot: "bg-sky-500",
    table: "border-slate-200/80 bg-white",
    empty: "bg-sky-50 text-sky-600",
  },
  emerald: {
    shell: "border-slate-200/80 bg-white",
    accentText: "text-emerald-600",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    orbPrimary: "bg-transparent",
    orbSecondary: "bg-transparent",
    toolbar: "border-slate-200/80 bg-slate-50/70",
    metric: "border-slate-200/80 bg-white",
    iconWrap: "bg-emerald-50 text-emerald-600",
    icon: "text-emerald-500",
    dot: "bg-emerald-500",
    table: "border-slate-200/80 bg-white",
    empty: "bg-emerald-50 text-emerald-600",
  },
};

export function mapRouteIncomingStatusToFilter(
  status: OwnerActivitiesRouteState["incomingStatus"],
): IncomingPaymentStatusFilter {
  switch (status) {
    case "paid":
      return "paid";
    case "pending":
      return "pending";
    case "failed":
      return "failed";
    case "expired":
      return "expired";
    case "failed-expired":
      return combinedIncomingPaymentStatusFilter;
    default:
      return "Semua";
  }
}

export function mapRouteOutgoingStatusToFilter(
  status: OwnerActivitiesRouteState["outgoingStatus"],
): OutgoingPaymentStatusFilter {
  switch (status) {
    case "menunggu":
      return "Menunggu";
    case "dijadwalkan":
      return "Dijadwalkan";
    case "selesai":
      return "Selesai";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return "Semua";
  }
}

export function mapRouteActivationStatusToFilter(
  status: OwnerActivitiesRouteState["activationStatus"],
): MembershipActivationFilter {
  switch (status) {
    case "active":
      return "Aktif";
    case "pending":
      return "Menunggu Pembayaran";
    case "expired":
      return "Expired";
    case "failed":
      return "Pembayaran Gagal";
    case "inactive":
      return inactiveActivationStatusFilter;
    default:
      return "Semua";
  }
}

export function getIncomingStatusFilterLabel(value: IncomingPaymentStatusFilter) {
  if (value === "Semua" || value === combinedIncomingPaymentStatusFilter) {
    return value;
  }

  return incomingStatusMeta[value].label;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatLongDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function triggerDownload(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function createExportFileName(
  prefix: "pembayaran-masuk" | "pembayaran-keluar" | "aktivasi-siswa",
  extension: "csv" | "json",
) {
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");

  return `owner-${prefix}-${stamp}.${extension}`;
}

export function formatPaymentMethodLabel(value: string) {
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

export function getBranchFilterOptions(items: Array<{ branch: string }>): BranchFilter[] {
  const branches = Array.from(
    new Set(items.map((item) => item.branch.trim()).filter(Boolean)),
  );

  return [allBranchFilter, ...branches];
}

export {
  allBranchFilter,
  combinedIncomingPaymentStatusFilter,
  inactiveActivationStatusFilter,
};
