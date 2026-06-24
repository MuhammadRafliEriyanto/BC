"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flag,
  ListChecks,
  Loader2,
  PlayCircle,
  RefreshCcw,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { clearAuthClientState } from "@/lib/auth";
import { cn } from "@/lib/utils";

import StudentLearningShell from "../learning/StudentLearningShell";

type AnswerMap = Record<string, string>;
type AssessmentType = "UTS" | "UAS" | "Tryout";

type StudentTryoutOption = {
  id: string;
  content: string;
};

type StudentTryoutAttempt = {
  submitted: boolean;
  attemptId: string | null;
  status: "in_progress" | "submitted" | null;
  score: number | null;
  correctCount: number | null;
  wrongCount: number | null;
  unansweredCount: number | null;
  timeUsedSeconds: number | null;
  startedAt: string | null;
  expiresAt: string | null;
  remainingSeconds: number | null;
  submittedAt: string | null;
};

type StudentTryoutItem = {
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

type StudentTryoutQuestion = {
  id: string;
  questionId?: string;
  order?: number;
  number?: number;
  section: string;
  topic: string;
  prompt: string;
  options: StudentTryoutOption[];
  difficulty: string;
  clue: string;
  selectedOptionId?: string | null;
  isCorrect?: boolean | null;
  correctOptionId?: string | null;
  explanation?: string;
};

type StudentTryoutListResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryouts?: StudentTryoutItem[];
  };
};

type StudentTryoutDetailResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryout?: StudentTryoutItem;
    questions?: StudentTryoutQuestion[];
    attempt?: StudentTryoutAttempt;
    result?: StudentTryoutResult;
    expiresAt?: string;
    remainingSeconds?: number;
  };
};

type StudentTryoutStartResponse = {
  success: boolean;
  message?: string;
  data?: {
    attemptId?: string;
    status?: "in_progress" | "submitted";
    startedAt?: string;
    expiresAt?: string;
    remainingSeconds?: number;
    attempt?: StudentTryoutAttempt;
  };
};

type StudentTryoutSubmitResponse = {
  success: boolean;
  message?: string;
  data?: {
    tryout?: StudentTryoutItem;
    attempt?: StudentTryoutAttempt;
    result?: StudentTryoutResult;
    questions?: StudentTryoutQuestion[];
  };
};

type StudentTryoutResult = {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
};

type ActiveTryoutSession = {
  id: string;
  assessmentType: AssessmentType;
  assessmentLabel: string;
  title: string;
  code: string;
  subject: string;
  level: string;
  branch: string;
  durationMinutes: number;
  totalQuestions: number;
  targetScore: string;
  schedule: string;
  availability: string;
  availabilityMessage: string;
  isOpen: boolean;
  mode: string;
  instructions: string[];
  focusAreas: string[];
  pacingNotes: {
    label: string;
    value: string;
  }[];
  myAttempt: StudentTryoutAttempt | null;
  questions: StudentTryoutQuestion[];
};

function normalizeText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function normalizeAssessmentType(value: string | null | undefined): AssessmentType {
  const normalizedValue = normalizeText(value).toUpperCase();

  if (normalizedValue === "UTS" || normalizedValue === "UAS") {
    return normalizedValue;
  }

  return "Tryout";
}

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatDateTime(value: string | null | undefined) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "-";
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);
}

function formatSchedule(startAt: string | null | undefined, endAt: string | null | undefined) {
  return `${formatDateTime(startAt)} - ${formatDateTime(endAt)} WIB`;
}

function getQuestionKey(question: StudentTryoutQuestion) {
  return normalizeText(question.questionId) || normalizeText(question.id);
}

function getTotalQuestions(session: ActiveTryoutSession | null) {
  if (!session) {
    return 0;
  }

  return Math.max(session.totalQuestions, session.questions.length);
}

function getPaletteClass({
  isCurrent,
  isAnswered,
  isBookmarked,
}: {
  isCurrent: boolean;
  isAnswered: boolean;
  isBookmarked: boolean;
}) {
  if (isCurrent) {
    return "border-orange-300 bg-orange-500 text-white shadow-sm";
  }

  if (isAnswered) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (isBookmarked) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-orange-100 bg-orange-50/60 text-orange-700 hover:border-orange-200 hover:bg-orange-100";
}

