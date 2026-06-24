import { requestAdminApi } from "@/lib/admin-api";
import type { PaymentStatus } from "@/lib/subscription";

export type OwnerActivityPaymentSource = "register_online" | "admin";
export type OwnerActivityPaymentCancelReason =
  | "admin_cancelled"
  | "replaced_by_new_session"
  | "provider_canceled";

export type OwnerActivityActivationStatus =
  | "Aktif"
  | "Menunggu Pembayaran"
  | "Expired"
  | "Pembayaran Gagal";

export type OwnerActivityIncomingPayment = {
  id: string;
  paymentId: string | null;
  studentName: string;
  studentEmail: string | null;
  branch: string;
  packageName: string;
  amount: number;
  provider: string;
  method: string;
  status: PaymentStatus;
  paidAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptionCode: string | null;
};

export type OwnerActivityStudentActivation = {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string | null;
  branch: string;
  packageKey: string | null;
  jenjang: "SD" | "SMP" | "SMA" | "-";
  kelas: string;
  classLabel: string;
  membershipPackage: string;
  durationMonth: number | null;
  paymentStatus: PaymentStatus;
  activationStatus: OwnerActivityActivationStatus;
  registeredAt: string;
  activeUntil: string | null;
  paymentId: string | null;
  paymentSource?: OwnerActivityPaymentSource | null;
  paymentAmount?: number | null;
  paymentProvider?: string | null;
  paymentMethod?: string | null;
  paymentCheckoutUrl?: string | null;
  paymentExpiresAt?: string | null;
  paymentPaidAt?: string | null;
  paymentCreatedAt?: string | null;
  paymentUpdatedAt?: string | null;
  paymentCheckoutLastSentAt?: string | null;
  paymentCheckoutSendCount?: number;
  paymentCancelReason?: OwnerActivityPaymentCancelReason | null;
  paymentCanceledAt?: string | null;
  paymentCanResendLink?: boolean;
  paymentCanCancel?: boolean;
  subscriptionCode: string;
};

export type OwnerActivityOutgoingPayment = {
  id: string;
  referenceId: string;
  title: string;
  branch: string;
  category: string;
  vendor: string;
  amount: number;
  status: "Menunggu" | "Dijadwalkan" | "Selesai" | "Dibatalkan";
  paymentMethod: string;
  disbursedAt: string | null;
  dueDate: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type OwnerActivitiesData = {
  incomingPayments: OwnerActivityIncomingPayment[];
  outgoingPayments: OwnerActivityOutgoingPayment[];
  activationStudents: OwnerActivityStudentActivation[];
  outgoingPaymentsAvailable: boolean;
  studentBranchAvailable: boolean;
};

type OwnerActivitiesApiPayload = {
  incomingPayments?: OwnerActivityIncomingPayment[];
  outgoingPayments?: OwnerActivityOutgoingPayment[];
  activationStudents?: OwnerActivityStudentActivation[];
  outgoingPaymentsAvailable?: boolean;
  studentBranchAvailable?: boolean;
};

type OwnerActivityBranchApiItem = {
  name?: string | null;
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export async function fetchOwnerActivities() {
  const payload = await requestAdminApi<OwnerActivitiesApiPayload>(
    "/api/payments/owner-activities",
    {
      method: "GET",
    },
  );

  return {
    incomingPayments: Array.isArray(payload.data?.incomingPayments)
      ? payload.data.incomingPayments
      : [],
    outgoingPayments: Array.isArray(payload.data?.outgoingPayments)
      ? payload.data.outgoingPayments
      : [],
    activationStudents: Array.isArray(payload.data?.activationStudents)
      ? payload.data.activationStudents
      : [],
    outgoingPaymentsAvailable: payload.data?.outgoingPaymentsAvailable === true,
    studentBranchAvailable: payload.data?.studentBranchAvailable === true,
  } satisfies OwnerActivitiesData;
}

export async function fetchOwnerActivityBranchOptions() {
  const payload = await requestAdminApi<{ branches?: OwnerActivityBranchApiItem[] }>(
    "/api/branches",
    {
      method: "GET",
    },
  );

  const branchNames = Array.isArray(payload.data?.branches)
    ? payload.data.branches
        .map((branch) => normalizeText(branch.name))
        .filter(Boolean)
    : [];

  return Array.from(new Set(branchNames)).sort((first, second) =>
    first.localeCompare(second, "id-ID"),
  );
}
