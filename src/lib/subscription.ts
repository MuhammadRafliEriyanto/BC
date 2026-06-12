import type { ApiErrorDetails, ApiResponse } from "@/lib/auth";

export const ONLINE_PACKAGES = [
  {
    packageKey: "1-bulan",
    packageName: "1 Bulan",
    durationMonth: 1,
    amount: 350_000,
    highlight: "Cocok untuk eksplorasi awal dan adaptasi belajar.",
  },
  {
    packageKey: "3-bulan",
    packageName: "3 Bulan",
    durationMonth: 3,
    amount: 975_000,
    highlight: "Pilihan paling seimbang untuk progres rutin tiap minggu.",
  },
  {
    packageKey: "6-bulan",
    packageName: "6 Bulan",
    durationMonth: 6,
    amount: 1_850_000,
    highlight: "Komitmen jangka menengah dengan durasi aktif paling panjang.",
  },
  {
    packageKey: "12-bulan",
    packageName: "1 Tahun",
    durationMonth: 12,
    amount: 3_700_000,
    highlight: "Pilihan tahunan untuk progres belajar yang ingin dijaga penuh sepanjang tahun.",
  },
] as const;

const LEGACY_ONLINE_PACKAGES = [
  {
    packageKey: "2-bulan",
    packageName: "2 Bulan",
    durationMonth: 2,
    amount: 650_000,
    highlight: "Paket legacy untuk data lama yang masih tersimpan di sistem.",
  },
] as const;

const ALL_ONLINE_PACKAGES = [...ONLINE_PACKAGES, ...LEGACY_ONLINE_PACKAGES] as const;

export const PROGRAM_OPTIONS = [
  { value: "SD", label: "SD / Program Dasar" },
  { value: "SMP", label: "SMP / Program Reguler" },
  { value: "SMA", label: "SMA / Program Intensif" },
] as const;

export const CLASS_OPTIONS_BY_PROGRAM = {
  SD: ["Kelas 4", "Kelas 5", "Kelas 6"],
  SMP: ["Kelas 7", "Kelas 8", "Kelas 9"],
  SMA: ["Kelas 10", "Kelas 11", "Kelas 12"],
} as const;

export type OnlinePackageKey = (typeof ONLINE_PACKAGES)[number]["packageKey"];
export type ProgramOptionValue = (typeof PROGRAM_OPTIONS)[number]["value"];
export type SubscriptionStatus = "pending" | "active" | "expired";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type MembershipAccessStatus =
  | "active"
  | "pending"
  | "expired"
  | "not_registered";

export type RegisterOnlinePayload = {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  branch: string;
  program: ProgramOptionValue;
  classLevel: string;
  packageKey: OnlinePackageKey;
};

export type RegisterBranchOption = {
  id: string;
  name: string;
  shortAddress: string;
  fullAddress: string;
};

export type MembershipStudent = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  program: string;
  className: string;
  status: string;
  isEmailVerified: boolean;
};

