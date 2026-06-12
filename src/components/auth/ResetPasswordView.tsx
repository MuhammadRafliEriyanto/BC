"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthRequestError, authService } from "@/lib/auth";

type ResetPasswordViewProps = {
  email: string | null;
  source: string | null;
};

type PasswordVisibilityState = {
  newPassword: boolean;
  confirmNewPassword: boolean;
};

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

export function ResetPasswordView({
  email,
  source,
}: ResetPasswordViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordVisibilityState>({
      newPassword: false,
      confirmNewPassword: false,
    });
  const [formValues, setFormValues] = useState({
    email: email ?? "",
    code: "",
    newPassword: "",
    confirmNewPassword: "",
  });

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
    setSuccessMessage(null);
    setErrorMessage(null);
    setFieldErrors({});

    const normalizedEmail = formValues.email.trim();
    const normalizedCode = formValues.code.trim();
    const nextFieldErrors: Record<string, string> = {};

    if (!normalizedEmail) {
      nextFieldErrors.email = "Email wajib diisi.";
    }

    if (!normalizedCode) {
      nextFieldErrors.code = "Kode reset wajib diisi.";
    } else if (!/^\d{6}$/.test(normalizedCode)) {
      nextFieldErrors.code = "Kode reset harus terdiri dari 6 digit angka.";
    }

    if (!formValues.newPassword) {
      nextFieldErrors.newPassword = "Password baru wajib diisi.";
    } else if (formValues.newPassword.length < 8) {
      nextFieldErrors.newPassword = "Password baru minimal 8 karakter.";
    }

    if (!formValues.confirmNewPassword) {
      nextFieldErrors.confirmNewPassword =
        "Konfirmasi password baru wajib diisi.";
    } else if (formValues.newPassword !== formValues.confirmNewPassword) {
      nextFieldErrors.confirmNewPassword =
        "Konfirmasi password baru tidak cocok.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setErrorMessage("Lengkapi data reset password terlebih dahulu.");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword({
        email: normalizedEmail,
        code: normalizedCode,
        newPassword: formValues.newPassword,
        confirmNewPassword: formValues.confirmNewPassword,
      });

      setSuccessMessage(
        response.message ||
          "Password berhasil direset. Silakan login dengan password baru Anda.",
      );
      setFormValues((current) => ({
        ...current,
        code: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
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
          : "Reset password gagal diproses.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      variant="immersive"
      eyebrow="Reset Password"
      title="Masukkan kode reset password"
      description="Gunakan kode 6 digit yang sudah dikirim ke email Anda, lalu simpan password baru."
      footer={
        <div className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button variant="secondary">Kembali ke login</Button>
          </Link>
          {source === "dashboard-admin" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                startTransition(() => {
                  router.push("/dashboard-admin");
                });
              }}
            >
              Kembali ke dashboard admin
            </Button>
          ) : null}
        </div>
      }
    >
      <form className="mx-auto max-w-[520px] space-y-3" onSubmit={handleSubmit}>
        <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)] sm:p-5">
          {successMessage ? (
            <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/90 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_16px_26px_-18px_rgba(16,185,129,0.45)]">
                  <CheckCircle2 className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Password berhasil diperbarui
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[22px] border border-rose-100 bg-rose-50/90 p-4 text-sm leading-6 text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-3">
            <div>
              <label
                htmlFor="reset-password-email"
                className="text-sm font-medium text-orange-700"
              >
                E-mail
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orange-400" />
                <Input
                  id="reset-password-email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => {
                    setErrorMessage(null);
                    clearFieldError("email");
                    setFormValues((current) => ({
                      ...current,
                      email: event.target.value,
                    }));
                  }}
                  placeholder="nama@email.com"
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pl-11"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <InputError message={fieldErrors.email} />
            </div>

            <div>
              <label
                htmlFor="reset-password-code"
                className="text-sm font-medium text-orange-700"
              >
                Kode Reset
              </label>
              <div className="relative mt-2">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orange-400" />
                <Input
                  id="reset-password-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formValues.code}
                  onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
                    setErrorMessage(null);
                    clearFieldError("code");
                    setFormValues((current) => ({
                      ...current,
                      code: digitsOnly,
                    }));
                  }}
                  placeholder="Masukkan 6 digit kode"
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pl-11 tracking-[0.24em]"
                  disabled={loading}
                />
              </div>
              <InputError message={fieldErrors.code} />
            </div>

            <div>
              <label
                htmlFor="reset-password-new"
                className="text-sm font-medium text-orange-700"
              >
                Password Baru
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orange-400" />
                <Input
                  id="reset-password-new"
                  type={passwordVisibility.newPassword ? "text" : "password"}
                  value={formValues.newPassword}
                  onChange={(event) => {
                    setErrorMessage(null);
                    clearFieldError("newPassword");
                    setFormValues((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }));
                  }}
                  placeholder="Minimal 8 karakter"
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pl-11 pr-12"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() =>
                    setPasswordVisibility((current) => ({
                      ...current,
                      newPassword: !current.newPassword,
                    }))
                  }
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
                  aria-label={
                    passwordVisibility.newPassword
                      ? "Sembunyikan password baru"
                      : "Tampilkan password baru"
                  }
                  disabled={loading}
                >
                  {passwordVisibility.newPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <InputError message={fieldErrors.newPassword} />
            </div>

            <div>
              <label
                htmlFor="reset-password-confirm"
                className="text-sm font-medium text-orange-700"
              >
                Konfirmasi Password Baru
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orange-400" />
                <Input
                  id="reset-password-confirm"
                  type={
                    passwordVisibility.confirmNewPassword ? "text" : "password"
                  }
                  value={formValues.confirmNewPassword}
                  onChange={(event) => {
                    setErrorMessage(null);
                    clearFieldError("confirmNewPassword");
                    setFormValues((current) => ({
                      ...current,
                      confirmNewPassword: event.target.value,
                    }));
                  }}
                  placeholder="Ulangi password baru"
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pl-11 pr-12"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() =>
                    setPasswordVisibility((current) => ({
                      ...current,
                      confirmNewPassword: !current.confirmNewPassword,
                    }))
                  }
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
                  aria-label={
                    passwordVisibility.confirmNewPassword
                      ? "Sembunyikan konfirmasi password baru"
                      : "Tampilkan konfirmasi password baru"
                  }
                  disabled={loading}
                >
                  {passwordVisibility.confirmNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <InputError message={fieldErrors.confirmNewPassword} />
            </div>
          </div>

          <div className="mt-3 rounded-[20px] border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm leading-6 text-slate-600">
            Kode reset dikirim ke email dan berlaku dalam waktu terbatas. Jika
            belum menerima email, kirim ulang permintaan reset dari dashboard
            atau halaman sebelumnya.
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="mt-4 h-11 w-full rounded-[16px] bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] text-sm shadow-[0_18px_34px_-24px_rgba(249,115,22,0.48)] hover:brightness-105"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Menyimpan password baru...
              </>
            ) : (
              "Simpan Password Baru"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