function getOptionClass({
  isSelected,
  isSubmitted,
  isCorrect,
  isIncorrectSelected,
}: {
  isSelected: boolean;
  isSubmitted: boolean;
  isCorrect: boolean;
  isIncorrectSelected: boolean;
}) {
  return cn(
    "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
    !isSubmitted &&
      "hover:border-orange-200 hover:bg-orange-50/60 hover:shadow-sm",
    isSelected && !isSubmitted && "border-orange-300 bg-orange-50 text-orange-900",
    isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-900",
    isIncorrectSelected && "border-rose-200 bg-rose-50 text-rose-800",
    !isSelected &&
      !isSubmitted &&
      "border-slate-200 bg-white text-slate-700 shadow-sm",
    !isSelected &&
      isSubmitted &&
      !isCorrect &&
      "border-slate-200 bg-white text-slate-600",
  );
}

async function fetchStudentTryoutJson<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as T | null;

  return { response, payload };
}

function buildSessionFromTryout(
  tryout: StudentTryoutItem,
  questions: StudentTryoutQuestion[] = [],
): ActiveTryoutSession {
  const id = normalizeText(tryout.tryoutId) || normalizeText(tryout.id);
  const assessmentType = normalizeAssessmentType(tryout.assessmentType);
  const assessmentLabel =
    assessmentType === "Tryout" &&
    typeof tryout.stage === "number" &&
    Number.isFinite(tryout.stage)
      ? `Tryout ${tryout.stage}`
      : assessmentType;
  const subject = normalizeText(tryout.subject) || "Mapel ujian";
  const level =
    normalizeText(tryout.canonicalClassName) ||
    [normalizeText(tryout.jenjang), normalizeText(tryout.kelas)]
      .filter(Boolean)
      .join(" ");
  const totalQuestions = Math.max(
    tryout.totalQuestions ?? 0,
    tryout.questionCount ?? 0,
    questions.length,
  );

  return {
    id,
    assessmentType,
    assessmentLabel,
    title: normalizeText(tryout.title) || `${assessmentLabel} ${subject}`,
    code: id || "-",
    subject,
    level: level || normalizeText(tryout.kelas) || "Kelas ujian",
    branch: normalizeText(tryout.branch) || "Cabang belum diatur",
    durationMinutes: Math.max(tryout.durationMinutes ?? 90, 1),
    totalQuestions,
    targetScore: "Target sesuai capaian terbaikmu",
    schedule: formatSchedule(tryout.startAt, tryout.endAt),
    availability: normalizeText(tryout.availability) || "Belum tersedia",
    availabilityMessage:
      normalizeText(tryout.availabilityMessage) ||
      "Status pengerjaan mengikuti jadwal publish guru.",
    isOpen: tryout.isOpen === true,
    mode:
      tryout.questionSource === "bank"
        ? "CBT Bank Soal Backend"
        : `CBT ${assessmentLabel} Terjadwal`,
    instructions: [
      `Klik mulai ${assessmentLabel} saat jadwal sudah terbuka dan kamu siap mengerjakan.`,
      `Jawaban dikirim ke backend dan hasilnya tersimpan untuk guru serta nilai ${assessmentLabel}.`,
      "Gunakan penanda soal untuk menandai nomor yang ingin dicek ulang sebelum submit.",
      "Setelah dikirim, pembahasan dan kunci jawaban akan tampil dari data backend.",
    ],
    focusAreas: Array.from(
      new Set(
        questions
          .map((question) => normalizeText(question.topic))
          .filter(Boolean)
          .slice(0, 4),
      ),
    ),
    pacingNotes: [
      {
        label: "Durasi total",
        value: `${Math.max(tryout.durationMinutes ?? 90, 1)} menit`,
      },
      {
        label: "Jumlah soal",
        value: `${totalQuestions} soal`,
      },
      {
        label: "Cabang",
        value: normalizeText(tryout.branch) || "-",
      },
    ],
    myAttempt: tryout.myAttempt ?? null,
    questions,
  };
}

