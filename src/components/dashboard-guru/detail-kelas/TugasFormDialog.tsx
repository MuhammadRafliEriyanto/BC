"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { TugasFormDialogProps } from "./types";

export default function TugasFormDialog({
  attachmentMarkedForRemoval,
  draft,
  existingAttachmentName,
  mode,
  onAttachmentChange,
  onChange,
  onClearSelectedAttachment,
  onOpenChange,
  onRemoveExistingAttachment,
  onSubmit,
  open,
  selectedAttachmentName,
}: TugasFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-2 flex max-h-[calc(100dvh-1rem)] max-w-3xl translate-y-0 flex-col gap-0 rounded-[24px] border border-slate-200 bg-white p-0 shadow-lg sm:top-[50%] sm:max-h-[calc(100dvh-3rem)] sm:translate-y-[-50%]">
        <DialogHeader className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-orange-50/60 via-white to-amber-50/30 px-4 py-4 pr-14 text-left md:px-5">
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {mode === "add" ? "Tambah Tugas Pertemuan" : "Edit Tugas Pertemuan"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Atur tugas per pertemuan beserta lampiran file opsional. Jumlah pengumpulan dan status penilaian akan dihitung otomatis dari submission siswa dan nilai guru.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="grid gap-5 px-4 py-4 md:px-5 md:py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Pertemuan Ke
                <input
                  type="number"
                  min={1}
                  value={draft?.pertemuanKe ?? 1}
                  onChange={(event) =>
                    onChange("pertemuanKe", Number(event.target.value))
                  }
                  className="border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Deadline
                <input
                  type="date"
                  value={draft?.deadline ?? ""}
                  onChange={(event) => onChange("deadline", event.target.value)}
                  className="border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Judul Tugas
              <input
                type="text"
                value={draft?.judulTugas ?? ""}
                onChange={(event) => onChange("judulTugas", event.target.value)}
                placeholder="Contoh: Latihan Persamaan Linear"
                className="border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Deskripsi
              <textarea
                rows={5}
                value={draft?.deskripsi ?? ""}
                onChange={(event) => onChange("deskripsi", event.target.value)}
                placeholder="Tuliskan instruksi tugas, penjelasan singkat, atau catatan penilaian..."
                className="resize-none border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <div className="grid gap-3 border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Status Pengumpulan dan Penilaian Otomatis
              </p>
              <p className="text-sm leading-6 text-slate-500">
                Setelah tugas disimpan, sistem akan menghitung jumlah siswa yang
                mengumpulkan dari data submission real. Status penilaian juga
                akan berubah otomatis menjadi:
              </p>
              <div className="grid gap-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">
                    Belum Ada Pengumpulan
                  </span>{" "}
                  saat belum ada siswa yang submit.
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Belum Dinilai
                  </span>{" "}
                  saat sudah ada submission tetapi nilainya belum lengkap.
                </p>
                <p>
                  <span className="font-semibold text-slate-800">
                    Sudah Dinilai
                  </span>{" "}
                  saat semua submission pada tugas ini sudah dinilai.
                </p>
              </div>
            </div>

            <div className="grid gap-3 border border-slate-200 bg-slate-50/30 p-4 text-sm font-medium text-slate-700">
              <span>Lampiran Tugas Opsional</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt,.csv"
                onChange={(event) =>
                  onAttachmentChange(event.target.files?.[0] ?? null)
                }
                className="border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 file:mr-3 file:border-0 file:bg-slate-50 file:px-3 file:py-2 file:font-semibold file:text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
              {selectedAttachmentName ? (
                <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="break-all">File baru: {selectedAttachmentName}</span>
                  <button
                    type="button"
                    onClick={onClearSelectedAttachment}
                    className="w-fit font-semibold text-slate-600 hover:underline"
                  >
                    Batalkan file baru
                  </button>
                </div>
              ) : existingAttachmentName && !attachmentMarkedForRemoval ? (
                <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="break-all">Lampiran tersimpan: {existingAttachmentName}</span>
                  <button
                    type="button"
                    onClick={onRemoveExistingAttachment}
                    className="w-fit font-semibold text-rose-600 hover:underline"
                  >
                    Hapus lampiran
                  </button>
                </div>
              ) : attachmentMarkedForRemoval ? (
                <p className="text-xs text-rose-600">
                  Lampiran lama akan dihapus saat tugas disimpan.
                </p>
              ) : (
                <p className="text-xs leading-5 text-slate-400">
                  Lampiran tugas boleh kosong jika guru hanya ingin memberi instruksi teks.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-5">
          <DialogClose asChild>
            <button
              type="button"
              className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-orange-50/40 sm:w-auto"
            >
              Batal
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={onSubmit}
            className="w-full border border-orange-400 bg-white via-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.02] sm:w-auto"
          >
            {mode === "add" ? "Simpan Tugas" : "Update Tugas"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
