"use client";

const studentDashboardRefreshEventName = "student-dashboard:refresh";
const refreshThrottleMs = 700;

export function publishStudentDashboardRefresh() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(studentDashboardRefreshEventName));
}

export function subscribeStudentDashboardRefresh(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  let lastRefreshAt = 0;

  const requestRefresh = () => {
    const now = Date.now();

    if (now - lastRefreshAt < refreshThrottleMs) {
      return;
    }

    lastRefreshAt = now;
    listener();
  };

  const refreshWhenVisible = () => {
    if (document.visibilityState === "visible") {
      requestRefresh();
    }
  };

  window.addEventListener(studentDashboardRefreshEventName, requestRefresh);
  window.addEventListener("focus", requestRefresh);
  document.addEventListener("visibilitychange", refreshWhenVisible);

  return () => {
    window.removeEventListener(studentDashboardRefreshEventName, requestRefresh);
    window.removeEventListener("focus", requestRefresh);
    document.removeEventListener("visibilitychange", refreshWhenVisible);
  };
}
