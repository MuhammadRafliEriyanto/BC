"use client";

import { useState } from "react";
import {
  FileText,
  FileUp,
  Link2,
  MessageSquareText,
  Send,
  ShieldCheck,
} from "lucide-react";

import type { SubmissionMode } from "../data/learning-data";

type FlexibleSubmissionPanelProps = {
  title: string;
  description: string;
  availableModes: SubmissionMode[];
  checklist: string[];
  submitLabel: string;
  textPlaceholder: string;
  drivePlaceholder: string;
  notePlaceholder: string;
};

const modeMeta: Record<
  SubmissionMode,
  {
    label: string;
    icon: typeof FileText;
    helper: string;
  }
> = {
  file: {
    label: "Upload File",
    icon: FileUp,
    helper: "Unggah file tugas atau jawaban dalam format PDF, DOCX, atau gambar pendukung.",
  },
  text: {
    label: "Jawaban Teks",
    icon: MessageSquareText,
    helper: "Tulis jawaban langsung di halaman ini untuk jawaban singkat atau essay.",
  },
  drive: {
    label: "Link Drive",
    icon: Link2,
    helper: "Tempel link Google Drive atau dokumen online yang dapat diakses guru.",
  },
};

export default function FlexibleSubmissionPanel({
  title,
  description,
  availableModes,
  checklist,
  submitLabel,
  textPlaceholder,
  drivePlaceholder,
  notePlaceholder,
}: FlexibleSubmissionPanelProps) {
  const [activeMode, setActiveMode] = useState<SubmissionMode>(availableModes[0]);
  const resolvedActiveMode = availableModes.includes(activeMode)
    ? activeMode
    : availableModes[0];
  const activeMeta = modeMeta[resolvedActiveMode];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
          {title}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-800">
          Form jawaban fleksibel
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[20px] bg-white/90 p-1.5 shadow-sm ring-1 ring-orange-100/80">
        {availableModes.map((mode) => {
          const meta = modeMeta[mode];
          const Icon = meta.icon;
          const isActive = resolvedActiveMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => setActiveMode(mode)}
              className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-orange-100/90 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
            <activeMeta.icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              {activeMeta.label}
            </h4>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {activeMeta.helper}
            </p>
          </div>
        </div>

        {resolvedActiveMode === "file" && (
          <div className="mt-5 rounded-[24px] border border-dashed border-orange-200 bg-[linear-gradient(180deg,rgba(255,247,237,0.7),rgba(255,255,255,1))] px-5 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <FileUp className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Drag & drop file di sini
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Atau klik untuk memilih file dari perangkat kamu.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
            >
              Pilih File
            </button>
          </div>
        )}

        {resolvedActiveMode === "text" && (
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Jawaban Teks
            </label>
            <textarea
              rows={8}
              placeholder={textPlaceholder}
              className="mt-2 w-full rounded-[22px] border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
            />
          </div>
        )}

        {resolvedActiveMode === "drive" && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Link Google Drive
              </label>
              <input
                type="url"
                placeholder={drivePlaceholder}
                className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              />
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Pastikan akses file terbuka
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-700/90">
                Atur dokumen Drive menjadi dapat dilihat guru agar proses review tidak terhambat.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Catatan Tambahan
          </label>
          <textarea
            rows={4}
            placeholder={notePlaceholder}
            className="mt-2 w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Checklist sebelum kirim
              </p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-emerald-700/90">
                {checklist.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px"
        >
          <Send className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
