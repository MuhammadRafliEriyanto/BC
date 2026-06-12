"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Clock3,
  LoaderCircle,
  MailCheck,
  ShieldAlert,
} from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MembershipRequestError,
  formatDateLabel,
  formatRupiah,
  membershipService,
  type MembershipAccessStatus,
  type MembershipPayment,
  type MembershipStatusResponse,
  type MembershipStudent,
  type MembershipSubscription,
  type PaymentStatusResponse,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type RegisterOnlineStatusViewProps = {
  paymentId?: string | null;
  access?: string | null;
};

type StatusViewState = {
  student: MembershipStudent | null;
  subscription: MembershipSubscription | null;
  payment: MembershipPayment | null;
  accessStatus: MembershipAccessStatus;
  daysRemaining?: number | null;
};

type StatusMeta = {
  chip: string;
  icon: LucideIcon;
  chipClassName: string;
  iconClassName: string;
};

type PaymentMeta = {
  label: string;
  helper: string;
  chipClassName: string;
};

type ChecklistItem = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  isComplete?: boolean;
};

function getAccessStatusMeta(accessStatus: MembershipAccessStatus): StatusMeta {
  switch (accessStatus) {
    case "active":
      return {
        chip: "Akses Aktif",
        icon: BadgeCheck,
        chipClassName: "border border-amber-200/80 bg-amber-50/90 text-amber-700",
        iconClassName: "bg-amber-100 text-amber-700",
      };
    case "expired":
      return {
        chip: "Masa Aktif Selesai",
        icon: ShieldAlert,
        chipClassName: "border border-slate-200 bg-slate-100/90 text-slate-700",
        iconClassName: "bg-slate-100 text-slate-600",
      };
    case "not_registered":
      return {
        chip: "Belum Terdaftar",
        icon: AlertCircle,
        chipClassName: "border border-slate-200 bg-slate-100/90 text-slate-700",
        iconClassName: "bg-slate-100 text-slate-600",
      };
    default:
      return {
        chip: "Menunggu Pembayaran",
        icon: Clock3,
        chipClassName: "border border-orange-200/80 bg-orange-50/90 text-orange-700",
        iconClassName: "bg-orange-100 text-orange-700",
      };
  }
}

function getPaymentStatusMeta(
  status: MembershipPayment["status"] | undefined,
  xenditSessionStatus?: string | null,
): PaymentMeta {
  if (status === "paid") {
    return {
      label: "Sudah Dibayar",
      helper: "Tagihan sudah tercatat dan membership siap diproses lebih lanjut.",
      chipClassName: "border border-amber-200/80 bg-amber-50/90 text-amber-700",
    };
  }

  if (status === "failed" || status === "expired") {
    return {
      label: status === "expired" || xenditSessionStatus === "EXPIRED"
        ? "Checkout Kedaluwarsa"
        : "Perlu Pengecekan",
      helper:
        status === "expired" || xenditSessionStatus === "EXPIRED"
          ? "Checkout Xendit sudah kedaluwarsa. Buat proses pembayaran baru jika user masih ingin melanjutkan."
          : "Status pembayaran perlu ditinjau ulang sebelum aktivasi diteruskan.",
      chipClassName: "border border-slate-200 bg-slate-100/90 text-slate-700",
    };
  }

  if (xenditSessionStatus === "COMPLETED") {
    return {
      label: "Menunggu Verifikasi Webhook",
      helper:
        "Checkout sudah selesai di Xendit, tetapi sistem masih menunggu webhook resmi sebelum membership diaktifkan.",
      chipClassName: "border border-orange-200/80 bg-orange-50/90 text-orange-700",
    };
  }

  return {
    label: "Menunggu Pembayaran",
    helper: "Membership akan aktif setelah proses pembayaran selesai.",
    chipClassName: "border border-orange-200/80 bg-orange-50/90 text-orange-700",
  };
}

function getStatusCopy(accessStatus: MembershipAccessStatus) {
  switch (accessStatus) {
    case "active":
      return {
        title: "Membership sudah aktif",
        description:
          "Status langganan siswa sudah berjalan. Tinggal pastikan email diverifikasi agar akun siap login dengan mulus.",
      };
    case "expired":
      return {
        title: "Membership sudah berakhir",
        description:
          "Masa aktif paket telah selesai. User bisa memilih paket baru agar akses belajar kembali aktif tanpa mengubah data siswa.",
      };
    case "not_registered":
      return {
        title: "Belum ada membership aktif",
        description:
          "Belum ditemukan subscription aktif untuk akun ini. User bisa kembali ke alur daftar online dan memilih paket yang sesuai.",
      };
    default:
      return {
        title: "Tagihan sedang menunggu penyelesaian",
        description:
          "Payment sudah dibuat, tetapi membership belum aktif karena pembayaran masih menunggu konfirmasi.",
      };
  }
}

