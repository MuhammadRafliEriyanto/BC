"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { AuthRequestError, authService } from "@/lib/auth";

type VerifyState = "loading" | "success" | "expired" | "invalid" | "error";

export function VerifyEmailView({ token }: { token: string | null }) {
  const hasRequested = useRef(false);
  const [status, setStatus] = useState<VerifyState>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token
      ? "Memverifikasi email Anda..."
      : "Token verifikasi tidak ditemukan. Silakan cek kembali link pada email Anda.",
  );

  useEffect(() => {
    if (hasRequested.current || !token) {
      return;
    }

    hasRequested.current = true;
    const verificationToken = token;

    async function runVerification() {
      try {
        const response = await authService.verifyEmail(verificationToken);
        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        if (error instanceof AuthRequestError) {
          if (error.errorCode === "EXPIRED_VERIFICATION_TOKEN") {
            setStatus("expired");
          } else if (error.errorCode === "INVALID_VERIFICATION_TOKEN") {
            setStatus("invalid");
          } else {
            setStatus("error");
          }
          setMessage(error.message);
          return;
        }

        setStatus("error");
        setMessage("Verifikasi email gagal diproses. Silakan coba lagi.");
      }
    }

    runVerification();
  }, [token]);

  const isSuccess = status === "success";
  const isLoading = status === "loading";
  const isRecoverable = status === "expired" || status === "invalid" || status === "error";

  const title = isLoading
    ? "Memverifikasi Email"
    : isSuccess
      ? "Verifikasi Berhasil"
      : status === "expired"
        ? "Link Verifikasi Kedaluwarsa"
        : status === "invalid"
          ? "Link Verifikasi Tidak Valid"
          : "Verifikasi Gagal";

  const description = isSuccess
    ? "Email Anda sudah aktif. Silakan lanjut login untuk masuk ke sistem."
    : message;

  const iconClassName = isSuccess
    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
    : isRecoverable
      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100"
      : "bg-orange-50 text-orange-600 ring-1 ring-orange-100";

  const footer = isSuccess ? (
    <Link href="/login">
      <Button
        size="lg"
        className="h-11 rounded-2xl bg-[linear-gradient(135deg,#ea580c_0%,#f59e0b_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_32px_-24px_rgba(249,115,22,0.55)] transition hover:brightness-[1.03]"
      >
        Silakan Login
      </Button>
    </Link>
  ) : (
    <div className="flex flex-wrap justify-center gap-3">
      <Link href="/login">
        <Button variant="secondary">Kembali ke login</Button>
      </Link>
      {isRecoverable ? (
        <Link href="/register">
          <Button variant="outline">Daftar ulang</Button>
        </Link>
      ) : null}
    </div>
  );

  return (
    <AuthShell
      eyebrow="Verifikasi Email"
      title={title}
      description={description}
      footer={footer}
      variant="compact"
    >
      <div className="flex justify-center">
        <div
          className={`flex size-[88px] items-center justify-center rounded-full ${iconClassName}`}
        >
          {isLoading ? (
            <LoaderCircle className="size-10 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle2 className="size-10" />
          ) : (
            <MailWarning className="size-10" />
          )}
        </div>
      </div>

      {isRecoverable ? (
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400">
          Jika token sudah kedaluwarsa, Anda bisa registrasi ulang dengan email yang sama untuk
          mendapatkan link verifikasi baru.
        </p>
      ) : null}
    </AuthShell>
  );
}
