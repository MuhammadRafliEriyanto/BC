"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AuthRequestError,
  authService,
  clearAuthClientState,
  persistAuthUser,
} from "@/lib/auth";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentityWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          cancel_on_tap_outside?: boolean;
          context?: string;
        }) => void;
        renderButton: (
          element: HTMLElement,
          options: Record<string, string | number | boolean>,
        ) => void;
      };
    };
  };
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  const isGoogleLoginEnabled = googleClientId.length > 0;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
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

  function resolveRedirectPath(defaultRedirectPath: string) {
    const nextPath = searchParams.get("next")?.trim() ?? "";

    if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
      return defaultRedirectPath;
    }

    return nextPath;
  }

  function completeAuth(response: {
    data?: {
      user: Parameters<typeof persistAuthUser>[0];
      redirectPath: string;
    };
  }) {
    if (!response.data) {
      throw new Error("Respons login tidak lengkap.");
    }

    persistAuthUser(response.data.user);
    router.replace(resolveRedirectPath(response.data.redirectPath));
    router.refresh();
  }

  function handleAuthError(error: unknown, fallbackMessage: string) {
    if (error instanceof AuthRequestError) {
      setErrorMessage(error.message);

      if (error.errors && typeof error.errors === "object" && !Array.isArray(error.errors)) {
        setFieldErrors(error.errors as Record<string, string>);
      }

      return;
    }

    setErrorMessage(fallbackMessage);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      clearAuthClientState();
      const response = await authService.login({
        email: formValues.email,
        password: formValues.password,
        rememberMe,
      });

      completeAuth(response);
    } catch (error) {
      handleAuthError(error, "Login gagal diproses. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleCredential = useEffectEvent(async (credential?: string) => {
    if (!credential) {
      setErrorMessage("Credential Google tidak ditemukan. Silakan coba lagi.");
      return;
    }

    setGoogleLoading(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      clearAuthClientState();

      const response = await authService.googleLogin({
        credential,
        rememberMe,
      });

      completeAuth(response);
    } catch (error) {
      handleAuthError(error, "Login Google gagal diproses. Silakan coba lagi.");
    } finally {
      setGoogleLoading(false);
    }
  });

  useEffect(() => {
    if (!isGoogleLoginEnabled || !googleScriptReady || !googleButtonRef.current) {
      return;
    }

    const googleApi = (window as GoogleIdentityWindow).google?.accounts?.id;

    if (!googleApi) {
      return;
    }

    const targetWidth = Math.max(260, Math.min(googleButtonRef.current.clientWidth || 340, 360));

    googleApi.initialize({
      client_id: googleClientId,
      callback: (response) => {
        void handleGoogleCredential(response.credential);
      },
      cancel_on_tap_outside: true,
      context: "signin",
    });

    googleButtonRef.current.innerHTML = "";
    googleApi.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: targetWidth,
      logo_alignment: "left",
    });
  }, [googleClientId, googleScriptReady, isGoogleLoginEnabled]);

  return (
    <AuthShell
      variant="immersive"
      eyebrow="Masuk"
      title="Selamat datang, silakan login"
      description="Masuk dengan email utama Anda atau lanjutkan lewat Google."
      footer={
        <p className="text-center text-sm leading-7 text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-orange-600 transition hover:text-orange-700">
            Daftar sekarang
          </Link>
        </p>
      }
    >
      {isGoogleLoginEnabled ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setGoogleScriptReady(true)}
          onError={() => {
            setGoogleScriptReady(false);
            setErrorMessage("Google Sign-In gagal dimuat. Silakan pakai login email atau muat ulang halaman.");
          }}
        />
      ) : null}

      <form className="mx-auto max-w-[520px] space-y-3" onSubmit={handleSubmit}>
        <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)] sm:p-5">
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-orange-700">
                E-mail
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orange-400" />
                <Input
                  id="email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => {
                    setErrorMessage("");
                    clearFieldError("email");
                    setFormValues((current) => ({
                      ...current,
                      email: event.target.value,
                    }));
                  }}
                  placeholder="Enter Your E-mail Address"
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pl-11"
                  autoComplete="email"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              <InputError message={fieldErrors.email} />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-orange-700">
                Password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orange-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formValues.password}
                  onChange={(event) => {
                    setErrorMessage("");
                    clearFieldError("password");
                    setFormValues((current) => ({
                      ...current,
                      password: event.target.value,
                    }));
                  }}
                  placeholder="Enter Your Password"
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pl-11 pr-12"
                  autoComplete="current-password"
                  required
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  disabled={loading || googleLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <InputError message={fieldErrors.password} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/20"
                disabled={loading || googleLoading}
              />
              Ingat sesi saya
            </label>
            <p className="text-xs text-slate-400">Email harus sudah diverifikasi.</p>
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="mt-4 h-11 w-full rounded-[16px] bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] text-sm shadow-[0_18px_34px_-24px_rgba(249,115,22,0.48)] hover:brightness-105"
            disabled={loading || googleLoading}
          >
            {loading || googleLoading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {loading ? "Memproses login..." : "Memverifikasi Google..."}
              </>
            ) : (
              "Continue"
            )}
          </Button>

        </div>

        <div className="rounded-[24px] border border-orange-100/80 bg-white/94 px-4 py-4 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.12)] sm:px-5">
          <p className="text-sm font-semibold text-slate-900">Lanjutkan dengan Google</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Pakai email Google yang sama dengan akun LMS Anda.
          </p>

          <div className="mt-4">
            {isGoogleLoginEnabled ? (
              <>
                <div ref={googleButtonRef} className="flex min-h-11 items-center justify-center" />
                {!googleScriptReady ? (
                  <div className="flex h-11 items-center justify-center gap-2 text-sm text-slate-500">
                    <LoaderCircle className="size-4 animate-spin text-orange-500" />
                    Menyiapkan Google Sign-In...
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-orange-200/80 bg-orange-50/70 px-4 py-3 text-center text-sm leading-6 text-slate-600">
                Login Google akan muncul setelah `NEXT_PUBLIC_GOOGLE_CLIENT_ID` dan
                `GOOGLE_CLIENT_ID` diaktifkan.
              </div>
            )}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </form>
    </AuthShell>
  );
}
