import { FilePenLine, Trophy } from "lucide-react";

import type { GradeStatus, TabelNilaiTableProps } from "./types";

function getGradeStatus(scoreAverage: number): GradeStatus {
  if (scoreAverage >= 85) {
    return "Sangat Baik";
  }

  if (scoreAverage >= 75) {
    return "Baik";
  }

  return "Perlu Bimbingan";
}

function getGradeStatusClass(status: GradeStatus) {
  if (status === "Sangat Baik") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Baik") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
}

function getAverageScore(scores: TabelNilaiTableProps["nilaiRows"][number]) {
  return Math.round(scores.tugas);
}

export default function TabelNilaiTable({
  nilaiRows,
  onEditNilai,
  participants,
}: TabelNilaiTableProps) {
  const rows = participants.map((student) => {
    const currentScore =
      nilaiRows.find((nilai) => nilai.studentId === student.id) ?? {
        studentId: student.id,
        tugas: 0,
        kuis: 0,
        uts: 0,
        uas: 0,
      };
    const average = getAverageScore(currentScore);

    return {
      average,
      name: student.name,
      scores: currentScore,
      status: getGradeStatus(average),
      studentId: student.id,
    };
  });

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-orange-200 bg-white px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-orange-100 bg-orange-50 text-orange-500">
          <Trophy className="h-5 w-5" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-700">
          Belum ada nilai siswa yang ditampilkan.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tabel nilai akan muncul setelah data evaluasi siswa tersedia dari backend.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-orange-100 bg-white shadow-[0_22px_48px_-38px_rgba(15,23,42,0.24)] transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/70 px-5 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 md:text-xl">
            Tabel Nilai
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Rekap nilai tugas siswa tersimpan dari backend. Kolom kuis, UTS,
            dan UAS tetap disiapkan untuk integrasi tahap berikutnya.
          </p>
        </div>
        <span className="inline-flex items-center border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {rows.length} baris nilai
        </span>
      </div>

      <div className="px-5 py-5 md:px-6">
        <div className="overflow-x-auto border border-orange-100">
          <table className="min-w-[1040px] w-full">
            <thead className="bg-orange-50/80 text-left">
              <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-4 font-semibold">No</th>
                <th className="px-4 py-4 font-semibold">Nama Siswa</th>
                <th className="px-4 py-4 font-semibold">Tugas</th>
                <th className="px-4 py-4 font-semibold">Kuis</th>
                <th className="px-4 py-4 font-semibold">UTS</th>
                <th className="px-4 py-4 font-semibold">UAS</th>
                <th className="px-4 py-4 font-semibold">Rata-rata</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.studentId}
                  className="border-t border-orange-100/80 text-sm transition hover:bg-orange-50/40"
                >
                  <td className="px-4 py-4 font-medium text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.scores.tugas}</td>
                  <td className="px-4 py-4 text-slate-600">{row.scores.kuis}</td>
                  <td className="px-4 py-4 text-slate-600">{row.scores.uts}</td>
                  <td className="px-4 py-4 text-slate-600">{row.scores.uas}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {row.average}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${getGradeStatusClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        title="Edit Nilai"
                        aria-label="Edit Nilai"
                        onClick={() => onEditNilai(row.studentId)}
                        className="inline-flex h-8 w-8 items-center justify-center border border-orange-200 bg-orange-50 text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
                      >
                        <FilePenLine className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
