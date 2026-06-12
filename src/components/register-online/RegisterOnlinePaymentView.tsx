"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  LoaderCircle,
  QrCode,
  Smartphone,
} from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MembershipRequestError,
  formatDateLabel,
  formatRupiah,
  membershipService,
  type PaymentStatusResponse,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type RegisterOnlinePaymentViewProps = {
  paymentId: string;
};

type GatewayState = "review" | "processing" | "success";
type PaymentState = NonNullable<PaymentStatusResponse["data"]>;

type PaymentMethodId = "qris" | "virtual-account" | "e-wallet";

type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  detail: string;
  helper: string;
  icon: LucideIcon;
};

const paymentMethods: PaymentMethodOption[] = [
  {
    id: "qris",
    label: "QRIS",
    detail: "Cepat untuk scan dan bayar lewat aplikasi e-wallet atau mobile banking.",
    helper: "Simulasi paling cepat",
    icon: QrCode,
  },
  {
    id: "virtual-account",
    label: "Virtual Account",
    detail: "Cocok jika ingin transfer dari rekening bank dengan nomor VA khusus.",
    helper: "Transfer bank otomatis",
    icon: Building2,
  },
  {
    id: "e-wallet",
    label: "E-Wallet",
    detail: "Mudah dipakai untuk pembayaran dari dompet digital yang sudah aktif.",
    helper: "Praktis untuk mobile",
    icon: Smartphone,
  },
];

function mapPaymentState(data: PaymentStatusResponse["data"] | undefined) {
  return data ?? null;
}

function getStatusBadgeVariant(status: PaymentState["payment"]["status"] | undefined) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "failed" || status === "expired") {
    return "danger" as const;
  }

  return "warning" as const;
}

function isXenditPaymentFlow(data: PaymentState | null) {
  if (!data) {
    return false;
  }

  return data.payment.provider === "xendit" || Boolean(data.payment.xenditPaymentSessionId);
}

function isWaitingForXenditWebhook(data: PaymentState | null) {
  if (!data) {
    return false;
  }

  return data.payment.status === "pending" && data.payment.xenditSessionStatus === "COMPLETED";
}

