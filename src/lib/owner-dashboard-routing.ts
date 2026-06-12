export type SearchParamValue = string | string[] | undefined;
export type SearchParamRecord = Record<string, SearchParamValue>;

export type OwnerNotificationKey =
  | "membership_payments_pending"
  | "membership_payments_failed_or_expired"
  | "student_activations_inactive"
  | "expenses_pending"
  | "expenses_scheduled"
  | "branches_attention";

export type OwnerActivitiesRouteState = {
  tab: "masuk" | "keluar" | "aktivasi";
  incomingStatus: "all" | "paid" | "pending" | "failed" | "expired" | "failed-expired";
  outgoingStatus: "all" | "menunggu" | "dijadwalkan" | "selesai" | "dibatalkan";
  activationStatus: "all" | "active" | "pending" | "expired" | "failed" | "inactive";
};

export type OwnerBranchesRouteState = {
  status: "all" | "active" | "preparation" | "inactive" | "attention";
};

export const defaultOwnerActivitiesRouteState: OwnerActivitiesRouteState = {
  tab: "masuk",
  incomingStatus: "all",
  outgoingStatus: "all",
  activationStatus: "all",
};

export const defaultOwnerBranchesRouteState: OwnerBranchesRouteState = {
  status: "all",
};

function readSingleSearchParamValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeSearchParamValue(value: SearchParamValue) {
  return readSingleSearchParamValue(value).trim().toLowerCase();
}

export function resolveOwnerNotificationHref(key: string) {
  switch (key as OwnerNotificationKey) {
    case "membership_payments_pending":
      return "/dashboard-owner/aktivitas?tab=masuk&incomingStatus=pending";
    case "membership_payments_failed_or_expired":
      return "/dashboard-owner/aktivitas?tab=masuk&incomingStatus=failed-expired";
    case "student_activations_inactive":
      return "/dashboard-owner/aktivitas?tab=aktivasi&activationStatus=inactive";
    case "expenses_pending":
      return "/dashboard-owner/pengeluaran";
    case "expenses_scheduled":
      return "/dashboard-owner/pengeluaran";
    case "branches_attention":
      return "/dashboard-owner/cabang?status=attention";
    default:
      return "/dashboard-owner";
  }
}

export function resolveOwnerActivitiesRouteState(
  searchParams: SearchParamRecord,
): OwnerActivitiesRouteState {
  const rawTab = normalizeSearchParamValue(searchParams.tab);
  const rawIncomingStatus = normalizeSearchParamValue(searchParams.incomingStatus);
  const rawOutgoingStatus = normalizeSearchParamValue(searchParams.outgoingStatus);
  const rawActivationStatus = normalizeSearchParamValue(searchParams.activationStatus);

  return {
    tab:
      rawTab === "keluar" || rawTab === "aktivasi"
        ? rawTab
        : defaultOwnerActivitiesRouteState.tab,
    incomingStatus:
      rawIncomingStatus === "paid" ||
      rawIncomingStatus === "pending" ||
      rawIncomingStatus === "failed" ||
      rawIncomingStatus === "expired" ||
      rawIncomingStatus === "failed-expired"
        ? rawIncomingStatus
        : defaultOwnerActivitiesRouteState.incomingStatus,
    outgoingStatus:
      rawOutgoingStatus === "menunggu" ||
      rawOutgoingStatus === "dijadwalkan" ||
      rawOutgoingStatus === "selesai" ||
      rawOutgoingStatus === "dibatalkan"
        ? rawOutgoingStatus
        : defaultOwnerActivitiesRouteState.outgoingStatus,
    activationStatus:
      rawActivationStatus === "active" ||
      rawActivationStatus === "pending" ||
      rawActivationStatus === "expired" ||
      rawActivationStatus === "failed" ||
      rawActivationStatus === "inactive"
        ? rawActivationStatus
        : defaultOwnerActivitiesRouteState.activationStatus,
  };
}

export function resolveOwnerBranchesRouteState(
  searchParams: SearchParamRecord,
): OwnerBranchesRouteState {
  const rawStatus = normalizeSearchParamValue(searchParams.status);

  return {
    status:
      rawStatus === "active" ||
      rawStatus === "preparation" ||
      rawStatus === "inactive" ||
      rawStatus === "attention"
        ? rawStatus
        : defaultOwnerBranchesRouteState.status,
  };
}
