import { AlertCircle, ClipboardCheck } from "lucide-react";

import { formatDisplayDate } from "./dummy";
import type { BelumDinilaiTableProps } from "./types";

export default function BelumDinilaiTable({
  kelasName,
  tasks,
  onGradeNow,
}: BelumDinilaiTableProps) {
  const pendingTasks = tasks.filter(
    (task) => task.statusPenilaian === "Belum Dinilai",
  );

  return (
    <div className="border border-orange-100 bg-white shadow-[0_22px_48px_-38px_rgba(15,23,42,0.24)] transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/70 px-5 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 md:text-xl">
            Peringatan Belum Dinilai
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring tugas kelas {kelasName} yang status penilaiannya masih
            tertunda berdasarkan data nilai backend.
          </p>
        </div>
        <span
          className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${
            pendingTasks.length > 0
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {pendingTasks.length > 0
            ? `${pendingTasks.length} tugas belum dinilai`
            : "Semua tugas aman"}
        </span>
      </div>

      <div className="px-5 py-5 md:px-6">
        {pendingTasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingTasks.map((task) => (
              <article
                key={task.id}
                className="border border-orange-100 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_22px_38px_-30px_rgba(249,115,22,0.28)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                      Pertemuan {task.pertemuanKe}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-800">
                      {task.judulTugas}
                    </h3>
                  </div>
                  <span className="inline-flex items-center border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    Belum Dinilai
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-500">
                  <p>
                    <span className="font-semibold text-slate-700">Kelas:</span>{" "}
                    {kelasName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Deadline:</span>{" "}
                    {formatDisplayDate(task.deadline)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">
                      Jumlah Mengumpulkan:
                    </span>{" "}
                    {task.jumlahMengumpulkan} siswa
                  </p>
                  <p>{task.deskripsi}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onGradeNow(task)}
                  className="mt-5 inline-flex items-center gap-1.5 border border-orange-400 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.02] hover:shadow-[0_18px_30px_-22px_rgba(249,115,22,0.55)]"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Nilai Sekarang
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-emerald-100 bg-emerald-50/70 px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-emerald-200 bg-white text-emerald-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-semibold text-emerald-700">
              Tidak ada tugas yang tertinggal untuk kelas ini.
            </p>
            <p className="mt-2 text-sm text-emerald-600/80">
              Semua tugas pada kelas {kelasName} sudah selesai dinilai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
