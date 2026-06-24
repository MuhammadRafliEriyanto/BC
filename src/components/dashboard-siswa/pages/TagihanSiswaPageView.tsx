"use client";

import { useEffect, useEffectEvent, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import HistoriTagihanSiswa from "../sections/HistoriTagihanSiswa";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MembershipRequestError,
  findPackageByName,
  formatDateLabel,
  membershipService,
  type MembershipStatusData,
} from "@/lib/subscription";

type MembershipOverview = {
  studentName: string;
  studentId: string;
  branch: string;
  className: string;
  program: string;
  packageName: string;
  durationLabel: string;
  startDate: string;
  endDate: string;
  accessStatus: MembershipStatusData["accessStatus"];
  accessLabel: string;
  paymentStatusLabel: string;
  daysRemainingLabel: string;
  paymentStatus: string | null;
};

const emptyOverview: MembershipOverview = {
  studentName: "Siswa",
  studentId: "-",
  branch: "-",
  className: "-",
  program: "-",
  packageName: "Belum ada membership aktif",
  durationLabel: "-",
  startDate: "-",
  endDate: "-",
  accessStatus: "not_registered",
  accessLabel: "Belum Terdaftar",
  paymentStatusLabel: "Belum ada tagihan",
  daysRemainingLabel: "-",
  paymentStatus: null,
};

function formatAccessLabel(accessStatus: MembershipStatusData["accessStatus"]) {
  switch (accessStatus) {
    case "active":
      return "Aktif";
    case "pending":
      return "Menunggu Aktivasi";
    case "expired":
      return "Masa Aktif Berakhir";
    case "not_registered":
      return "Belum Terdaftar";
    default:
      return "Belum Terdaftar";
  }
}

function formatAccessVariant(accessStatus: MembershipStatusData["accessStatus"]) {
  switch (accessStatus) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "expired":
      return "danger";
    case "not_registered":
      return "secondary";
    default:
      return "secondary";
  }
}

function formatPaymentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "paid":
      return "Pembayaran lunas";
    case "pending":
      return "Tagihan menunggu pembayaran";
    case "failed":
      return "Pembayaran perlu diulang";
    case "expired":
      return "Tagihan sudah kedaluwarsa";
    default:
      return "Belum ada tagihan";
  }
}

function buildMembershipOverview(
  data: MembershipStatusData | undefined | null,
): MembershipOverview {
  if (!data) {
    return emptyOverview;
  }

  const resolvedPackage =
    findPackageByName(data.subscription?.packageName) ??
    (data.subscription?.durationMonth
      ? {
          packageName: data.subscription.packageName,
          durationMonth: data.subscription.durationMonth,
          amount: data.payment?.amount ?? 0,
          packageKey: data.subscription.packageKey,
          highlight: "",
        }
      : null);

  return {
    studentName: data.student?.name?.trim() || data.user.nama,
    studentId: data.student?.id?.trim() || "-",
    branch: data.student?.branch?.trim() || "-",
    className: data.student?.className?.trim() || "-",
    program: data.student?.program?.trim() || "-",
    packageName: data.subscription?.packageName?.trim() || "Belum ada membership aktif",
    durationLabel: resolvedPackage
      ? `${resolvedPackage.durationMonth} bulan`
      : data.subscription?.durationMonth
        ? `${data.subscription.durationMonth} bulan`
        : "-",
    startDate: formatDateLabel(data.subscription?.startDate ?? null),
    endDate: formatDateLabel(data.subscription?.endDate ?? null),
    accessStatus: data.accessStatus,
    accessLabel: formatAccessLabel(data.accessStatus),
    paymentStatusLabel: formatPaymentStatusLabel(data.payment?.status),
    daysRemainingLabel:
      typeof data.daysRemaining === "number"
        ? `${data.daysRemaining} hari tersisa`
        : data.accessStatus === "expired"
          ? "Perlu perpanjangan"
          : "-",
    paymentStatus: data.payment?.status ?? null,
  };
}

function MembershipSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-[24px] border border-orange-100 bg-orange-50/40" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[24px] border border-slate-100 bg-slate-50"
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-100 bg-white px-4 py-4 shadow-sm transition hover:border-orange-100 hover:bg-orange-50/30">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{note}</p>
    </article>
  );
}