export type MembershipSubscription = {
  id: string;
  subscriptionCode: string;
  userId: string;
  studentId: string;
  packageKey: string;
  packageName: string;
  durationMonth: number;
  startDate: string | null;
  endDate: string | null;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type MembershipPayment = {
  id: string;
  paymentId: string;
  userId: string;
  studentId: string;
  subscriptionId: string;
  packageKey?: string | null;
  packageName: string;
  durationMonth?: number | null;
  amount: number;
  provider?: string;
  method: string;
  status: PaymentStatus;
  paidAt: string | null;
  checkoutUrl?: string | null;
  expiresAt?: string | null;
  xenditPaymentSessionId?: string | null;
  xenditPaymentRequestId?: string | null;
  xenditPaymentId?: string | null;
  xenditCustomerId?: string | null;
  xenditSessionStatus?: string | null;
  xenditWebhookReceivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MembershipPaymentHistoryItem = {
  paymentId: string;
  packageName: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  method: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  subscriptionCode: string | null;
};

export type RegisterOnlineData = {
  user: {
    _id: string;
    nama: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
  student: MembershipStudent;
  subscription: MembershipSubscription;
  payment: MembershipPayment;
  verificationEmailSent: boolean;
  statusPagePath: string;
};

export type MembershipStatusData = {
  user: {
    _id: string;
    nama: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
  student: MembershipStudent | null;
  subscription: MembershipSubscription | null;
  payment: MembershipPayment | null;
  accessStatus: MembershipAccessStatus;
  hasActiveSubscription: boolean;
  daysRemaining: number | null;
};

export type MembershipPaymentHistoryData = {
  payments: MembershipPaymentHistoryItem[];
};

export type PaymentStatusData = {
  student: MembershipStudent;
  subscription: MembershipSubscription;
  payment: MembershipPayment;
  accessStatus: MembershipAccessStatus;
};

export type RegisterOnlineResponse = ApiResponse<RegisterOnlineData>;
export type MembershipStatusResponse = ApiResponse<MembershipStatusData>;
export type MembershipPaymentHistoryResponse = ApiResponse<MembershipPaymentHistoryData>;
export type PaymentStatusResponse = ApiResponse<PaymentStatusData>;
export type RegisterBranchOptionsResponse = ApiResponse<{
  branches: RegisterBranchOption[];
}>;

export class MembershipRequestError extends Error {
  status: number;
  errorCode?: string;
  errors?: ApiErrorDetails;

  constructor(message: string, status: number, errors?: ApiErrorDetails, errorCode?: string) {
    super(message);
    this.name = "MembershipRequestError";
    this.status = status;
    this.errors = errors;
    this.errorCode = errorCode;
  }
}

async function requestMembershipJson<T extends Record<string, unknown>>(
  url: string,
  init: RequestInit,
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new MembershipRequestError(
      payload?.message || "Terjadi kesalahan saat memproses membership.",
      response.status,
      payload?.errors,
      payload?.errorCode,
    );
  }

  return payload;
}

function normalizePackageLookupValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function findPackageByKey(packageKey: string | null | undefined) {
  const normalizedPackageKey = normalizePackageLookupValue(packageKey);

  if (!normalizedPackageKey) {
    return null;
  }

  return (
    ALL_ONLINE_PACKAGES.find(
      (item) => normalizePackageLookupValue(item.packageKey) === normalizedPackageKey,
    ) ?? null
  );
}

export function findPackageByName(packageName: string | null | undefined) {
  const normalizedPackageName = normalizePackageLookupValue(packageName);

  if (!normalizedPackageName) {
    return null;
  }

  return (
    ALL_ONLINE_PACKAGES.find(
      (item) => normalizePackageLookupValue(item.packageName) === normalizedPackageName,
    ) ?? null
  );
}

export function getPackageByKey(packageKey: string | null | undefined) {
  return findPackageByKey(packageKey) ?? ONLINE_PACKAGES[0];
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateLabel(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const membershipService = {
  register(payload: RegisterOnlinePayload) {
    return requestMembershipJson<RegisterOnlineData>("/api/register-online", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getPaymentStatus(paymentId: string) {
    const params = new URLSearchParams({ paymentId });

    return requestMembershipJson<PaymentStatusData>(
      `/api/register-online/payment?${params.toString()}`,
      {
        method: "GET",
      },
    );
  },
  confirmPayment(paymentId: string) {
    return requestMembershipJson<PaymentStatusData>(
      "/api/register-online/payment/confirm",
      {
        method: "POST",
        body: JSON.stringify({
          paymentId,
          method: "manual_confirmation",
        }),
      },
    );
  },
  getMySubscription() {
    return requestMembershipJson<MembershipStatusData>("/api/subscriptions/me", {
      method: "GET",
    });
  },
  getMyPaymentHistory() {
    return requestMembershipJson<MembershipPaymentHistoryData>(
      "/api/subscriptions/me/payments",
      {
        method: "GET",
      },
    );
  },
  getRegisterBranchOptions() {
    return requestMembershipJson<{
      branches: RegisterBranchOption[];
    }>("/api/branches/public-options", {
      method: "GET",
    });
  },
};
