import type {
  OwnerActivityActivationStatus,
  OwnerActivityIncomingPayment,
  OwnerActivityOutgoingPayment,
  OwnerActivityStudentActivation,
} from "@/lib/owner-activities";

export type PaymentTab = "masuk" | "aktivasi";

export type IncomingPaymentStatus = OwnerActivityIncomingPayment["status"];
export const combinedIncomingPaymentStatusFilter = "Gagal / Expired" as const;
export type IncomingPaymentStatusFilter =
  | "Semua"
  | IncomingPaymentStatus
  | typeof combinedIncomingPaymentStatusFilter;

export type OutgoingPaymentStatus = OwnerActivityOutgoingPayment["status"];
export type OutgoingPaymentStatusFilter = "Semua" | OutgoingPaymentStatus;

export type MembershipPaymentStatus = OwnerActivityStudentActivation["paymentStatus"];
export type MembershipActivationStatus = OwnerActivityActivationStatus;
export const inactiveActivationStatusFilter = "Belum Aktif" as const;
export type MembershipActivationFilter =
  | "Semua"
  | MembershipActivationStatus
  | typeof inactiveActivationStatusFilter;

export type StudentLevel = "SD" | "SMP" | "SMA" | "-";
export type StudentClass = string;
export type StudentLevelFilter = "Semua" | "SD" | "SMP" | "SMA";
export type StudentClassFilter = "Semua" | StudentClass;

export const allBranchFilter = "Semua Cabang" as const;
export type BranchFilter = typeof allBranchFilter | string;
export type SurfaceTone = "orange" | "sky" | "emerald";

export type OwnerIncomingPaymentRecord = OwnerActivityIncomingPayment;
export type OwnerOutgoingPaymentRecord = OwnerActivityOutgoingPayment;
export type OwnerStudentActivationRecord = OwnerActivityStudentActivation;

export type ActivitySectionMetric = {
  tone: SurfaceTone;
  label: string;
  value: string;
  hint: string;
};

export type OwnerActivityFinancialSummary = {
  incomingValidated: number;
  incomingPending: number;
};

export type OwnerActivityIncomingOverview = {
  totalCount: number;
  filteredAmount: number;
  paidCount: number;
  pendingCount: number;
};

export type OwnerActivityOutgoingOverview = {
  totalCount: number;
  filteredAmount: number;
  scheduledCount: number;
  completedCount: number;
};

export type OwnerActivityActivationOverview = {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  expiredCount: number;
  failedCount: number;
};
