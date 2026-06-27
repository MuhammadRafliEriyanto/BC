"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthRequestError, authService } from "@/lib/auth";

function InputError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export function ForgotPasswordView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");

  function clearFieldError(fieldName: string) {
    setFieldErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setFieldErrors({ email: "Email wajib diisi." });
      setErrorMessage("Silakan masukkan alamat email Anda.");
      setLoading(false);
      return;
    }

    try {
      await authService.forgotPassword({
        email: normalizedEmail,
      });

      // Redirect to the reset password page on success
      router.push(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error) {
      if (
        error instanceof AuthRequestError &&
        error.errors &&
        typeof error.errors === "object" &&
        !Array.isArray(error.errors)
      ) {
        setFieldErrors(error.errors as Record<string, string>);
      }

      setErrorMessage(
        error instanceof AuthRequestError
          ? error.message
          : "Gagal meminta kode reset password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      variant="split"
      splitContentAlignment="start"
      splitContentClassName="pt-4 lg:pt-14 xl:pt-16"
      splitInnerClassName="max-w-[430px]"
      hideSplitVisualOnMobile
      hideSplitTopBadge
      title="Lupa Password?"
      description="Masukkan alamat email Anda, dan kami akan mengirimkan kode 6 digit untuk mereset password Anda."
      footer={
        <div className="flex flex-col gap-4">
          <div className="text-sm text-slate-500 text-center">
            Kembali ke halaman login?{" "}
            <Link
              href="/login"
              className="font-semibold text-orange-600 transition hover:text-orange-700 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {errorMessage ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="size-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setErrorMessage(null);
                    clearFieldError("email");
                    setEmail(event.target.value);
                  }}
                  placeholder="Masukkan email"
                  className="h-11 rounded-lg border-slate-200 bg-white pl-10 pr-4 transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
              <InputError message={fieldErrors.email} />
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-orange-600 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Mengirim Kode...
              </>
            ) : (
              "Kirim Kode Reset"
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