export default function RegisterOnlinePaymentView({
  paymentId,
}: RegisterOnlinePaymentViewProps) {
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("qris");
  const [gatewayState, setGatewayState] = useState<GatewayState>("review");
  const [paymentData, setPaymentData] = useState<PaymentState | null>(null);

  function applyPaymentData(nextData: PaymentState | null) {
    setPaymentData(nextData);

    if (nextData?.payment.status === "paid") {
      setGatewayState("success");
      return;
    }

    if (nextData?.payment.xenditSessionStatus === "COMPLETED") {
      setGatewayState("processing");
      return;
    }

    setGatewayState("review");
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPayment() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await membershipService.getPaymentStatus(paymentId);

        if (!isMounted) {
          return;
        }

        const nextData = mapPaymentState(response.data);
        applyPaymentData(nextData);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof MembershipRequestError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Halaman pembayaran belum dapat dimuat. Silakan coba lagi.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPayment();

    return () => {
      isMounted = false;
    };
  }, [paymentId]);

  useEffect(() => {
    if (!paymentData || paymentData.payment.status === "paid") {
      return;
    }

    let isMounted = true;
    const intervalId = window.setInterval(async () => {
      try {
        const response = await membershipService.getPaymentStatus(paymentId);

        if (!isMounted) {
          return;
        }

        applyPaymentData(mapPaymentState(response.data));
      } catch {
        // Keep the latest visible state and let the next polling cycle retry.
      }
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [paymentData, paymentId]);

  async function handlePaymentAction() {
    setConfirmingPayment(true);
    setErrorMessage("");

    try {
      if (isXenditPaymentFlow(paymentData)) {
        const checkoutUrl = paymentData?.payment.checkoutUrl?.trim();

        if (!checkoutUrl) {
          throw new Error("Checkout Xendit belum tersedia untuk pembayaran ini.");
        }

        const checkoutWindow = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

        if (!checkoutWindow) {
          window.location.assign(checkoutUrl);
        }

        setGatewayState("processing");
        return;
      }

      setGatewayState("processing");
      await new Promise((resolve) => window.setTimeout(resolve, 1200));

      const response = await membershipService.confirmPayment(paymentId);
      applyPaymentData(mapPaymentState(response.data));
    } catch (error) {
      if (error instanceof MembershipRequestError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Simulasi payment gateway belum berhasil diproses.");
      }

      setGatewayState("review");
    } finally {
      setConfirmingPayment(false);
    }
  }

  const selectedMethodMeta =
    paymentMethods.find((method) => method.id === selectedMethod) ?? paymentMethods[0];
  const SelectedMethodIcon = selectedMethodMeta.icon;
  const statusPageHref = `/register-online/status?paymentId=${encodeURIComponent(paymentId)}`;
  const paymentStatus = paymentData?.payment.status;
  const xenditPaymentFlow = isXenditPaymentFlow(paymentData);
  const waitingForWebhook = isWaitingForXenditWebhook(paymentData);
  const checkoutUrl = paymentData?.payment.checkoutUrl?.trim() ?? "";
  const canOpenCheckout =
    xenditPaymentFlow && paymentStatus === "pending" && !waitingForWebhook && Boolean(checkoutUrl);

  return (
    <AuthShell
      variant="immersive"
      title={
        gatewayState === "success" || paymentStatus === "paid"
          ? "Pembayaran berhasil diproses"
          : waitingForWebhook
            ? "Menunggu verifikasi pembayaran"
          : "Selesaikan pembayaran"
      }
      description={
        gatewayState === "success" || paymentStatus === "paid"
          ? "Tagihan sudah tercatat. Langkah berikutnya adalah cek status membership siswa."
          : waitingForWebhook
            ? "Checkout di Xendit sudah selesai. Sistem sedang menunggu webhook resmi sebelum membership diaktifkan."
            : xenditPaymentFlow
              ? "Lanjutkan ke checkout Xendit. Status pembayaran akan diperbarui otomatis setelah webhook diterima."
              : "Pilih metode pembayaran dan lanjutkan ke simulasi gateway tanpa mengubah alur pendaftaran."
      }
      panelClassName="max-w-[900px]"
    >
      <div className="mx-auto max-w-[780px] space-y-3">
        {loading ? (
          <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-6 text-center shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)]">
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
              <LoaderCircle className="size-7 animate-spin text-orange-500" />
              <p className="text-sm text-slate-500">Memuat detail tagihan dan status pembayaran...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)] sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
                  Langkah 2 dari 3
                </span>
                <Badge variant={getStatusBadgeVariant(paymentStatus)} className="uppercase">
                  {paymentStatus ?? "pending"}
                </Badge>
                <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  Ref {paymentId}
                </span>
              </div>

              <div className="mt-5 rounded-[24px] border border-orange-100/80 bg-white/88 p-4 shadow-[0_16px_28px_-26px_rgba(249,115,22,0.12)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                      Ringkasan tagihan
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {paymentData?.subscription.packageName ?? "-"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Untuk siswa {paymentData?.student.name ?? "-"}.
                      {paymentData?.student.branch
                        ? ` Cabang ${paymentData.student.branch}.`
                        : null}
                      {paymentData
                        ? ` ${paymentData.student.program} - ${paymentData.student.className}.`
                        : null}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-orange-100 bg-orange-50/70 px-4 py-3 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Total bayar
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {paymentData ? formatRupiah(paymentData.payment.amount) : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Dibuat {formatDateLabel(paymentData?.payment.createdAt ?? null)}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Cabang {paymentData?.student.branch ?? "-"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                    Aktif {paymentData?.subscription.durationMonth ?? 0} bulan
                  </span>
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-5 rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {gatewayState === "success" || paymentStatus === "paid" ? (
                <div className="mt-5 rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.92),rgba(255,255,255,0.98))] p-5 shadow-[0_22px_36px_-30px_rgba(16,185,129,0.18)]">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-[18px] bg-emerald-100 text-emerald-700">
                      <BadgeCheck className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Pembayaran selesai</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Tagihan sudah tervalidasi dan tercatat pada{" "}
                        {formatDateLabel(paymentData?.payment.paidAt ?? null)}.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={statusPageHref}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#059669_0%,#10b981_100%)] px-5 text-sm font-semibold text-white shadow-[0_22px_34px_-24px_rgba(16,185,129,0.32)] transition hover:brightness-105"
                    >
                      Lanjut ke Status Membership
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-11 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      Ke Halaman Login
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5 rounded-[24px] border border-orange-100/80 bg-white/88 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Pilih metode pembayaran</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {xenditPaymentFlow
                            ? "Pilihan di bawah hanya membantu user memahami opsi pembayaran. Metode akhir tetap dipilih di halaman checkout Xendit."
                            : "Metode yang dipilih akan dipakai sebagai tampilan simulasi payment gateway."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        const isActive = selectedMethod === method.id;

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedMethod(method.id)}
                            className={cn(
                              "rounded-[22px] border p-4 text-left transition-all duration-300",
                              isActive
                                ? "border-orange-300 bg-[linear-gradient(180deg,rgba(255,247,237,0.98),rgba(255,255,255,0.98))] shadow-[0_22px_34px_-30px_rgba(249,115,22,0.26)]"
                                : "border-slate-200/90 bg-white hover:border-orange-200 hover:bg-orange-50/40",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-3">
                                <div
                                  className={cn(
                                    "flex size-11 items-center justify-center rounded-[18px] border",
                                    isActive
                                      ? "border-orange-200 bg-white text-orange-600"
                                      : "border-slate-200 bg-slate-50 text-slate-400",
                                  )}
                                >
                                  <Icon className="size-5" />
                                </div>

                                <div>
                                  <p className="text-base font-semibold text-slate-900">{method.label}</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-500">{method.detail}</p>
                                </div>
                              </div>

                              <span
                                className={cn(
                                  "inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
                                  isActive
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                {method.helper}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-orange-100/80 bg-orange-50/75 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-[18px] bg-white text-orange-600 shadow-[0_14px_26px_-24px_rgba(249,115,22,0.24)]">
                        {gatewayState === "processing" ? (
                          <LoaderCircle className="size-5 animate-spin" />
                        ) : (
                          <SelectedMethodIcon className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {gatewayState === "processing"
                            ? xenditPaymentFlow
                              ? "Menunggu penyelesaian checkout Xendit"
                              : "Sedang menghubungkan ke payment gateway"
                            : `Metode aktif: ${selectedMethodMeta.label}`}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {gatewayState === "processing"
                            ? xenditPaymentFlow
                              ? "Selesaikan pembayaran di halaman checkout yang dibuka, lalu status di halaman ini akan tersinkron otomatis."
                              : "Status pembayaran akan diperbarui otomatis setelah simulasi selesai."
                            : waitingForWebhook
                              ? "Checkout sudah completed di Xendit. Sistem sedang menunggu webhook resmi sebelum status lokal berubah menjadi lunas."
                              : selectedMethodMeta.detail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 flex-1 justify-center rounded-[16px] bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] text-sm shadow-[0_18px_34px_-24px_rgba(249,115,22,0.48)] hover:brightness-105 sm:min-w-[240px]"
                      disabled={
                        confirmingPayment ||
                        (xenditPaymentFlow && (!canOpenCheckout || waitingForWebhook))
                      }
                      onClick={handlePaymentAction}
                    >
                      {confirmingPayment ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          {xenditPaymentFlow ? "Membuka checkout..." : "Menghubungkan ke gateway..."}
                        </>
                      ) : waitingForWebhook ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          Menunggu Verifikasi Webhook
                        </>
                      ) : xenditPaymentFlow ? (
                        <>
                          Lanjut ke Checkout Xendit
                          <ArrowRight className="size-4" />
                        </>
                      ) : (
                        <>
                          Bayar Sekarang
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                    <Link
                      href={statusPageHref}
                      className="inline-flex h-11 items-center justify-center rounded-[16px] border border-orange-100/80 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      Cek Status Dulu
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register-online"
                className="inline-flex h-11 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                Ubah Paket Lagi
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-[16px] border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                Kembali ke Landing
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