function getNextStepCopy(
  accessStatus: MembershipAccessStatus,
  paymentStatus: MembershipPayment["status"] | undefined,
  emailVerified: boolean,
  xenditSessionStatus?: string | null,
) {
  if (paymentStatus === "pending" && xenditSessionStatus === "COMPLETED") {
    return {
      title: "Checkout selesai, tinggal tunggu webhook resmi",
      description:
        "User sudah menyelesaikan checkout di Xendit. Sistem akan mengaktifkan membership setelah webhook resmi diterima backend.",
    };
  }

  if (paymentStatus === "pending") {
    return {
      title: "Selesaikan pembayaran untuk melanjutkan aktivasi",
      description:
        "Begitu tagihan selesai, status membership akan bergerak ke tahap berikutnya tanpa perlu mengulang form pendaftaran.",
    };
  }

  if (paymentStatus === "failed" || paymentStatus === "expired") {
    return {
      title: "Tagihan perlu dicek ulang",
      description:
        paymentStatus === "expired"
          ? "Checkout sudah kedaluwarsa. User bisa membuat proses pembayaran baru bila masih ingin melanjutkan aktivasi."
          : "Pembayaran belum tercatat dengan baik. User bisa meninjau ulang status tagihan atau membuat proses baru jika diperlukan.",
    };
  }

  if (accessStatus === "active" && !emailVerified) {
    return {
      title: "Verifikasi email jadi langkah terakhir",
      description:
        "Pembayaran dan membership sudah siap. Tinggal selesaikan verifikasi email agar akun siswa bisa langsung dipakai login.",
    };
  }

  if (accessStatus === "active") {
    return {
      title: "Akun siswa sudah siap dipakai",
      description:
        "Membership aktif dan verifikasi email sudah lengkap, jadi user bisa langsung lanjut ke halaman login kapan saja.",
    };
  }

  if (accessStatus === "expired") {
    return {
      title: "Pilih paket baru untuk memperpanjang akses",
      description:
        "Data siswa tetap aman tersimpan. User hanya perlu memilih paket baru bila ingin melanjutkan akses belajar.",
    };
  }

  return {
    title: "Mulai ulang dari paket yang paling sesuai",
    description:
      "Saat ini belum ada akses aktif yang siap dipakai. User bisa kembali ke halaman daftar online untuk memulai registrasi lagi.",
  };
}

function isXenditPaymentFlow(data: StatusViewState | null) {
  return data?.payment?.provider === "xendit" || Boolean(data?.payment?.xenditPaymentSessionId);
}

function isWaitingForXenditWebhook(data: StatusViewState | null) {
  return data?.payment?.status === "pending" && data?.payment?.xenditSessionStatus === "COMPLETED";
}

function mapPaymentResponse(data: PaymentStatusResponse["data"] | undefined): StatusViewState | null {
  if (!data) {
    return null;
  }

  return {
    student: data.student,
    subscription: data.subscription,
    payment: data.payment,
    accessStatus: data.accessStatus,
  };
}

function mapMembershipResponse(
  data: MembershipStatusResponse["data"] | undefined,
): StatusViewState | null {
  if (!data) {
    return null;
  }

  return {
    student: data.student,
    subscription: data.subscription,
    payment: data.payment,
    accessStatus: data.accessStatus,
    daysRemaining: data.daysRemaining,
  };
}

function formatMethodLabel(method?: string | null) {
  if (!method) {
    return "-";
  }

  return method
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusChip({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        className,
      )}
    >
      {label}
    </div>
  );
}

function ReadOnlyField({
  id,
  label,
  value,
  helper,
  className,
}: {
  id: string;
  label: string;
  value: string;
  helper?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        readOnly
        aria-readonly="true"
        className="mt-2 font-medium text-slate-800"
      />
      {helper ? <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p> : null}
    </div>
  );
}

