"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flag,
  ListChecks,
  PlayCircle,
  RefreshCcw,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import {
  studentTryoutSession,
  type StudentTryoutQuestion,
} from "../data/tryout-data";
import StudentLearningShell from "../learning/StudentLearningShell";

type AnswerMap = Record<string, string>;

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
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

  return "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50";
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
      "hover:border-orange-200 hover:bg-orange-50/60 hover:shadow-[0_10px_24px_-18px_rgba(249,115,22,0.45)]",
    isSelected && !isSubmitted && "border-orange-300 bg-orange-50 text-orange-900",
    isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-900",
    isIncorrectSelected && "border-rose-200 bg-rose-50 text-rose-800",
    !isSelected &&
      !isSubmitted &&
      "border-slate-200 bg-white text-slate-700 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)]",
    !isSelected &&
      isSubmitted &&
      !isCorrect &&
      "border-slate-200 bg-white text-slate-600",
  );
}

function TryoutStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <section className="rounded-[24px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-slate-800">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{helper}</p>
    </section>
  );
}

function TryoutInstructionList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50/55 px-4 py-3"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-orange-600">
            {index + 1}
          </div>
          <p className="text-sm leading-6 text-slate-600">{item}</p>
        </div>
      ))}
    </div>
  );
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

  const isCorrect = selectedOptionId === question.correctOptionId;

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

