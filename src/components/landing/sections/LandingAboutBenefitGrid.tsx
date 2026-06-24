"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSyncExternalStore } from "react";

import { landingBenefits } from "@/components/landing/landing-page-data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const aboutCardMeta = [
  {
    accent: "from-orange-500 to-amber-400",
    chip: "Suasana belajar",
    title: "Pendekatan belajar dibuat lebih personal dan lebih menenangkan.",
    detail:
      "Bina Cendekia membangun suasana bimbel yang terasa dekat, hangat, dan tidak kaku supaya siswa lebih nyaman belajar dan orang tua lebih mudah percaya dengan prosesnya.",
    points: [
      "Pendampingan dibuat terasa akrab sehingga siswa tidak cepat tertekan.",
      "Bahasa dan alur informasi disusun sederhana agar orang tua mudah mengikuti.",
      "Setiap program diarahkan supaya ritme belajar terasa konsisten, bukan terburu-buru.",
    ],
    primaryHref: "#program",
    primaryLabel: "Lihat Program",
    secondaryHref: "/register",
    secondaryLabel: "Daftar Online",
  },
  {
    accent: "from-rose-500 to-orange-500",
    chip: "Arah belajar",
    title: "Informasi program dan jenjang dibuat lebih mudah dipahami sejak awal.",
    detail:
      "Calon siswa bisa langsung melihat program belajar per jenjang tanpa harus menebak-nebak alurnya. Ini membantu keputusan belajar terasa lebih mantap dari awal kunjungan.",
    points: [
      "Jenjang SD, SMP, SMA, dan UTBK ditampilkan lebih jelas.",
      "Setiap kartu program punya fokus dan manfaat yang mudah dibaca.",
      "Landing page tetap ringkas, tetapi tetap memberi cukup konteks untuk memilih langkah berikutnya.",
    ],
    primaryHref: "#program",
    primaryLabel: "Lihat Detail Program",
    secondaryHref: "#paket",
    secondaryLabel: "Lihat Paket",
  },
  {
    accent: "from-amber-500 to-orange-500",
    chip: "Flow membership",
    title: "Alur pendaftaran dan membership tetap aman tanpa bikin bingung pengguna.",
    detail:
      "Walau tampilan landing dibuat lebih ramah, proses daftar, verifikasi, dan aktivasi tetap mengikuti alur yang rapi supaya akses siswa baru dibuka pada tahap yang benar.",
    points: [
      "Data siswa, pilihan program, dan membership tetap diisi berurutan.",
      "Verifikasi email dan pembayaran tetap jadi bagian penting sebelum akses aktif.",
      "Tampilan tetap terasa ringan meski logic membership di belakangnya tetap tertata.",
    ],
    primaryHref: "#pendaftaran",
    primaryLabel: "Lihat Alur Daftar",
    secondaryHref: "/register",
    secondaryLabel: "Mulai Daftar",
  },
  {
    accent: "from-orange-500 to-yellow-400",
    chip: "Visual landing",
    title: "Tampilan dibuat lebih clean supaya fokus pengguna tidak pecah.",
    detail:
      "Perubahan visual di landing page diarahkan untuk menonjolkan hal yang paling penting: program, alur pendaftaran, dan pilihan paket. Hasilnya terasa lebih rapi tanpa mengubah identitas Bina Cendekia.",
    points: [
      "Komponen utama diberi hirarki visual yang lebih jelas.",
      "Aksen warna tetap hangat dan konsisten dengan tema yang sudah ada.",
      "User tetap bisa eksplor halaman tanpa merasa penuh atau berlebihan.",
    ],
    primaryHref: "#paket",
    primaryLabel: "Lihat Paket",
    secondaryHref: "#home",
    secondaryLabel: "Kembali ke Atas",
  },
] as const;

function getCardClassName(index: number) {
  return [
    "relative h-full overflow-hidden border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,252,248,0.96))] transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_28px_42px_-30px_rgba(249,115,22,0.22)]",
    index === 1
      ? "md:-translate-y-2 border-orange-200/80 shadow-[0_22px_36px_-30px_rgba(249,115,22,0.16)]"
      : "",
  ]
    .join(" ")
    .trim();
}

function AboutBenefitCard({
  index,
}: {
  index: number;
}) {
  const item = landingBenefits[index];
  const Icon = item.icon;
  const meta = aboutCardMeta[index];

  return (
    <Card className={getCardClassName(index)}>
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${meta.accent}`}
      />

      <CardContent className="flex h-full flex-col px-6 py-6">
        <div className="flex items-start">
          <div
            className={`flex size-12 items-center justify-center rounded-[20px] bg-gradient-to-br text-white shadow-[0_16px_24px_-18px_rgba(249,115,22,0.38)] transition-transform duration-300 group-hover:scale-105 ${meta.accent}`}
          >
            <Icon className="size-5" />
          </div>
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
          {item.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
          {item.description}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-orange-100/80 pt-4 text-sm font-semibold text-slate-500 transition group-hover:text-orange-700">
          <span>Lihat lebih lanjut</span>
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function StaticGrid() {
  return (
    <>
      {landingBenefits.map((item, index) => (
        <div key={item.title} className="group block h-full w-full text-left">
          <AboutBenefitCard index={index} />
        </div>
      ))}
    </>
  );
}

function InteractiveGrid() {
  return (
    <>
      {landingBenefits.map((item, index) => {
        const meta = aboutCardMeta[index];

        return (
          <Dialog key={item.title}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
              >
                <AboutBenefitCard index={index} />
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,244,0.97))] p-0">
              <div className="relative overflow-hidden rounded-[32px]">
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${meta.accent}`}
                  />
                  <div className="absolute -left-10 top-0 size-44 rounded-full bg-orange-100/60 blur-3xl" />
                  <div className="absolute right-0 top-0 size-52 rounded-full bg-amber-100/50 blur-3xl" />
                </div>

                <div className="relative p-6 sm:p-8">
                  <DialogHeader>
                    <span className="inline-flex w-fit items-center rounded-full border border-orange-100 bg-orange-50/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                      {meta.chip}
                    </span>
                    <DialogTitle className="mt-4 max-w-2xl text-2xl leading-tight sm:text-[2rem]">
                      {meta.title}
                    </DialogTitle>
                    <DialogDescription className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                      {meta.detail}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-6 grid gap-3">
                    {meta.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-[22px] border border-orange-100/80 bg-white/88 px-4 py-4 text-sm leading-6 text-slate-600 shadow-[0_18px_32px_-30px_rgba(15,23,42,0.14)]"
                      >
                        {point}
                      </div>
                    ))}
                  </div>

                  <DialogFooter className="mt-7 border-t border-orange-100/80 pt-5">
                    <DialogClose asChild>
                      <Link
                        href={meta.secondaryHref}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-orange-100/80 bg-white px-5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-px hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                      >
                        {meta.secondaryLabel}
                      </Link>
                    </DialogClose>
                    <DialogClose asChild>
                      <Link
                        href={meta.primaryHref}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#b91c1c_0%,#ea580c_100%)] px-5 text-sm font-semibold text-white shadow-[0_22px_34px_-24px_rgba(185,28,28,0.38)] transition duration-300 hover:-translate-y-px hover:brightness-105"
                      >
                        {meta.primaryLabel}
                        <ArrowRight className="size-4" />
                      </Link>
                    </DialogClose>
                  </DialogFooter>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}

export default function LandingAboutBenefitGrid() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return mounted ? <InteractiveGrid /> : <StaticGrid />;
}
