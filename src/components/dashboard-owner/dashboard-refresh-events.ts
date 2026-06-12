"use client";

const ownerDashboardRefreshEventName = "owner-dashboard:refresh";

export function publishOwnerDashboardRefresh() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ownerDashboardRefreshEventName));
}

export function subscribeOwnerDashboardRefresh(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(ownerDashboardRefreshEventName, listener);

  return () => {
    window.removeEventListener(ownerDashboardRefreshEventName, listener);
  };
}
