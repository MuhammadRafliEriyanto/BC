"use client";

import { useEffect, useState } from "react";

import { clearAuthClientState } from "@/lib/auth";

type StudentDashboardApiResponse = {
  success: boolean;
  message?: string;
  data?: StudentDashboardData;
};

export type StudentDashboardSchedule = {
  id: string;
  day: string;
  time: string;
  className: string;
  subject: string;
  teacher: string;
  room: string;
  branch: string;
  status: string;
};

export type StudentDashboardData = {
  student: {
    id: string;
    name: string;
    branch: string;
    program: string;
    className: string;
    status: string;
    accessStatus: string;
  };
  academicSummary: {
    jenjang: string;
    kelas: number | null;
    kelasLabel: string;
    materialCount: number;
    taskCount: number;
    tryoutCount: number;
    todayScheduleCount: number;
    scheduleCount: number;
  };
  schedules: StudentDashboardSchedule[];
  todaySchedules: StudentDashboardSchedule[];
};

export function useStudentDashboardData() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStudentDashboardData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/student/me/dashboard", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | StudentDashboardApiResponse
          | null;

        if (!isMounted) {
          return;
        }

        if (response.status === 401) {
          clearAuthClientState();
          setDashboardData(null);
          setLoadError("Sesi login berakhir. Silakan login ulang.");
          return;
        }

        if (!response.ok || !payload?.success || !payload.data) {
          setDashboardData(null);
          setLoadError(
            payload?.message ||
              "Ringkasan dashboard siswa belum bisa dimuat saat ini.",
          );
          return;
        }

        setDashboardData({
          ...payload.data,
          schedules: payload.data.schedules ?? [],
          todaySchedules: payload.data.todaySchedules ?? [],
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("[dashboard-siswa] load_dashboard_data_failed", {
          error,
        });
        setDashboardData(null);
        setLoadError("Ringkasan dashboard siswa belum bisa dimuat saat ini.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => {
      void loadStudentDashboardData();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    dashboardData,
    isLoading,
    loadError,
  };
}
