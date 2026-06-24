"use client";

import { useEffect, useState } from "react";
import { clearAuthClientState } from "@/lib/auth";

export type AssessmentType = "UTS" | "UAS" | "Tryout";

export type StudentTryoutAttempt = {
  id: string;
  tryoutId: string;
  studentId: string;
  classId: string;
  teacherId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  submittedAt: string | null;
  timeUsedSeconds?: number | null;
};

export type StudentTryoutItem = {
  id?: string;
  tryoutId?: string;
  classId?: string;
  branch?: string;
  canonicalClassName?: string;
  assessmentType?: AssessmentType;
  title?: string;
  jenjang?: string;
  kelas?: string;
  subject?: string;
  stage?: number | null;
  durationMinutes?: number;
  startAt?: string | null;
  endAt?: string | null;
  questionSource?: string;
  questionCount?: number;
  totalQuestions?: number;
  questionSetId?: string | null;
  packageId?: string | null;
  availability?: string;
  availabilityMessage?: string;
  isOpen?: boolean;
  myAttempt?: StudentTryoutAttempt;
};

type StudentTryoutListResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryouts?: StudentTryoutItem[];
  };
};

export function useStudentTryouts() {
  const [tryouts, setTryouts] = useState<StudentTryoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTryouts() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/student/me/tryouts", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as StudentTryoutListResponse | null;

        if (!isMounted) return;

        if (response.status === 401) {
          clearAuthClientState();
          setLoadError("Sesi login berakhir. Silakan login ulang.");
          return;
        }

        if (!response.ok || !payload?.success || !payload.data) {
          setLoadError(payload?.message || "Gagal memuat data ujian.");
          return;
        }

        setTryouts(payload.data.tryouts ?? []);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Terjadi kesalahan jaringan.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTryouts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { tryouts, isLoading, loadError };
}
