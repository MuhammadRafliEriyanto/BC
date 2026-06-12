"use client";

import { publishOwnerDashboardRefresh } from "@/components/dashboard-owner/dashboard-refresh-events";

const ownerBranchesChangedEventName = "owner-dashboard:branches-changed";

export function notifyOwnerBranchesChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ownerBranchesChangedEventName));
  publishOwnerDashboardRefresh();
}

export function subscribeOwnerBranchesChanged(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(ownerBranchesChangedEventName, listener);

  return () => {
    window.removeEventListener(ownerBranchesChangedEventName, listener);
  };
}