function ReviewBadge({
  question,
  selectedOptionId,
}: {
  question: StudentTryoutQuestion;
  selectedOptionId?: string;
}) {
  if (!selectedOptionId) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        Belum dijawab
      </span>
    );
  }

  const isCorrect =
    question.isCorrect === true ||
    (Boolean(question.correctOptionId) &&
      selectedOptionId === question.correctOptionId);

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        isCorrect
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700",
      )}
    >
      {isCorrect ? "Jawaban benar" : "Perlu review"}
    </span>
  );
}

function TryoutStatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "highlight";
}) {
  return (
    <section className="group rounded-[20px] border border-slate-100 bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-lg font-semibold text-slate-800">{value}</p>
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border transition-colors duration-300",
            tone === "highlight"
              ? "border-orange-200 bg-orange-100 text-orange-700 group-hover:bg-white"
              : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-orange-100 group-hover:bg-orange-50 group-hover:text-orange-600",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
    </section>
  );
}

function TryoutInstructionList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-[20px] border border-slate-100 bg-slate-50/60 px-4 py-3"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-white text-xs font-semibold text-orange-600">
            {index + 1}
          </div>
          <p className="text-sm leading-6 text-slate-600">{item}</p>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-slate-200 bg-slate-50 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyTryoutState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-dashed border-orange-200 bg-orange-50/30 px-5 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] border border-orange-100 bg-white text-orange-500">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
      >
        <RefreshCcw className="h-4 w-4" />
        Muat Ulang
      </button>
    </section>
  );
}

type TryoutSiswaPageViewProps = {
  attemptId?: string;
};

