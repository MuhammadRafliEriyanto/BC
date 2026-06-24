"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { AuthRequestError, authService } from "@/lib/auth";
import { cn } from "@/lib/utils";

type VerifyState = "loading" | "success" | "expired" | "invalid" | "error";

export function VerifyEmailView({ token }: { token: string | null }) {
  const hasRequested = useRef(false);
  const [status, setStatus] = useState<VerifyState>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token
      ? "Verifying your email address..."
      : "Verification token not found. Please check the link in your email.",
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
        setMessage("Email verification failed to process. Please try again.");
      }
    }

    runVerification();
  }, [token]);

  const isSuccess = status === "success";
  const isLoading = status === "loading";
  const isRecoverable = status === "expired" || status === "invalid" || status === "error";

  const title = isLoading
    ? "Verifying Email"
    : isSuccess
      ? "Account Verified"
      : "Verification Failed";

  const description = isSuccess
    ? "Your email has been successfully verified. You can now access all features."
    : message;

  return (
    <AuthShell
      variant="split"
      title={title}
      description={description}
      footer={
        <div className="flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button
              className={cn(
                "h-11 w-full rounded-lg font-semibold transition active:scale-[0.98]",
                isSuccess
                  ? "bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
              )}
            >
              {isSuccess ? "Go to Login" : "Back to Login"}
            </Button>
          </Link>
          {isRecoverable ? (
            <Link href="/register" className="w-full">
              <Button
                variant="ghost"
                className="h-11 w-full rounded-lg text-slate-500 hover:text-slate-900"
              >
                Register again
              </Button>
            </Link>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center space-y-8 py-4">
        <div
          className={cn(
            "relative flex size-24 items-center justify-center rounded-full transition-all duration-500",
            isLoading
              ? "bg-slate-50"
              : isSuccess
                ? "bg-emerald-50 text-emerald-600 scale-110"
                : "bg-rose-50 text-rose-600",
          )}
        >
          {isLoading ? (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-orange-500 animate-spin" />
              <LoaderCircle className="size-10 text-slate-300 animate-pulse" />
            </>
          ) : isSuccess ? (
            <CheckCircle2 className="size-12 animate-in zoom-in duration-300" />
          ) : (
            <MailWarning className="size-12 animate-in zoom-in duration-300" />
          )}
        </div>

        {isRecoverable && status === "expired" ? (
          <div className="w-full rounded-lg bg-amber-50 border border-amber-100 p-4 text-sm leading-6 text-amber-800">
            <p className="font-medium">Link expired?</p>
            <p className="mt-1 opacity-90">
              Verification links are only valid for a limited time. You can register again with the same email to get a new one.
            </p>
          </div>
        ) : null}
      </div>
    </AuthShell>
  );
}