export default function RegisterOnlineStatusView({
  paymentId,
  access,
}: RegisterOnlineStatusViewProps) {
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusData, setStatusData] = useState<StatusViewState | null>(null);

  const accessStatus =
    statusData?.accessStatus ??
    (access === "active" ||
    access === "pending" ||
    access === "expired" ||
    access === "not_registered"
      ? access
      : "pending");

  const paymentStatus = statusData?.payment?.status;
  const xenditSessionStatus = statusData?.payment?.xenditSessionStatus;
  const paymentIsPending = paymentStatus === "pending";
  const emailVerified = statusData?.student?.isEmailVerified ?? false;
  const xenditPaymentFlow = isXenditPaymentFlow(statusData);
  const waitingForWebhook = isWaitingForXenditWebhook(statusData);
  const checkoutUrl = statusData?.payment?.checkoutUrl?.trim() ?? "";

  const statusCopy = useMemo(() => getStatusCopy(accessStatus), [accessStatus]);
  const accessMeta = useMemo(() => getAccessStatusMeta(accessStatus), [accessStatus]);
  const paymentMeta = useMemo(
    () => getPaymentStatusMeta(paymentStatus, xenditSessionStatus),
    [paymentStatus, xenditSessionStatus],
  );
  const nextStepCopy = useMemo(
    () => getNextStepCopy(accessStatus, paymentStatus, emailVerified, xenditSessionStatus),
    [accessStatus, emailVerified, paymentStatus, xenditSessionStatus],
  );

  const statusChecklist = useMemo<ChecklistItem[]>(
    () => [
      {
        label: "Tagihan",
        value: paymentMeta.label,
        helper: paymentMeta.helper,
        icon: paymentStatus === "paid" ? BadgeCheck : Clock3,
        isComplete: paymentStatus === "paid",
      },
      {
        label: "Verifikasi Email",
        value: emailVerified ? "Sudah Diverifikasi" : "Belum Diverifikasi",
        helper: emailVerified
          ? "Akun siswa sudah melewati checkpoint verifikasi email."
          : "User masih perlu membuka email dan menyelesaikan verifikasi akun.",
        icon: emailVerified ? MailCheck : Clock3,
        isComplete: emailVerified,
      },
      {
        label: "Akses Belajar",
        value: accessMeta.chip,
        helper:
          accessStatus === "active"
            ? "Membership aktif dan siap dipakai untuk belajar."
            : accessStatus === "expired"
              ? "Akses selesai dan butuh paket baru untuk aktif kembali."
              : accessStatus === "not_registered"
                ? "Belum ada paket aktif yang tercatat untuk akun ini."
                : "Akses belajar akan aktif setelah pembayaran selesai.",
        icon: accessMeta.icon,
        isComplete: accessStatus === "active",
      },
    ],
    [accessMeta.chip, accessMeta.icon, accessStatus, emailVerified, paymentMeta.helper, paymentMeta.label, paymentStatus],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      setLoading(true);
      setErrorMessage("");

      try {
        if (paymentId) {
          const response = await membershipService.getPaymentStatus(paymentId);

          if (isMounted) {
            setStatusData(mapPaymentResponse(response.data));
          }
        } else {
          const response = await membershipService.getMySubscription();

          if (isMounted) {
            setStatusData(mapMembershipResponse(response.data));
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MembershipRequestError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Status membership belum dapat dimuat. Silakan coba lagi.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [paymentId]);

  useEffect(() => {
    if (!paymentId || !statusData?.payment || statusData.payment.status === "paid") {
      return;
    }

    let isMounted = true;
    const intervalId = window.setInterval(async () => {
      try {
        const response = await membershipService.getPaymentStatus(paymentId);

        if (!isMounted) {
          return;
        }

        setStatusData(mapPaymentResponse(response.data));
      } catch {
        // Let the next polling cycle retry without replacing the current UI state.
      }
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [paymentId, statusData]);

  async function handleConfirmPayment() {
    if (!paymentId) {
      return;
    }

    setConfirmingPayment(true);
    setErrorMessage("");

    try {
      if (xenditPaymentFlow) {
        if (!checkoutUrl) {
          throw new Error("Checkout Xendit belum tersedia untuk pembayaran ini.");
        }

        const checkoutWindow = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

        if (!checkoutWindow) {
          window.location.assign(checkoutUrl);
        }

        return;
      }

      const response = await membershipService.confirmPayment(paymentId);
      setStatusData(mapPaymentResponse(response.data));
    } catch (error) {
      if (error instanceof MembershipRequestError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Konfirmasi pembayaran dummy belum berhasil diproses.");
      }
    } finally {
      setConfirmingPayment(false);
    }
  }

  const AccessIcon = accessMeta.icon;
  const summaryDuration =
    typeof statusData?.daysRemaining === "number"
      ? `${statusData.daysRemaining} hari tersisa`
      : `${statusData?.subscription?.durationMonth ?? 0} bulan`;

  return (
    <AuthShell
      variant="immersive"
      title={statusCopy.title}
      description={statusCopy.description}
      panelClassName="max-w-[940px]"
    >
      <div className="mx-auto max-w-[820px] space-y-3">
        {loading ? (
          <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-6 text-center shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)]">
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
              <LoaderCircle className="size-7 animate-spin text-orange-500" />
              <p className="text-sm text-slate-500">Memuat status pembayaran dan membership...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)] sm:p-5">
              <div className="flex flex-wrap gap-2">
                <StatusChip label="Langkah 3 dari 3" className="border border-orange-100 bg-white text-orange-600" />
                <StatusChip label={accessMeta.chip} className={accessMeta.chipClassName} />
                <StatusChip label={paymentMeta.label} className={paymentMeta.chipClassName} />
              </div>

              {errorMessage ? (
                <div className="mt-5 rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-5 rounded-[24px] border border-orange-100/80 bg-white/88 p-4 shadow-[0_16px_28px_-26px_rgba(249,115,22,0.12)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-[18px]",
                        accessMeta.iconClassName,
                      )}
                    >
                      <AccessIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                        Ringkasan membership
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        {statusData?.subscription?.packageName ?? "-"}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {nextStepCopy.description}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-orange-100 bg-orange-50/70 px-4 py-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Total harga
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {statusData?.payment ? formatRupiah(statusData.payment.amount) : "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{summaryDuration}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-[20px] border border-orange-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Siswa
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {statusData?.student?.name ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-orange-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Cabang
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {statusData?.student?.branch ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-orange-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Email
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {emailVerified ? "Sudah diverifikasi" : "Belum diverifikasi"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-orange-100 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Referensi
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {statusData?.payment?.paymentId ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-100/80 bg-white/94 p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.12)] sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Profil siswa</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Informasi siswa ditampilkan read-only agar mudah dicek kembali.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <ReadOnlyField
                  id="status-student-name"
                  label="Nama siswa"
                  value={statusData?.student?.name ?? "-"}
                  className="sm:col-span-2"
                />
                <ReadOnlyField
                  id="status-student-email"
                  label="Email"
                  value={statusData?.student?.email ?? "-"}
                />
                <ReadOnlyField
                  id="status-student-phone"
                  label="Nomor HP"
                  value={statusData?.student?.phone ?? "-"}
                />
                <ReadOnlyField
                  id="status-student-program"
                  label="Jenjang / Program"
                  value={statusData?.student?.program ?? "-"}
                />
                <ReadOnlyField
                  id="status-student-branch"
                  label="Cabang"
                  value={statusData?.student?.branch ?? "-"}
                />
                <ReadOnlyField
                  id="status-student-class"
                  label="Kelas"
                  value={statusData?.student?.className ?? "-"}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-100/80 bg-white/94 p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.12)] sm:p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Detail tagihan</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Referensi pembayaran, metode, dan periode membership.
                </p>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <ReadOnlyField
                  id="status-payment-reference"
                  label="Referensi pembayaran"
                  value={statusData?.payment?.paymentId ?? "-"}
                />
                <ReadOnlyField
                  id="status-payment-method"
                  label="Metode"
                  value={formatMethodLabel(statusData?.payment?.method)}
                />
                <ReadOnlyField
                  id="status-payment-created"
                  label="Tanggal dibuat"
                  value={formatDateLabel(statusData?.payment?.createdAt ?? null)}
                />
                <ReadOnlyField
                  id="status-payment-paid"
                  label="Tanggal dibayar"
                  value={formatDateLabel(statusData?.payment?.paidAt ?? null)}
                />
                <ReadOnlyField
                  id="status-subscription-start"
                  label="Mulai aktif"
                  value={formatDateLabel(statusData?.subscription?.startDate ?? null)}
                />
                <ReadOnlyField
                  id="status-subscription-end"
                  label="Berakhir"
                  value={formatDateLabel(statusData?.subscription?.endDate ?? null)}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-100/80 bg-white/94 p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.12)] sm:p-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Status saat ini</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Tiga checkpoint utama untuk melihat kesiapan akun siswa.
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {statusChecklist.map((item) => {
                  const ItemIcon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.08)]"
                    >
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-[18px]",
                          item.isComplete ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500",
                        )}
                      >
                        <ItemIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-700">{item.value}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.helper}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-100/80 bg-white/94 p-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.12)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Aksi berikutnya
              </p>

              <div className="mt-4 grid gap-3">
                {paymentId && paymentIsPending ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full justify-center rounded-[16px] bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] text-sm shadow-[0_18px_34px_-24px_rgba(249,115,22,0.48)] hover:brightness-105"
                    disabled={
                      confirmingPayment ||
                      (xenditPaymentFlow && (!checkoutUrl || waitingForWebhook))
                    }
                    onClick={handleConfirmPayment}
                  >
                    {confirmingPayment ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        {xenditPaymentFlow ? "Membuka checkout..." : "Memproses konfirmasi..."}
                      </>
                    ) : waitingForWebhook ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Menunggu Webhook Xendit
                      </>
                    ) : xenditPaymentFlow ? (
                      <>
                        Buka Checkout Xendit
                        <ArrowRight className="size-4" />
                      </>
                    ) : (
                      <>
                        Konfirmasi Pembayaran Dummy
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                ) : null}

                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  Masuk ke Login
                </Link>

                <Link
                  href="/register-online"
                  className="inline-flex h-11 items-center justify-center rounded-[16px] border border-orange-100/80 bg-orange-50/70 px-5 text-sm font-medium text-orange-700 transition hover:bg-orange-100/80"
                >
                  Pilih Paket Kembali
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
