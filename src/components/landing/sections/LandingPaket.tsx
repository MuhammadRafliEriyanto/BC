import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Clock3,
  Gem,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  ONLINE_PACKAGES,
  formatRupiah,
  type OnlinePackageKey,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type PackageCardMeta = {
  badge: string;
  label: string;
  accent: string;
  icon: LucideIcon;
  benefits: string[];
  status: string;
  note: string;
  buttonLabel: string;
  spotlight?: boolean;
};

const packageCardMeta: Record<OnlinePackageKey, PackageCardMeta> = {
  "1-bulan": {
    badge: "Starter",
    label: "Mulai dari adaptasi yang ringan dulu.",
    accent:
      "from-orange-100/95 via-white to-amber-50/90 border-orange-100/80 shadow-[0_28px_60px_-42px_rgba(249,115,22,0.18)]",
    icon: Sparkles,
    benefits: [
      "Cocok untuk coba ritme belajar dan mengenal sistem kelas lebih dulu.",
      "Nominal awal terasa lebih ringan untuk tahap eksplorasi program.",
      "Pas untuk evaluasi awal sebelum lanjut ke durasi yang lebih panjang.",
    ],
    status: "Tanpa komitmen panjang",
    note: "Pilihan awal yang aman untuk siswa yang masih menyesuaikan jadwal belajar.",
    buttonLabel: "Coba Paket Ini",
  },
  "3-bulan": {
    badge: "Recommended",
    label: "Paling seimbang untuk progres rutin tiap minggu.",
    accent:
      "from-rose-100/95 via-white to-orange-50/92 border-orange-200/90 shadow-[0_40px_80px_-42px_rgba(190,24,93,0.28)]",
    icon: BadgeCheck,
    benefits: [
      "Durasi cukup panjang untuk melihat progres belajar yang lebih terasa.",
      "Pilihan paling pas untuk siswa yang ingin ritme belajar tetap konsisten.",
      "Jadi paket default di form daftar karena paling seimbang untuk mayoritas siswa.",
    ],
    status: "Paling sering dipilih",
    note: "Cocok untuk siswa yang sudah siap belajar lebih rutin tanpa terasa terlalu berat.",
    buttonLabel: "Pilih Favorit Ini",
    spotlight: true,
  },
  "6-bulan": {
    badge: "Commitment",
    label: "Lebih panjang untuk target yang ingin dijaga terus.",
    accent:
      "from-amber-100/95 via-white to-orange-50/90 border-orange-100/80 shadow-[0_28px_60px_-42px_rgba(245,158,11,0.18)]",
    icon: Gem,
    benefits: [
      "Pas untuk target belajar yang butuh kesinambungan lebih panjang.",
      "Membantu siswa menjaga momentum tanpa sering ganti keputusan paket.",
      "Durasi aktif paling panjang untuk progres yang ingin terus dipantau.",
    ],
    status: "Durasi aktif terpanjang",
    note: "Pilihan tepat untuk komitmen jangka menengah yang lebih stabil sampai beberapa bulan.",
    buttonLabel: "Ambil Paket Ini",
  },
  "12-bulan": {
    badge: "Annual",
    label: "Paket tahunan untuk siswa yang ingin ritme belajar stabil sepanjang tahun.",
    accent:
      "from-slate-100/95 via-white to-orange-50/92 border-slate-200/90 shadow-[0_34px_72px_-44px_rgba(15,23,42,0.22)]",
    icon: ShieldCheck,
    benefits: [
      "Cocok untuk target belajar jangka panjang yang ingin dijaga lebih konsisten.",
      "Memberi ruang progres yang lebih matang tanpa sering mengganti paket.",
      "Pas untuk komitmen tahunan agar fokus belajar tetap berjalan penuh.",
    ],
    status: "Komitmen penuh 1 tahun",
    note: "Pilihan paling panjang untuk keluarga yang sudah yakin dengan ritme belajar dan ingin satu keputusan yang lebih tenang.",
    buttonLabel: "Ambil Paket Tahunan",
  },
};

const packageFacts = [
  {
    icon: BookOpenCheck,
    title: "4 pilihan membership",
    description: "Semua paket tetap mengikuti flow siswa baru yang sama: daftar, bayar, lalu aktif.",
  },
  {
    icon: Clock3,
    title: "Durasi 1, 3, 6, dan 12 bulan",
    description: "Tinggal pilih ritme belajar yang paling pas dengan kebutuhan dan target siswa.",
  },
  {
    icon: ShieldCheck,
    title: "Aktif setelah pembayaran paid",
    description: "Akses dashboard siswa baru dibuka ketika verifikasi dan konfirmasi pembayaran selesai.",
  },
] as const;

const singleMonthPackage = ONLINE_PACKAGES.find((item) => item.durationMonth === 1) ?? ONLINE_PACKAGES[0];