export default function TryoutSiswaPageView() {
  const totalDurationSeconds = studentTryoutSession.durationMinutes * 60;
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedByTimer, setSubmittedByTimer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const currentQuestion = studentTryoutSession.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = studentTryoutSession.totalQuestions - answeredCount;
  const progressValue = Math.round(
    (answeredCount / studentTryoutSession.totalQuestions) * 100,
  );
  const reviewCount = bookmarkedIds.length;
  const timeUsedSeconds = totalDurationSeconds - secondsRemaining;
  const timerRatio = secondsRemaining / totalDurationSeconds;

  const correctCount = useMemo(
    () =>
      studentTryoutSession.questions.reduce((total, question) => {
        return total + Number(answers[question.id] === question.correctOptionId);
      }, 0),
    [answers],
  );

  const estimatedScore = Math.round(
    (correctCount / studentTryoutSession.totalQuestions) * 100,
  );

  useEffect(() => {
    if (!hasStarted || isSubmitted) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(timerId);
          setSubmittedByTimer(true);
          setIsSubmitted(true);
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [hasStarted, isSubmitted]);

  function handleStartTryout() {
    setHasStarted(true);
    setSubmittedByTimer(false);
  }

  function handleRestartTryout() {
    setHasStarted(false);
    setIsSubmitted(false);
    setSubmittedByTimer(false);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(totalDurationSeconds);
    setAnswers({});
    setBookmarkedIds([]);
  }

  function handleSelectAnswer(questionId: string, optionId: string) {
    if (isSubmitted) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));
  }

  function handleSubmitTryout() {
    setIsSubmitted(true);
  }

  function handleToggleBookmark(questionId: string) {
    if (isSubmitted) {
      return;
    }

    setBookmarkedIds((currentIds) => {
      if (currentIds.includes(questionId)) {
        return currentIds.filter((item) => item !== questionId);
      }

      return [...currentIds, questionId];
    });
  }

  return (
    <StudentLearningShell
      title="Tryout Siswa"
      description="Kerjakan simulasi CBT dengan tampilan yang ringkas, fokus, dan tetap selaras dengan nuansa dashboard siswa yang sudah ada."
      summary="1 sesi tryout aktif"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <TryoutStatCard
          label="Durasi"
          value={`${studentTryoutSession.durationMinutes} menit`}
          helper="Timer akan berjalan penuh sejak tryout dimulai."
        />
        <TryoutStatCard
          label="Jumlah Soal"
          value={`${studentTryoutSession.totalQuestions} soal`}
          helper="Campuran soal penalaran, literasi, dan matematika dasar."
        />
        <TryoutStatCard
          label="Target"
          value={studentTryoutSession.targetScore}
          helper="Gunakan tryout ini untuk latihan ritme dan akurasi jawaban."
        />
        <TryoutStatCard
          label="Mode"
          value={studentTryoutSession.mode}
          helper={studentTryoutSession.availability}
        />
      </div>

      {isSubmitted ? (
        <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {submittedByTimer
                  ? "Tryout terkirim otomatis"
                  : "Tryout berhasil dikirim"}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-800">
                Ringkasan hasil latihan kamu
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Nilai di bawah ini adalah estimasi dari jawaban dummy untuk
                kebutuhan preview UI. Nanti bisa diganti dengan hasil real dari
                backend penilaian.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestartTryout}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Ulangi Simulasi
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Estimasi Skor
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">
                {estimatedScore}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Jawaban Benar
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">
                {correctCount}/{studentTryoutSession.totalQuestions}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Waktu Terpakai
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">
                {formatTimer(timeUsedSeconds)}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Belum Dijawab
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">
                {unansweredCount}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {!hasStarted ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="overflow-hidden rounded-[28px] border border-orange-100/90 bg-white shadow-[0_20px_44px_-34px_rgba(15,23,42,0.22)]">
            <div className="bg-[linear-gradient(135deg,rgba(124,45,18,0.98),rgba(234,88,12,0.94),rgba(245,158,11,0.92))] px-5 py-6 text-white md:px-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-50">
                    <Sparkles className="h-4 w-4" />
                    Sesi CBT Aktif
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold md:text-[30px]">
                    {studentTryoutSession.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                    {studentTryoutSession.subject} untuk{" "}
                    {studentTryoutSession.level} dengan alur pengerjaan yang
                    fokus, minim distraksi, dan siap dipakai sebagai dasar
                    integrasi tryout real.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                      Kode
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {studentTryoutSession.code}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
                      Jadwal
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {studentTryoutSession.schedule}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleStartTryout}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-orange-700 transition hover:-translate-y-px"
                >
                  <PlayCircle className="h-4 w-4" />
                  Mulai Tryout
                </button>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  Jawaban akan tersimpan otomatis selama sesi berlangsung.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-6">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/55 p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <Target className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Fokus Materi
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {studentTryoutSession.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TimerReset className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Strategi Ritme
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {studentTryoutSession.pacingNotes.map((note) => (
                    <div
                      key={note.label}
                      className="flex items-center justify-between rounded-2xl border border-white bg-white px-3 py-2.5 shadow-[0_12px_28px_-28px_rgba(15,23,42,0.32)]"
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

          <aside className="rounded-[28px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
            <div className="flex items-center gap-2 text-orange-600">
              <ListChecks className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Panduan Pengerjaan
              </p>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-800">
              Sebelum timer dimulai
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pastikan koneksi dan fokus belajar kamu sudah siap agar sesi
              tryout berjalan lancar dari awal sampai submit.
            </p>

            <div className="mt-5">
              <TryoutInstructionList items={studentTryoutSession.instructions} />
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[28px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
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
                  Soal {currentQuestionIndex + 1} dari{" "}
                  {studentTryoutSession.totalQuestions}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pilih satu jawaban terbaik. Kamu bebas melompat ke soal lain
                  lalu kembali lagi sebelum tryout dikirim.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isSubmitted ? (
                  <ReviewBadge
                    question={currentQuestion}
                    selectedOptionId={answers[currentQuestion.id]}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(currentQuestion.id)}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition",
                      bookmarkedIds.includes(currentQuestion.id)
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Flag className="h-4 w-4" />
                    {bookmarkedIds.includes(currentQuestion.id)
                      ? "Ditandai"
                      : "Tandai Review"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,247,237,0.72),rgba(255,255,255,1))] p-5">
              <p className="text-base leading-8 text-slate-700">
                {currentQuestion.prompt}
              </p>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option) => {
                  const selectedOptionId = answers[currentQuestion.id];
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect =
                    isSubmitted && currentQuestion.correctOptionId === option.id;
                  const isIncorrectSelected =
                    isSubmitted && isSelected && !isCorrect;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() =>
                        handleSelectAnswer(currentQuestion.id, option.id)
                      }
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
                    : "border-dashed border-orange-200 bg-white/80",
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ArrowLeft className="h-4 w-4" />
                Soal Sebelumnya
              </button>

              <div className="flex flex-wrap gap-3">
                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitTryout}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px"
                  >
                    <SendHorizontal className="h-4 w-4" />
                    Kirim Tryout
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIndex((currentIndex) =>
                      Math.min(
                        currentIndex + 1,
                        studentTryoutSession.totalQuestions - 1,
                      ),
                    )
                  }
                  disabled={
                    currentQuestionIndex === studentTryoutSession.totalQuestions - 1
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Soal Berikutnya
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[28px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
              <div className="flex items-center gap-2 text-orange-600">
                <Clock3 className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Timer Tryout
                </p>
              </div>

              <div
                className={cn(
                  "mt-4 rounded-[24px] border px-4 py-4",
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

            <section className="rounded-[28px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
              <div className="flex items-center gap-2 text-orange-600">
                <Target className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Progres Jawaban
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
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

            <section className="rounded-[28px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
              <div className="flex items-center gap-2 text-orange-600">
                <Flag className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Navigasi Soal
                </p>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2.5">
                {studentTryoutSession.questions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition",
                      getPaletteClass({
                        isCurrent: currentQuestionIndex === index,
                        isAnswered: Boolean(answers[question.id]),
                        isBookmarked: bookmarkedIds.includes(question.id),
                      }),
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  Soal yang sedang dibuka
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  Sudah dijawab
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  Ditandai untuk review
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </StudentLearningShell>
  );
}
