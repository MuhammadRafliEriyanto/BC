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
      <DialogContent className="max-h-[90vh] max-w-3xl gap-0 rounded-none border border-orange-100 bg-white p-0 shadow-[0_28px_72px_-42px_rgba(15,23,42,0.4)]">
        <DialogHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50/90 via-white to-amber-50/70 px-4 py-4 pr-14 text-left md:px-5">
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {mode === "add" ? "Tambah Tugas Pertemuan" : "Edit Tugas Pertemuan"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Atur tugas per pertemuan beserta lampiran file opsional tanpa mengubah alur CRUD yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
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
                  className="border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Deadline
                <input
                  type="date"
                  value={draft?.deadline ?? ""}
                  onChange={(event) => onChange("deadline", event.target.value)}
                  className="border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
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
                className="border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Deskripsi
              <textarea
                rows={5}
                value={draft?.deskripsi ?? ""}
                onChange={(event) => onChange("deskripsi", event.target.value)}
                placeholder="Tuliskan instruksi tugas, penjelasan singkat, atau catatan penilaian..."
                className="resize-none border border-orange-100 bg-white px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Jumlah Mengumpulkan
                <input
                  type="number"
                  min={0}
                  value={draft?.jumlahMengumpulkan ?? 0}
                  onChange={(event) =>
                    onChange("jumlahMengumpulkan", Number(event.target.value))
                  }
                  className="border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Status Penilaian
                <select
                  value={draft?.statusPenilaian ?? "Belum Dinilai"}
                  onChange={(event) =>
                    onChange("statusPenilaian", event.target.value)
                  }
                  className="border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="Belum Dinilai">Belum Dinilai</option>
                  <option value="Sudah Dinilai">Sudah Dinilai</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 border border-orange-100 bg-orange-50/30 p-4 text-sm font-medium text-slate-700">
              <span>Lampiran Tugas Opsional</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt,.csv"
                onChange={(event) =>
                  onAttachmentChange(event.target.files?.[0] ?? null)
                }
                className="border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700 file:mr-3 file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:font-semibold file:text-orange-700 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
              {selectedAttachmentName ? (
                <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="break-all">File baru: {selectedAttachmentName}</span>
                  <button
                    type="button"
                    onClick={onClearSelectedAttachment}
                    className="w-fit font-semibold text-orange-600 hover:underline"
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

        <DialogFooter className="border-t border-orange-100 px-4 py-4 md:px-5">
          <DialogClose asChild>
            <button
              type="button"
              className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
            >
              Batal
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={onSubmit}
            className="w-full border border-orange-400 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-[1.02] sm:w-auto"
          >
            {mode === "add" ? "Simpan Tugas" : "Update Tugas"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
