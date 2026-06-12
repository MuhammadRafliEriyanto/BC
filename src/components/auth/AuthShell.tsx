import type { ReactNode } from "react";

import Image from "next/image";
import { Poppins } from "next/font/google";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FaGraduationCap } from "react-icons/fa";

import { AppLogo } from "@/components/shared/app-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const authPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "showcase" | "immersive" | "compact";
  panelClassName?: string;
  bodyClassName?: string;
};

const authHighlights = [
  {
    icon: ShieldCheck,
    title: "Satu login, empat role",
    description: "Owner, admin, guru, dan siswa memakai pintu masuk yang sama dengan redirect otomatis.",
  },
  {
    icon: Mail,
    title: "Email verification aktif",
    description: "Akun baru harus diverifikasi dulu sebelum bisa mengakses dashboard.",
  },
  {
    icon: Sparkles,
    title: "UI tetap konsisten",
    description: "Bahasa visual mengikuti tema orange LMS yang sudah Anda bangun.",
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  variant = "default",
  panelClassName,
  bodyClassName,
}: AuthShellProps) {
  if (variant === "immersive") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/landing-hero-bimbel.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.02] object-cover object-center opacity-92 blur-[2.5px] saturate-[0.9] brightness-[0.72]"
          />
          <div className="absolute inset-0 bg-slate-950/42" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(15,23,42,0.06)_32%,rgba(15,23,42,0.24)_68%,rgba(15,23,42,0.42)_100%)]" />
          <div className="absolute -left-12 top-16 size-56 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -right-10 top-10 size-72 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 size-80 -translate-x-1/2 rounded-full bg-rose-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div
            className={cn(
              "w-full max-w-[640px] rounded-[34px] border border-white/14 bg-white/12 p-2.5 shadow-[0_34px_90px_-44px_rgba(15,23,42,0.62)] backdrop-blur-xl",
              panelClassName,
            )}
          >
            <Card className="rounded-[28px] border-white/55 bg-white/92 shadow-[0_28px_64px_-42px_rgba(15,23,42,0.32),0_18px_34px_-28px_rgba(249,115,22,0.18)]">
              <CardContent className="p-5 sm:p-6 md:p-7">
                <div>
                  <div className="mb-4 flex justify-center">
                    <div className="relative inline-flex rounded-[24px] border border-orange-100/80 bg-white px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.16)]">
                      <div className="absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),rgba(255,255,255,0)_68%)]" />
                      <div className="relative flex items-center justify-center">
                        <div className="flex size-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(255,237,213,0.95),rgba(255,247,237,0.92))] text-orange-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                          <FaGraduationCap className="size-5" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.9rem]">
                    {title}
                  </h1>
                  <p className="mt-2 text-center text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>

                <div className={cn("mt-5", bodyClassName)}>{children}</div>

                {footer ? <div className="mt-5">{footer}</div> : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (variant === "showcase") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/landing-hero-bimbel.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.04] object-cover object-center opacity-95 saturate-[0.92] brightness-[0.72]"
          />
          <div className="absolute inset-0 bg-slate-950/36 backdrop-blur-[1.5px]" />
          <div className="absolute -left-12 top-16 size-52 rounded-full bg-orange-500/8 blur-3xl" />
          <div className="absolute -right-8 top-12 size-64 rounded-full bg-amber-400/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 size-72 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(15,23,42,0.04)_28%,rgba(15,23,42,0.16)_62%,rgba(15,23,42,0.3)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(15,23,42,0.14),rgba(15,23,42,0))]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.14)_58%,rgba(15,23,42,0.26)_100%)]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="w-full overflow-hidden rounded-[36px] border border-white/12 bg-white/10 shadow-[0_34px_90px_-44px_rgba(15,23,42,0.58)] backdrop-blur-xl">
            <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
              <div className="relative px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_36%),radial-gradient(circle_at_bottom,rgba(190,24,93,0.16),transparent_34%)]" />

                <div className="relative">
                  <div className="inline-flex rounded-full border border-white/18 bg-white/90 pr-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.36)] backdrop-blur">
                    <AppLogo />
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur">
                    <Sparkles className="size-3.5 text-orange-300" />
                    Portal Login LMS
                  </div>

                  <h1 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[3rem] lg:leading-[1.06]">
                    Masuk ke dashboard belajar dengan tampilan yang selaras dengan sistem LMS.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                    Gunakan email utama Anda untuk login ke portal Bina Cendekia. Alur sesi,
                    verifikasi, dan redirect dashboard tetap mengikuti sistem backend yang sudah
                    berjalan.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Portal", value: "Login LMS" },
                      { label: "Verifikasi", value: "Email aktif" },
                      { label: "Akses", value: "Role-based" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 text-white shadow-[0_20px_38px_-32px_rgba(15,23,42,0.42)] backdrop-blur"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white/92">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[30px] border border-white/14 bg-white/10 p-5 shadow-[0_24px_44px_-34px_rgba(15,23,42,0.42)] backdrop-blur">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                      Siap Digunakan
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      Login yang lebih ringkas, tetap aman.
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/72">
                      Halaman ini dibuat lebih selaras dengan tampilan `register-online`, tetapi
                      tetap fokus ke proses masuk akun tanpa menambah blok informasi yang terlalu
                      panjang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_30px_70px_-42px_rgba(15,23,42,0.32),0_18px_36px_-28px_rgba(249,115,22,0.2)] backdrop-blur sm:p-8">
                  <Badge
                    variant="secondary"
                    className="w-fit rounded-full bg-orange-50 text-orange-700"
                  >
                    {eyebrow}
                  </Badge>
                  <div className="mt-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                      {title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  </div>

                  <div className="mt-7">{children}</div>

                  {footer ? <div className="mt-6">{footer}</div> : null}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/62">
                  <CheckCircle2 className="size-4 text-orange-300" />
                  Redirect role-based tetap aktif
                  <ArrowRight className="size-4 text-white/30" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (variant === "compact") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-20 size-72 -translate-x-1/2 rounded-full bg-orange-50/80 blur-3xl" />
          <div className="absolute bottom-12 left-12 size-48 rounded-full bg-amber-50/70 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.05),rgba(255,255,255,0)_42%)]" />
        </div>

        <section
          className={cn(
            authPoppins.className,
            "relative w-full max-w-lg rounded-[28px] border border-orange-100/70 bg-white px-6 py-8 text-center shadow-[0_28px_70px_-40px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10",
            panelClassName,
          )}
        >
          <div className="flex justify-center">
            <div className="inline-flex rounded-full border border-orange-100 bg-orange-50/50 px-4 py-3 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.14)]">
              <AppLogo />
            </div>
          </div>

          {eyebrow ? (
            <Badge
              variant="secondary"
              className="mt-6 rounded-full border border-orange-100 bg-orange-50 px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-orange-700"
            >
              {eyebrow}
            </Badge>
          ) : null}

          <div className={cn("mt-6", bodyClassName)}>
            <h1 className="text-[1.85rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.15rem]">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-[15px]">
              {description}
            </p>
            <div className="mt-7">{children}</div>
          </div>

          {footer ? <div className="mt-7 flex justify-center">{footer}</div> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface-panel w-full overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden border-b border-white/70 bg-gradient-to-br from-orange-50 via-amber-50 to-white px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:border-orange-100/70 lg:px-10 lg:py-10">
            <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_62%)]" />
            <div className="relative">
              <AppLogo />
              <Badge variant="info" className="mt-6 w-fit">
                Portal Authentication LMS
              </Badge>
              <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
                Akses akun Bimbel dengan alur yang rapi, aman, dan mudah dipahami.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
                Flow login dan registrasi ini dibuat khusus untuk kebutuhan LMS/Bimbel Anda tanpa
                mengganggu dashboard yang sudah ada.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Role aktif", value: "4 role" },
                  { label: "Security", value: "JWT + API key" },
                  { label: "Verifikasi", value: "Email required" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-orange-100/80 bg-white/80 px-4 py-4 shadow-[0_16px_34px_-26px_rgba(249,115,22,0.28)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {authHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-4 rounded-[24px] border border-white/80 bg-white/84 px-4 py-4 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.14)] backdrop-blur"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <Card className="border-orange-100/80 bg-white/96 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.24),0_18px_40px_-34px_rgba(249,115,22,0.28)]">
              <CardContent className="p-6 sm:p-7">
                <Badge variant="secondary" className="w-fit bg-slate-100/90 text-slate-700">
                  {eyebrow}
                </Badge>
                <div className="mt-5">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                </div>

                <div className="mt-7">{children}</div>

                {footer ? <div className="mt-6">{footer}</div> : null}
              </CardContent>
            </Card>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              <CheckCircle2 className="size-4 text-orange-500" />
              Redirect role-based dari backend tetap dipertahankan
              <ArrowRight className="size-4 text-slate-300" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
