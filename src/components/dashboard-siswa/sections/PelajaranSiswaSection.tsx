"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Eye,
  FileText,
  Send,
  TimerReset,
} from "lucide-react";

import {
  studentQuizzes,
} from "../data/learning-data";
import { useStudentLearningData } from "../data/useStudentLearningData";
import { studentTryoutSession } from "../data/tryout-data";

type TabKey = "materi" | "tugas" | "kuis" | "tryout";

type TabConfig = {
  key: TabKey;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  href: string;
};

const tabs: TabConfig[] = [
  {
    key: "materi",
    label: "Daftar Materi",
    shortLabel: "Materi",
    icon: BookOpen,
    href: "/dashboard-siswa/materi",
  },
  {
    key: "tugas",
    label: "Daftar Tugas",
    shortLabel: "Tugas",
    icon: FileText,
    href: "/dashboard-siswa/tugas",
  },
  {
    key: "kuis",
    label: "Daftar Kuis",
    shortLabel: "Kuis",
    icon: Award,
    href: "/dashboard-siswa/kuis",
  },
  {
    key: "tryout",
    label: "Sesi Tryout",
    shortLabel: "Tryout",
    icon: TimerReset,
    href: "/dashboard-siswa/tryout",
  },
];

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-b-[22px] bg-white px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SectionAction({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function PelajaranSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("materi");
  const { materials, tasks, isLoading, loadError } = useStudentLearningData();

  const activeTabConfig = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) ?? tabs[0],
    [activeTab],
  );

  const summaryLabel = useMemo(() => {
    if (isLoading) {
      return "Memuat data pelajaran...";
    }

    if (activeTab === "materi")
      return `${materials.length} materi tersedia`;
    if (activeTab === "tugas") return `${tasks.length} tugas aktif`;
    if (activeTab === "kuis") return `${studentQuizzes.length} kuis tersedia`;
    return `${studentTryoutSession.totalQuestions} soal tryout aktif`;
  }, [activeTab, isLoading, materials.length, tasks.length]);

  const renderMateri = () => {
    if (isLoading) {
      return (
        <EmptyState
          title="Memuat materi"
          description="Sistem sedang mengambil materi terbaru dari kelas kamu."
        />
      );
    }

    if (materials.length === 0) {
      return (
        <EmptyState
          title="Belum ada materi"
          description={
            loadError ??
            "Materi pembelajaran belum diunggah oleh guru untuk kelas kamu."
          }
        />
      );
    }

    return (
      <div className="space-y-3 bg-white p-4 md:p-5">
        {materials.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-orange-100/80 px-4 py-4 transition hover:border-orange-200 hover:bg-orange-50/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  {item.mapel}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                  Pertemuan {item.pertemuan}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {item.durasi}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-slate-800">
                {item.judul}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Materi siap dibaca untuk penguatan konsep dan latihan mandiri.
              </p>
            </div>

            <Link
              href={item.href}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-px"
            >
              <Eye className="h-3.5 w-3.5" />
              Baca Materi
            </Link>
          </article>
        ))}
      </div>
    );
  };

  const renderTugas = () => {
    if (isLoading) {
      return (
        <EmptyState
          title="Memuat tugas"
          description="Sistem sedang mengambil tugas terbaru dari kelas kamu."
        />
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          title="Belum ada tugas"
          description={
            loadError ??
            "Tugas mandiri maupun kelompok belum ditambahkan oleh guru kelas kamu."
          }
        />
      );
    }

    return (
      <div className="space-y-3 bg-white p-4 md:p-5">
        {tasks.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-orange-100/80 px-4 py-4 transition hover:border-orange-200 hover:bg-orange-50/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  {item.mapel}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                  Pertemuan {item.pertemuan}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-slate-800">
                {item.judul}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Batas pengumpulan pada {item.deadline}.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={item.detailHref}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" />
                Detail
              </Link>
              <Link
                href={item.submitHref}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-px"
              >
                <Send className="h-3.5 w-3.5" />
                Kirim Tugas
              </Link>
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderKuis = () => {
    if (studentQuizzes.length === 0) {
      return (
        <EmptyState
          title="Belum ada kuis"
          description="Kuis, ujian, atau latihan berkala akan muncul di sini saat dirilis oleh guru."
        />
      );
    }

    return (
      <div className="space-y-3 bg-white p-4 md:p-5">
        {studentQuizzes.map((quiz) => (
          <article
            key={quiz.id}
            className="flex flex-col gap-3 rounded-2xl border border-orange-100/80 px-4 py-4 transition hover:border-orange-200 hover:bg-orange-50/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  {quiz.mapel}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                  {quiz.jumlahSoal} soal
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-slate-800">
                {quiz.judul}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                {quiz.jadwal}
              </p>
            </div>

            <Link
              href={quiz.href}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-px"
            >
              <Award className="h-3.5 w-3.5" />
              Lihat Kuis
            </Link>
          </article>
        ))}
      </div>
    );
  };

  const renderTryout = () => {
    return (
      <div className="space-y-3 bg-white p-4 md:p-5">
        <article className="flex flex-col gap-4 rounded-2xl border border-orange-100/80 px-4 py-4 transition hover:border-orange-200 hover:bg-orange-50/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  {studentTryoutSession.subject}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                  {studentTryoutSession.totalQuestions} soal
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  {studentTryoutSession.durationMinutes} menit
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-slate-800">
                {studentTryoutSession.title}
              </h4>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                {studentTryoutSession.availability}
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500">
                Target
              </p>
              <p className="mt-1 text-sm font-semibold text-orange-700">
                {studentTryoutSession.targetScore}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">
              {studentTryoutSession.code}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">
              {studentTryoutSession.mode}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={studentTryoutSession.href}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-px"
            >
              <TimerReset className="h-3.5 w-3.5" />
              Masuk Tryout
            </Link>
            <Link
              href={studentTryoutSession.href}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Lihat UI
            </Link>
          </div>
        </article>
      </div>
    );
  };

  return (
    <section className="rounded-[24px] border border-orange-100/90 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18),0_12px_24px_-22px_rgba(249,115,22,0.12)] md:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
            Aktivitas Belajar
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-800">
            Materi, tugas, kuis, dan tryout siswa
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700">
            {summaryLabel}
          </span>
          <SectionAction
            href={activeTabConfig.href}
            label={`Lihat semua ${activeTabConfig.shortLabel.toLowerCase()}`}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,247,237,0.9),rgba(255,255,255,1))]">
        <div className="flex flex-wrap border-b border-orange-100 bg-orange-50/60">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 border-r border-orange-100 px-4 py-3 text-sm font-medium transition last:border-r-0 ${
                  isActive
                    ? "border-t-[3px] border-t-orange-500 bg-white text-orange-700"
                    : "border-t-[3px] border-t-transparent text-slate-600 hover:bg-white/70 hover:text-orange-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "materi" && renderMateri()}
        {activeTab === "tugas" && renderTugas()}
        {activeTab === "kuis" && renderKuis()}
        {activeTab === "tryout" && renderTryout()}
      </div>
    </section>
  );
}