function PaymentPolicyCopy({
  accessStatus,
}: {
  accessStatus: MembershipStatusData["accessStatus"];
}) {
  if (accessStatus === "not_registered") {
    return (
      <>
        <p>
          Akun siswa ini belum memiliki membership awal di sistem baru. Untuk
          siswa lama, aktivasi membership pertama perlu dikonfirmasi admin
          terlebih dahulu.
        </p>
        <p>
          Setelah admin membuat membership awal, barulah tagihan dan tombol
          pembayaran akan tampil di halaman ini untuk dilanjutkan oleh siswa.
        </p>
      </>
    );
  }

  if (accessStatus === "pending") {
    return (
      <>
        <p>
          Membership siswa sudah tercatat, tetapi pembayaran atau aktivasinya
          masih menunggu penyelesaian.
        </p>
        <p>
          Jika ada tagihan pending, siswa bisa melanjutkan pembayaran dari card
          tagihan aktif atau dari tabel histori tagihan.
        </p>
      </>
    );
  }

  if (accessStatus === "expired") {
    return (
      <>
        <p>
          Masa aktif membership sudah berakhir. Saat tagihan perpanjangan
          dibuat, siswa bisa melanjutkan pembayarannya langsung dari card
          tagihan aktif di halaman tagihan.
        </p>
        <p>
          Selama belum ada tagihan pending, belum ada pembayaran yang perlu
          dilanjutkan saat ini.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        Membership siswa sedang aktif. Jika nanti dibuat tagihan perpanjangan,
        siswa bisa melanjutkan pembayaran dari card tagihan aktif atau tabel
        histori tagihan.
      </p>
      <p>
        Status tagihan dan masa aktif akan tersinkron otomatis setelah
        pembayaran terverifikasi.
      </p>
    </>
  );
}

export default function TagihanSiswaPageView() {
  const [overview, setOverview] = useState<MembershipOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadMembershipOverview = useEffectEvent(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await membershipService.getMySubscription();
      setOverview(buildMembershipOverview(response.data));
    } catch (requestError) {
      if (
        requestError instanceof MembershipRequestError &&
        (requestError.status === 401 || requestError.status === 403)
      ) {
        setError("Sesi login siswa tidak valid untuk membaca membership.");
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Gagal memuat ringkasan membership siswa.",
        );
      }

      setOverview(emptyOverview);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      void loadMembershipOverview();
    });
  }, [reloadKey]);

  useEffect(() => {
    if (overview.paymentStatus === "pending") {
      const intervalId = window.setInterval(() => {
        setReloadKey((k) => k + 1);
      }, 5000);
      return () => window.clearInterval(intervalId);
    }
  }, [overview.paymentStatus]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.2)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-600">
              <CreditCard className="h-3.5 w-3.5" />
              Tagihan Siswa
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
              Membership, Masa Aktif, dan Histori Pembayaran
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Pantau masa aktif membership dan lanjutkan pembayaran tagihan yang
              masih pending dari satu halaman yang lebih ringkas.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
            Status pembayaran tersinkron otomatis setelah gateway mengonfirmasi transaksi.
          </div>
        </div>
      </div>

      {isLoading ? <MembershipSkeleton /> : null}

      {!isLoading && error ? (
        <div className="flex flex-col gap-4 rounded-[24px] border border-red-100 bg-red-50/80 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Ringkasan membership belum bisa dimuat</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setReloadKey((currentValue) => currentValue + 1);
            }}
          >
            <RefreshCcw className="h-4 w-4" />
            Muat Ulang
          </Button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-red-600 to-orange-500" />

          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.55fr_1fr] lg:px-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-orange-600">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-semibold">Ringkasan Membership</p>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {overview.studentName}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    ID siswa {overview.studentId} | {overview.className} | {overview.branch}
                  </p>
                </div>

                <Badge variant={formatAccessVariant(overview.accessStatus)}>
                  {overview.accessLabel}
                </Badge>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
                      Paket Berjalan
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {overview.packageName}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-orange-500" />
                        Durasi {overview.durationLabel}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-orange-500" />
                        Program {overview.program}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    label="Status Akses"
                    value={overview.accessLabel}
                    note={overview.daysRemainingLabel}
                  />
                  <SummaryCard
                    label="Status Pembayaran"
                    value={overview.paymentStatusLabel}
                    note="Pembayaran terakhir yang tercatat pada membership siswa."
                  />
                  <SummaryCard
                    label="Mulai Aktif"
                    value={overview.startDate}
                    note="Tanggal mulai akses belajar untuk paket ini."
                  />
                  <SummaryCard
                    label="Berakhir"
                    value={overview.endDate}
                    note="Setelah tanggal ini, siswa perlu perpanjang membership."
                  />
                </div>
              </div>
            </div>

            <aside className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
              <div className="inline-flex items-center gap-2 text-orange-600">
                <CreditCard className="h-4 w-4" />
                <p className="text-sm font-semibold">Aturan Pembayaran Saat Ini</p>
              </div>

              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                <PaymentPolicyCopy accessStatus={overview.accessStatus} />
                <p className="rounded-2xl border border-dashed border-orange-200 bg-white px-3 py-3 text-slate-500">
                  Sistem saat ini masih memakai model sekali bayar per paket.
                  Opsi cicilan belum saya aktifkan supaya alurnya tetap sesuai
                  dengan backend yang sudah ada.
                </p>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      <div id="riwayat-tagihan">
        <HistoriTagihanSiswa />
      </div>
    </section>
  );
}
