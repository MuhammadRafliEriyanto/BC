"use client";

import { useEffect, useState } from "react";

import { clearAuthClientState } from "@/lib/auth";

export type StudentAttendanceHistoryRecord = {
  id: string;
  sessionId: string;
  date: string;
  startTime: string;
  subject: string;
  className: string;
  branch: string;
  room: string;
  teacherName: string;
  status: string;
  sessionStatus: string;
  markedBy: string;
  note: string;
  markedAt: string | null;
};

type StudentAttendanceResponse = {
  success: boolean;
  message?: string;
  data?: {
    records: StudentAttendanceHistoryRecord[];
  };
};

export function useStudentAttendanceData() {
  const [history, setHistory] = useState<StudentAttendanceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStudentAttendanceData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/student/me/attendance", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | StudentAttendanceResponse
          | null;

        if (!isMounted) {
          return;
        }

        if (response.status === 401) {
          clearAuthClientState();
          setHistory([]);
          setLoadError("Sesi login berakhir. Silakan login ulang.");
          return;
        }

        if (!response.ok || !payload?.success || !payload.data) {
          setHistory([]);
          setLoadError(
            payload?.message || "Riwayat absensi belum bisa dimuat saat ini.",
          );
          return;
        }

        setHistory(payload.data.records);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("[dashboard-siswa] load_attendance_data_failed", {
          error,
        });
        setHistory([]);
        setLoadError("Riwayat absensi belum bisa dimuat saat ini.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    queueMicrotask(() => {
      void loadStudentAttendanceData();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    history,
    isLoading,
    loadError,
  };
}
