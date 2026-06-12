"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock3, PlayCircle, Trophy } from "lucide-react";

import { studentQuizzes } from "../data/learning-data";
import FlexibleSubmissionPanel from "../learning/FlexibleSubmissionPanel";
import StudentLearningShell from "../learning/StudentLearningShell";

function getQuizStatusClass(status: (typeof studentQuizzes)[number]["status"]) {
  if (status === "Aktif") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "Akan Datang") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function KuisSiswaPageView() {
  const [selectedQuizId, setSelectedQuizId] = useState(studentQuizzes[0]?.id ?? "");

  const selectedQuiz =
    studentQuizzes.find((quiz) => quiz.id === selectedQuizId) ?? studentQuizzes[0];

  return (
    <StudentLearningShell
      title="Kuis dan Evaluasi"
      description="Kumpulkan semua kuis aktif, jadwal evaluasi berikutnya, dan riwayat hasil agar perkembangan belajar kamu bisa dipantau dengan lebih jelas."
      summary={`${studentQuizzes.length} kuis tersedia`}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <section className="rounded-[24px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
            Kuis Aktif
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-800">
            {studentQuizzes.filter((quiz) => quiz.status === "Aktif").length}
          </p>
        </section>
        <section className="rounded-[24px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
            Jadwal Berikutnya
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            28 Mei 2026, 08.00 WIB
          </p>
        </section>
        <section className="rounded-[24px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
            Skor Terakhir
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-800">88/100</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-[26px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
                Area Jawaban
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-800">
                {selectedQuiz?.judul ?? "Belum ada kuis"}
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getQuizStatusClass(
                selectedQuiz?.status ?? "Selesai",
              )}`}
            >
              {selectedQuiz?.status ?? "Tidak tersedia"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-500">
                Prompt Kuis
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {selectedQuiz?.prompt ??
                  "Pilih kuis untuk melihat petunjuk jawaban dan alur pengerjaannya."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Soal
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedQuiz?.jumlahSoal ?? 0} pertanyaan
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Durasi
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedQuiz?.durasi ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Jadwal
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedQuiz?.jadwal ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {selectedQuiz && (
          <FlexibleSubmissionPanel
            title="Mode Jawaban"
            description="Untuk kuis essay atau proyek, jawaban bisa dikirim langsung sebagai teks, lampiran file, atau link Drive."
            availableModes={selectedQuiz.answerModes}
            checklist={selectedQuiz.panduanJawaban}
            submitLabel="Kirim Jawaban Kuis"
            textPlaceholder="Tulis jawaban kuis, penjelasan, atau refleksi singkat di sini..."
            drivePlaceholder="https://drive.google.com/..."
            notePlaceholder="Tambahkan catatan untuk pengawas atau guru jika diperlukan..."
          />
        )}
      </div>

      <section className="rounded-[26px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)] md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
              Daftar Kuis
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-800">
              Kuis aktif, mendatang, dan selesai
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Pilih kuis untuk membuka detail dan mode jawaban yang sesuai.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {studentQuizzes.map((quiz) => (
            <article
              key={quiz.id}
              className={`rounded-[22px] border p-4 transition ${
                selectedQuiz?.id === quiz.id
                  ? "border-orange-200 bg-orange-50/50"
                  : "border-orange-100/80 hover:border-orange-200 hover:bg-orange-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                      {quiz.mapel}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getQuizStatusClass(
                        quiz.status,
                      )}`}
                    >
                      {quiz.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-semibold text-slate-800">
                    {quiz.judul}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {quiz.deskripsi}
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Soal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {quiz.jumlahSoal} pertanyaan
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Durasi
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {quiz.durasi}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5 text-orange-500" />
                  {quiz.jadwal}
                  {quiz.skor ? ` | Skor ${quiz.skor}` : ""}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuizId(quiz.id)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    Pilih
                  </button>
                  <Link
                    href={quiz.href}
                    className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition ${
                      quiz.status === "Aktif"
                        ? "bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 text-white shadow-sm hover:-translate-y-px"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    {quiz.status === "Aktif"
                      ? "Mulai Kuis"
                      : quiz.status === "Akan Datang"
                        ? "Lihat Jadwal"
                        : "Lihat Hasil"}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </StudentLearningShell>
  );
}
