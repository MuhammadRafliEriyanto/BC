"use client";

import { useEffect, useEffectEvent, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  ReceiptText,
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MembershipRequestError,
  formatRupiah,
  membershipService,
  type MembershipPaymentHistoryItem,
} from "@/lib/subscription";

function formatDateTimeLabel(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPaymentStatusLabel(status: MembershipPaymentHistoryItem["status"]) {
  switch (status) {
    case "paid":
      return "Lunas";
    case "pending":
      return "Pending";
    case "failed":
      return "Gagal";
    case "expired":
      return "Kedaluwarsa";
    default:
      return status;
  }
}

function formatPaymentStatusVariant(status: MembershipPaymentHistoryItem["status"]) {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    case "expired":
      return "secondary";
    default:
      return "secondary";
  }
}

function formatChannelLabel(value: string) {
  return value
    .trim()
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function canContinuePayment(payment: MembershipPaymentHistoryItem) {
  return payment.status === "pending" && Boolean(payment.checkoutUrl?.trim());
}

function PaymentHistorySkeleton() {
  return (
    <div className="space-y-3 p-4 md:p-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl border border-slate-100 bg-slate-50/80"
        />
      ))}
    </div>
  );
}

function PaymentHistoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600">
        <ReceiptText className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-800">
          Belum ada histori tagihan
        </p>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Tagihan membership dan pembayaran yang pernah dibuat untuk akun siswa
          kamu akan muncul di sini.
        </p>
      </div>
    </div>
  );
}

export default function HistoriTagihanSiswa() {
  const [payments, setPayments] = useState<MembershipPaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadPaymentHistory = useEffectEvent(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await membershipService.getMyPaymentHistory();
      setPayments(response.data?.payments ?? []);
    } catch (requestError) {
      if (
        requestError instanceof MembershipRequestError &&
        (requestError.status === 401 || requestError.status === 403)
      ) {
        setError("Sesi login siswa tidak valid untuk membaca histori tagihan.");
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Gagal memuat histori tagihan siswa.",
        );
      }

      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      void loadPaymentHistory();
    });
  }, [reloadKey]);

  return (
    <section className="overflow-hidden rounded-[24px] border border-orange-100/90 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22),0_12px_24px_-22px_rgba(249,115,22,0.14)]">
      <div className="flex flex-col gap-3 border-b border-orange-100/80 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,0.98))] px-4 py-4 md:flex-row md:items-start md:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-600 shadow-sm shadow-orange-100/60">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 md:text-lg">
              Histori Tagihan
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Lihat seluruh payment membership milik akun kamu, termasuk tagihan
              yang masih pending dan bisa dilanjutkan pembayarannya.
            </p>
          </div>
        </div>

        <Badge variant="info" className="self-start">
          {payments.length} Tagihan
        </Badge>
      </div>

      {isLoading ? <PaymentHistorySkeleton /> : null}

      {!isLoading && error ? (
        <div className="flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-5">
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Histori tagihan belum bisa dimuat</p>
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
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && payments.length === 0 ? (
        <PaymentHistoryEmptyState />
      ) : null}

      {!isLoading && !error && payments.length > 0 ? (
        <div className="p-4 md:p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tagihan</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {payment.packageName}
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        {payment.paymentId}
                      </p>
                      <p className="text-xs text-slate-500">
                        Subscription: {payment.subscriptionCode ?? "-"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {formatRupiah(payment.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Dibuat {formatDateTimeLabel(payment.createdAt)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <Badge variant={formatPaymentStatusVariant(payment.status)}>
                        {formatPaymentStatusLabel(payment.status)}
                      </Badge>
                      <p className="text-xs leading-5 text-slate-500">
                        {payment.paidAt
                          ? `Lunas pada ${formatDateTimeLabel(payment.paidAt)}`
                          : payment.expiresAt
                            ? `Berlaku hingga ${formatDateTimeLabel(payment.expiresAt)}`
                            : "Belum ada konfirmasi pembayaran"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800">
                        {formatChannelLabel(payment.method)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Provider {formatChannelLabel(payment.provider)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs leading-5 text-slate-500">
                      <p>Dibuat: {formatDateTimeLabel(payment.createdAt)}</p>
                      <p>Lunas: {formatDateTimeLabel(payment.paidAt)}</p>
                      <p>Expires: {formatDateTimeLabel(payment.expiresAt)}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    {canContinuePayment(payment) ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (!payment.checkoutUrl) {
                            return;
                          }

                          window.open(
                            payment.checkoutUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        Lanjut Bayar
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
}