export default function TryoutSiswaPageView({
  attemptId,
}: TryoutSiswaPageViewProps = {}) {
  const router = useRouter();
  const [tryouts, setTryouts] = useState<StudentTryoutItem[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveTryoutSession | null>(null);
  const [result, setResult] = useState<StudentTryoutResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedByTimer, setSubmittedByTimer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const totalDurationSeconds = Math.max(
    activeSession?.durationMinutes ?? 0,
    1,
  ) * 60;
  const totalQuestions = getTotalQuestions(activeSession);
  const currentQuestion =
    activeSession?.questions[currentQuestionIndex] ?? null;
  const answeredCount = Object.keys(answers).filter(
    (questionId) => Boolean(answers[questionId]),
  ).length;
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);
  const progressValue = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;
  const reviewCount = bookmarkedIds.length;
  const timeUsedSeconds =
    isSubmitted && typeof activeSession?.myAttempt?.timeUsedSeconds === "number"
      ? activeSession.myAttempt.timeUsedSeconds
      : Math.max(totalDurationSeconds - secondsRemaining, 0);
  const timerRatio = totalDurationSeconds
    ? secondsRemaining / totalDurationSeconds
    : 0;

  const summaryText = isLoading
    ? "Memuat ujian"
    : attemptId
      ? "Sesi ujian aman"
      : `${tryouts.length} ujian published`;

  const resetTryoutSessionState = useCallback((
    session: ActiveTryoutSession | null,
    initialRemainingSeconds?: number | null,
  ) => {
    if (!session) {
      setResult(null);
      setIsSubmitted(false);
      setHasStarted(false);
      setSubmittedByTimer(false);
      setCurrentQuestionIndex(0);
      setSecondsRemaining(0);
      setAnswers({});
      setBookmarkedIds([]);
      return;
    }

    const sessionTotalDurationSeconds = Math.max(session.durationMinutes, 1) * 60;
    const sessionTotalQuestions = getTotalQuestions(session);
    const submittedAttempt = session.myAttempt;

    setSecondsRemaining(
      typeof initialRemainingSeconds === "number"
        ? Math.max(initialRemainingSeconds, 0)
        : sessionTotalDurationSeconds,
    );
    setResult(
      submittedAttempt?.submitted && typeof submittedAttempt.score === "number"
        ? {
            score: submittedAttempt.score,
            correctCount: submittedAttempt.correctCount ?? 0,
            wrongCount: submittedAttempt.wrongCount ?? 0,
            unansweredCount: submittedAttempt.unansweredCount ?? 0,
            totalQuestions: sessionTotalQuestions,
          }
        : null,
    );
    setIsSubmitted(submittedAttempt?.submitted === true);
    setHasStarted(false);
    setSubmittedByTimer(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setBookmarkedIds([]);
  }, []);

  const loadTryoutList = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const { response, payload } =
        await fetchStudentTryoutJson<StudentTryoutListResponse>(
          "/api/student/me/tryouts",
          {
            method: "GET",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Data ujian siswa belum bisa dimuat.");
      }

      const nextTryouts = payload.data?.tryouts ?? [];
      setTryouts(nextTryouts);

      if (nextTryouts.length > 0) {
        const nextSession = buildSessionFromTryout(nextTryouts[0]);
        setActiveSession(nextSession);
        resetTryoutSessionState(nextSession);
      } else {
        setActiveSession(null);
        resetTryoutSessionState(null);
      }
    } catch (error) {
      console.error("[tryout-siswa-page] load_tryouts_failed", error);
      setTryouts([]);
      setActiveSession(null);
      resetTryoutSessionState(null);
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : "Data ujian siswa belum bisa dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [resetTryoutSessionState]);

  const loadExamAttempt = useCallback(async () => {
    if (!attemptId) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const { response, payload } =
        await fetchStudentTryoutJson<StudentTryoutDetailResponse>(
          `/api/student/me/exam-attempts/${encodeURIComponent(attemptId)}`,
          {
            method: "GET",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success || !payload.data?.tryout) {
        throw new Error(payload?.message || "Sesi ujian belum bisa dimuat.");
      }

      const tryout = {
        ...payload.data.tryout,
        myAttempt:
          payload.data.attempt ?? payload.data.tryout.myAttempt,
      };
      const nextSession = buildSessionFromTryout(
        tryout,
        payload.data.questions ?? [],
      );
      const restoredAnswers: AnswerMap = {};

      for (const question of nextSession.questions) {
        const questionKey = getQuestionKey(question);

        if (question.selectedOptionId) {
          restoredAnswers[questionKey] = question.selectedOptionId;
        }
      }

      setTryouts([tryout]);
      setActiveSession(nextSession);
      resetTryoutSessionState(
        nextSession,
        payload.data.remainingSeconds ??
          payload.data.attempt?.remainingSeconds ??
          nextSession.myAttempt?.remainingSeconds,
      );
      setAnswers(restoredAnswers);
      setHasStarted(true);
      setIsSubmitted(nextSession.myAttempt?.submitted === true);
      setResult(payload.data.result ?? null);
    } catch (error) {
      console.error("[tryout-siswa-page] load_exam_attempt_failed", error);
      setTryouts([]);
      setActiveSession(null);
      resetTryoutSessionState(null);
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : "Sesi ujian belum bisa dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [attemptId, resetTryoutSessionState]);

  function handleSelectAssessment(assessmentId: string) {
    const selectedAssessment = tryouts.find((item) => {
      const itemId = normalizeText(item.tryoutId) || normalizeText(item.id);
      return itemId === assessmentId;
    });

    if (!selectedAssessment) {
      return;
    }

    const nextSession = buildSessionFromTryout(selectedAssessment);
    setActiveSession(nextSession);
    resetTryoutSessionState(nextSession);
  }

  useEffect(() => {
    queueMicrotask(() => {
      if (attemptId) {
        void loadExamAttempt();
        return;
      }

      void loadTryoutList();
    });
  }, [attemptId, loadExamAttempt, loadTryoutList]);

  const submitTryoutFromTimer = useEffectEvent(() => {
    void handleSubmitTryout(true);
  });

  useEffect(() => {
    if (!hasStarted || isSubmitted || isSubmitting) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(timerId);
          setSubmittedByTimer(true);
          submitTryoutFromTimer();
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [hasStarted, isSubmitted, isSubmitting]);

  async function handleStartTryout() {
    if (!activeSession || isDetailLoading || isSubmitting) {
      return;
    }

    if (attemptId && activeSession.myAttempt?.attemptId === attemptId) {
      setHasStarted(true);
      return;
    }

    if (!activeSession.isOpen && !activeSession.myAttempt?.submitted) {
      window.alert(activeSession.availabilityMessage);
      return;
    }

    try {
      setIsDetailLoading(true);
      const { response, payload } =
        await fetchStudentTryoutJson<StudentTryoutStartResponse>(
          `/api/student/me/exams/${encodeURIComponent(activeSession.id)}/start`,
          {
            method: "POST",
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      const nextAttemptId = normalizeText(payload?.data?.attemptId);

      if (!response.ok || !payload?.success || !nextAttemptId) {
        throw new Error(payload?.message || "Sesi ujian belum bisa dimulai.");
      }

      router.push(`/dashboard-siswa/ujian/${encodeURIComponent(nextAttemptId)}`);
    } catch (error) {
      console.error("[tryout-siswa-page] load_tryout_detail_failed", error);
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Detail ujian belum bisa dimuat.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  }

  function handleRestartTryout() {
    setHasStarted(false);
    setIsSubmitted(false);
    setSubmittedByTimer(false);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(totalDurationSeconds);
    setAnswers({});
    setBookmarkedIds([]);
    setResult(null);
  }

  function handleSelectAnswer(questionId: string, optionId: string) {
    if (isSubmitted || isSubmitting) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));
  }

  async function handleSubmitTryout(fromTimer = false) {
    if (!activeSession || isSubmitting || isSubmitted) {
      return;
    }

    const activeAttemptId =
      normalizeText(attemptId) ||
      normalizeText(activeSession.myAttempt?.attemptId);

    if (!activeAttemptId) {
      window.alert("Sesi ujian tidak ditemukan. Mulai ulang ujian dari daftar.");
      return;
    }

    try {
      setIsSubmitting(true);
      const answerPayload = activeSession.questions.map((question) => {
        const questionId = getQuestionKey(question);

        return {
          questionId,
          selectedAnswer: answers[questionId] ?? "",
        };
      });
      const { response, payload } =
        await fetchStudentTryoutJson<StudentTryoutSubmitResponse>(
          `/api/student/me/exam-attempts/${encodeURIComponent(activeAttemptId)}/submission`,
          {
            method: "POST",
            body: JSON.stringify({
              answers: answerPayload,
            }),
          },
        );

      if (response.status === 401) {
        clearAuthClientState();
      }

      if (!response.ok || !payload?.success || !payload.data?.tryout) {
        throw new Error(payload?.message || "Jawaban ujian belum bisa dikirim.");
      }

      const nextSession = buildSessionFromTryout(
        payload.data.tryout,
        payload.data.questions ?? activeSession.questions,
      );
      const nextAnswers: AnswerMap = {};

      for (const question of nextSession.questions) {
        const questionId = getQuestionKey(question);

        if (question.selectedOptionId) {
          nextAnswers[questionId] = question.selectedOptionId;
        }
      }

      setActiveSession(nextSession);
      setAnswers(nextAnswers);
      setResult(payload.data.result ?? null);
      setSubmittedByTimer(fromTimer);
      setIsSubmitted(true);
      setSecondsRemaining(0);
    } catch (error) {
      console.error("[tryout-siswa-page] submit_tryout_failed", error);
      if (fromTimer) {
        setSubmittedByTimer(false);
      }
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "Jawaban ujian belum bisa dikirim.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleToggleBookmark(questionId: string) {
    if (isSubmitted || isSubmitting) {
      return;
    }

    setBookmarkedIds((currentIds) => {
      if (currentIds.includes(questionId)) {
        return currentIds.filter((item) => item !== questionId);
      }

      return [...currentIds, questionId];
    });
  }

  const displayResult = useMemo(() => {
    if (result) {
      return result;
    }

    const attempt = activeSession?.myAttempt;

    if (!attempt?.submitted || typeof attempt.score !== "number") {
      return null;
    }

    return {
      score: attempt.score,
      correctCount: attempt.correctCount ?? 0,
      wrongCount: attempt.wrongCount ?? 0,
      unansweredCount: attempt.unansweredCount ?? 0,
      totalQuestions,
    };
  }, [activeSession?.myAttempt, result, totalQuestions]);

  return (
    <StudentLearningShell
      title="Ujian Siswa"
      description="Kerjakan UTS, UAS, atau Tryout dari data backend sesuai cabang dan kelas kamu. Soal, submit, dan hasilnya tersimpan real."
      summary={summaryText}
    >
      {isLoading ? (
        <section className="rounded-[24px] border border-slate-100 bg-white px-5 py-10 text-center shadow-sm">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-orange-500" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Memuat ujian dari backend...
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Sistem sedang mencocokkan data siswa dengan cabang dan kelas.
          </p>
        </section>
      ) : loadError ? (
        <EmptyTryoutState
          title="Ujian belum bisa dimuat"
          description={loadError}
          onRetry={attemptId ? loadExamAttempt : loadTryoutList}
        />
      ) : !activeSession ? (
        <EmptyTryoutState
          title="Belum ada ujian published untuk akun ini"
          description="Siswa hanya melihat UTS, UAS, atau Tryout yang sudah dipublish guru dan cocok dengan cabang serta kelasnya."
          onRetry={loadTryoutList}
        />
      ) : (
        <>
          {!attemptId && tryouts.length > 1 ? (
            <section className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
              <label
                htmlFor="student-assessment-selector"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400"
              >
                Pilih Ujian
              </label>
              <select
                id="student-assessment-selector"
                value={activeSession.id}
                onChange={(event) => handleSelectAssessment(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              >
                {tryouts.map((item) => {
                  const session = buildSessionFromTryout(item);

                  return (
                    <option key={session.id} value={session.id}>
                      {session.assessmentLabel} · {session.title} · {session.subject}
                    </option>
                  );
                })}
              </select>
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <TryoutStatCard
              label="Durasi"
              value={`${activeSession.durationMinutes} menit`}
              helper={`Timer berjalan sejak ${activeSession.assessmentLabel} dimulai.`}
              icon={Clock3}
              tone="highlight"
            />
            <TryoutStatCard
              label="Jumlah Soal"
              value={`${totalQuestions} soal`}
              helper="Jumlah soal dibaca dari bank soal backend."
              icon={ListChecks}
            />
            <TryoutStatCard
              label="Cabang"
              value={activeSession.branch}
              helper={`${activeSession.assessmentLabel} difilter sesuai cabang dan kelas akun siswa.`}
              icon={Target}
              tone="highlight"
            />
            <TryoutStatCard
              label="Status"
              value={activeSession.availability}
              helper={activeSession.availabilityMessage}
              icon={ShieldCheck}
            />
          </div>

          {isSubmitted && displayResult ? (
            <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
              <SectionHeader
                icon={CheckCircle2}
                title={`Hasil ${activeSession.assessmentLabel}`}
                description="Ringkasan performa dari jawaban yang tersimpan di backend."
              />

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {submittedByTimer
                      ? `${activeSession.assessmentLabel} terkirim otomatis`
                      : `${activeSession.assessmentLabel} berhasil dikirim`}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-slate-800">
                    Ringkasan hasil {activeSession.assessmentLabel} kamu
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Nilai ini dihitung dari kunci jawaban backend, lalu tersimpan
                    ke hasil ujian guru dan nilai {activeSession.assessmentLabel} siswa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRestartTryout}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Lihat Instruksi
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Skor
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                    {displayResult.score}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Jawaban Benar
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                    {displayResult.correctCount}/{displayResult.totalQuestions}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Waktu Terpakai
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                    {formatTimer(timeUsedSeconds)}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Belum Dijawab
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">
                    {displayResult.unansweredCount}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {!hasStarted ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <section className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-orange-50/55 px-5 py-5 md:px-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600 shadow-sm">
                        <Sparkles className="h-4 w-4" />
                        Sesi CBT Backend
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-slate-800 md:text-[30px]">
                        {activeSession.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                        {activeSession.subject} untuk {activeSession.level} di
                        cabang {activeSession.branch}. Data ini sudah difilter
                        berdasarkan akun siswa yang login.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                          Kode
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {activeSession.code}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                          Jadwal
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {activeSession.schedule}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleStartTryout}
                      disabled={
                        isDetailLoading ||
                        (!activeSession.isOpen &&
                          !activeSession.myAttempt?.submitted)
                      }
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-200"
                    >
                      {isDetailLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      {activeSession.myAttempt?.submitted
                        ? "Lihat Hasil"
                        : `Mulai ${activeSession.assessmentLabel}`}
                    </button>
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-orange-500" />
                      {activeSession.availabilityMessage}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-6">
                  <div className="rounded-[20px] border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Target className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Fokus Materi
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(activeSession.focusAreas.length
                        ? activeSession.focusAreas
                        : [activeSession.subject, activeSession.level]
                      ).map((area) => (
                        <span
                          key={area}
                          className="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-2 text-orange-700">
                      <TimerReset className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Ringkasan Sesi
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {activeSession.pacingNotes.map((note) => (
                        <div
                          key={note.label}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
                        >
                          <span className="text-sm text-slate-500">{note.label}</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {note.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                <SectionHeader
                  icon={ListChecks}
                  title="Panduan Pengerjaan"
                  description="Checklist singkat sebelum sesi dimulai agar pengerjaan lebih tenang dan rapi."
                />

                <TryoutInstructionList items={activeSession.instructions} />
              </aside>
            </div>
          ) : currentQuestion ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                <SectionHeader
                  icon={ListChecks}
                  title="Area Pengerjaan"
                  description="Baca soal dengan teliti, pilih jawaban terbaik, lalu tandai bila ingin direview lagi."
                />

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        {currentQuestion.section}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {currentQuestion.topic}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {currentQuestion.difficulty}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-slate-800">
                      Soal {currentQuestionIndex + 1} dari {totalQuestions}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Pilih satu jawaban terbaik. Kamu bebas melompat ke soal
                      lain lalu kembali lagi sebelum ujian dikirim.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {isSubmitted ? (
                      <ReviewBadge
                        question={currentQuestion}
                        selectedOptionId={answers[getQuestionKey(currentQuestion)]}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleBookmark(getQuestionKey(currentQuestion))
                        }
                        className={cn(
                          "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition",
                          bookmarkedIds.includes(getQuestionKey(currentQuestion))
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
                        )}
                      >
                        <Flag className="h-4 w-4" />
                        {bookmarkedIds.includes(getQuestionKey(currentQuestion))
                          ? "Ditandai"
                          : "Tandai Review"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50/55 p-5">
                  <p className="text-base leading-8 text-slate-700">
                    {currentQuestion.prompt}
                  </p>

                  <div className="mt-6 space-y-3">
                    {currentQuestion.options.map((option) => {
                      const questionId = getQuestionKey(currentQuestion);
                      const selectedOptionId = answers[questionId];
                      const isSelected = selectedOptionId === option.id;
                      const isCorrect =
                        isSubmitted && currentQuestion.correctOptionId === option.id;
                      const isIncorrectSelected =
                        isSubmitted && isSelected && !isCorrect;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={isSubmitted || isSubmitting}
                          onClick={() => handleSelectAnswer(questionId, option.id)}
                          className={getOptionClass({
                            isSelected,
                            isSubmitted,
                            isCorrect,
                            isIncorrectSelected,
                          })}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                              isCorrect &&
                                "border-emerald-200 bg-white text-emerald-700",
                              isIncorrectSelected &&
                                "border-rose-200 bg-white text-rose-700",
                              isSelected &&
                                !isSubmitted &&
                                "border-orange-200 bg-white text-orange-700",
                              !isSelected &&
                                !isCorrect &&
                                !isIncorrectSelected &&
                                "border-slate-200 bg-slate-50 text-slate-500",
                            )}
                          >
                            {option.id.toUpperCase()}
                          </span>

                          <span className="flex-1 pt-1 text-sm leading-6">
                            {option.content}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className={cn(
                      "mt-6 rounded-2xl border px-4 py-3",
                      isSubmitted
                        ? "border-emerald-100 bg-emerald-50/70"
                        : "border-slate-200 bg-white",
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {isSubmitted ? "Catatan Review" : "Pengingat"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {isSubmitted
                        ? currentQuestion.clue
                        : "Gunakan penanda review untuk soal yang masih ingin kamu cek lagi sebelum submit."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((currentIndex) =>
                        Math.max(currentIndex - 1, 0),
                      )
                    }
                    disabled={currentQuestionIndex === 0}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Soal Sebelumnya
                  </button>

                  <div className="flex flex-wrap gap-3">
                    {!isSubmitted ? (
                      <button
                        type="button"
                        onClick={() => void handleSubmitTryout(false)}
                        disabled={isSubmitting}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-200"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SendHorizontal className="h-4 w-4" />
                        )}
                        {isSubmitting
                          ? "Mengirim..."
                          : `Kirim ${activeSession.assessmentLabel}`}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentQuestionIndex((currentIndex) =>
                          Math.min(currentIndex + 1, totalQuestions - 1),
                        )
                      }
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Soal Berikutnya
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>

              <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                  <SectionHeader
                    icon={Clock3}
                    title={`Timer ${activeSession.assessmentLabel}`}
                    description="Pantau sisa waktu dan ritme pengerjaan selama sesi berlangsung."
                  />

                  <div
                    className={cn(
                      "rounded-[24px] border px-4 py-4",
                      timerRatio <= 0.1 && "border-rose-200 bg-rose-50 text-rose-700",
                      timerRatio > 0.1 &&
                        timerRatio <= 0.25 &&
                        "border-amber-200 bg-amber-50 text-amber-700",
                      timerRatio > 0.25 &&
                        "border-orange-100 bg-orange-50/70 text-orange-700",
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                          Sisa waktu
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-[0.08em]">
                          {formatTimer(secondsRemaining)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/85 px-3 py-2 text-right shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Terpakai
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatTimer(timeUsedSeconds)}
                        </p>
                      </div>
                    </div>

                    <Progress
                      value={Math.max(0, Math.round(timerRatio * 100))}
                      className={cn(
                        "mt-4 h-2.5 bg-white/90",
                        timerRatio <= 0.1 && "[&>div]:bg-rose-500",
                        timerRatio > 0.1 &&
                          timerRatio <= 0.25 &&
                          "[&>div]:bg-amber-500",
                        timerRatio > 0.25 && "[&>div]:bg-orange-500",
                      )}
                    />
                  </div>

                  {timerRatio <= 0.1 && !isSubmitted ? (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Waktu hampir habis. Prioritaskan soal yang belum dijawab
                      terlebih dahulu lalu review seperlunya.
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                  <SectionHeader
                    icon={Target}
                    title="Progres Jawaban"
                    description="Lihat jumlah soal yang sudah terjawab, tertunda, dan masih perlu direview."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Terjawab
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-800">
                        {answeredCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Belum
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-800">
                        {unansweredCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Review
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-800">
                        {reviewCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Progress
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-800">
                        {progressValue}%
                      </p>
                    </div>
                  </div>

                  <Progress value={progressValue} className="mt-4 h-2.5 bg-slate-100" />
                </section>

                <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                  <SectionHeader
                    icon={Flag}
                    title="Navigasi Soal"
                    description="Pindah antar nomor soal dengan cepat sambil tetap memantau status jawabannya."
                  />

                  <div className="grid grid-cols-4 gap-2.5">
                    {activeSession.questions.map((question, index) => {
                      const questionId = getQuestionKey(question);

                      return (
                        <button
                          key={questionId}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={cn(
                            "inline-flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition",
                            getPaletteClass({
                              isCurrent: currentQuestionIndex === index,
                              isAnswered: Boolean(answers[questionId]),
                              isBookmarked: bookmarkedIds.includes(questionId),
                            }),
                          )}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                      <span className="h-3 w-3 rounded-full bg-orange-500" />
                      Soal yang sedang dibuka
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                      Sudah dijawab
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      Ditandai untuk review
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          ) : (
            <EmptyTryoutState
              title="Soal ujian belum tersedia"
              description={`${activeSession.assessmentLabel} ini sudah terdaftar, tetapi detail soal belum berhasil dimuat dari backend.`}
              onRetry={() => void handleStartTryout()}
            />
          )}
        </>
      )}
    </StudentLearningShell>
  );
}