export default function LandingPaket() {
  return (
    <section id="paket" className="scroll-mt-28 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="group relative mx-auto max-w-3xl text-center">
          <div className="pointer-events-none absolute inset-x-10 -top-3 h-24 rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.18),rgba(255,255,255,0))] blur-3xl transition duration-500 group-hover:scale-105 group-hover:opacity-100" />

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.9rem] lg:leading-[1.08]">
            <span className="inline-block transition duration-300 group-hover:-translate-y-0.5">
              Pilihan&nbsp;
            </span>
            <span className="relative inline-block bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] bg-clip-text text-transparent">
              Paket
              <span className="absolute -bottom-2 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,rgba(249,115,22,0.95),rgba(245,158,11,0.45))] transition-all duration-300 group-hover:w-full" />
            </span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Empat pilihan membership ini mengikuti flow yang sudah kamu bangun: pilih durasi,
            lanjut pembayaran manual, lalu akses siswa aktif saat status pembayaran sudah
            terkonfirmasi.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-20 size-48 rounded-full bg-orange-100/50 blur-3xl" />
            <div className="absolute right-0 top-8 size-56 rounded-full bg-rose-100/45 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 size-56 -translate-x-1/2 rounded-full bg-amber-100/40 blur-3xl" />
          </div>

          <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
            {ONLINE_PACKAGES.map((item, index) => {
              const meta = packageCardMeta[item.packageKey];
              const Icon = meta.icon;
              const monthlyPrice = Math.round(item.amount / item.durationMonth);
              const savings =
                singleMonthPackage.amount * item.durationMonth - item.amount;

              return (
                <Link
                  key={item.packageKey}
                  href={`/register-online?package=${item.packageKey}`}
                  className="group/card block rounded-[30px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden rounded-[30px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92))] transition-all duration-500 hover:border-orange-200 hover:shadow-[0_42px_78px_-42px_rgba(249,115,22,0.26)]",
                      meta.accent,
                      meta.spotlight
                        ? "z-20 xl:-translate-y-7 xl:hover:-translate-y-9"
                        : "xl:translate-y-4 xl:hover:-translate-y-2",
                    )}
                    style={{
                      transitionDelay: `${index * 80}ms`,
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(249,115,22,0.9),rgba(245,158,11,0.42),rgba(190,24,93,0.75))]" />
                      <div className="absolute -right-8 top-8 size-32 rounded-full bg-white/70 blur-3xl opacity-70 transition duration-500 group-hover/card:scale-110" />
                      <div className="absolute bottom-0 left-0 h-32 w-full bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.86))]" />
                    </div>

                    {meta.spotlight ? (
                      <div className="absolute right-5 top-5 z-10 rounded-full border border-orange-200/80 bg-white/92 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600 shadow-[0_16px_32px_-24px_rgba(249,115,22,0.32)]">
                        Paling Dipilih
                      </div>
                    ) : null}

                    <CardContent className="relative flex h-full flex-col p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                            {meta.badge}
                          </p>
                          <h3 className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-950">
                            {item.packageName}
                          </h3>
                          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">{meta.label}</p>
                        </div>

                        <div
                          className={cn(
                            "flex size-14 shrink-0 items-center justify-center rounded-[22px] text-white shadow-[0_18px_30px_-24px_rgba(190,24,93,0.34)] transition duration-300 group-hover/card:scale-105",
                            meta.spotlight
                              ? "bg-[linear-gradient(135deg,#9f1239_0%,#ea580c_100%)]"
                              : "bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)]",
                          )}
                        >
                          <Icon className="size-6" />
                        </div>
                      </div>

                      <div className="mt-6 rounded-[26px] border border-white/80 bg-white/82 p-5 shadow-[0_22px_38px_-32px_rgba(15,23,42,0.16)] backdrop-blur">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Total paket
                            </p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                              {formatRupiah(item.amount)}
                            </p>
                          </div>
                          <div className="rounded-[18px] bg-orange-50/80 px-3 py-2 text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500">
                              Per bulan
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                              {formatRupiah(monthlyPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                            Aktif {item.durationMonth} bulan
                          </span>
                          <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                            Payment manual
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        {meta.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-start gap-3 rounded-[20px] border border-white/75 bg-white/72 px-4 py-3 text-sm leading-6 text-slate-600 shadow-[0_16px_28px_-28px_rgba(15,23,42,0.18)] backdrop-blur transition duration-300 group-hover/card:bg-white/88"
                          >
                            <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                              <BookOpenCheck className="size-3.5" />
                            </span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-[22px] border border-dashed border-orange-200/80 bg-orange-50/70 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                              Status paket
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">{meta.status}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{meta.note}</p>
                          </div>
                          {savings > 0 ? (
                            <div className="rounded-[18px] bg-white px-3 py-2 text-right shadow-[0_16px_28px_-28px_rgba(249,115,22,0.24)]">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Lebih hemat
                              </p>
                              <p className="mt-1 text-sm font-semibold text-orange-600">
                                {formatRupiah(savings)}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3">
                        <div
                          className={cn(
                            "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-300",
                            meta.spotlight
                              ? "bg-[linear-gradient(135deg,#9f1239_0%,#ea580c_100%)] text-white shadow-[0_22px_36px_-24px_rgba(159,18,57,0.42)] group-hover/card:-translate-y-px group-hover/card:brightness-105"
                              : "border border-orange-100/80 bg-white/92 text-slate-800 group-hover/card:-translate-y-px group-hover/card:border-orange-200 group-hover/card:bg-orange-50 group-hover/card:text-orange-700",
                          )}
                        >
                          {meta.buttonLabel}
                          <ArrowRight className="size-4" />
                        </div>

                        <p className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {item.packageKey}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {packageFacts.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group/fact rounded-[24px] border border-orange-100/80 bg-white/88 px-5 py-5 shadow-[0_20px_38px_-32px_rgba(15,23,42,0.16)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_28px_44px_-30px_rgba(249,115,22,0.18)]"
                  style={{
                    transitionDelay: `${420 + index * 80}ms`,
                  }}
                >
                  <div className="flex size-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] text-white shadow-[0_18px_30px_-22px_rgba(249,115,22,0.34)] transition duration-300 group-hover/fact:scale-105">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}
