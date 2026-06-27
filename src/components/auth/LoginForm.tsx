"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

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
    console.log("completeAuth called", response);
    if (!response.data) {
      throw new Error("Respons login tidak lengkap.");
    }

    persistAuthUser(response.data.user);
    console.log("routing to", resolveRedirectPath(response.data.redirectPath));
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

    setErrorMessage(fallbackMessage + (error instanceof Error ? ` (${error.message})` : ""));
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

    const targetWidth = Math.max(280, Math.min(googleButtonRef.current.clientWidth || 360, 390));

    if (!(window as any)._gsiInitialized) {
      googleApi.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void handleGoogleCredential(response.credential);
        },
        cancel_on_tap_outside: true,
        context: "signin",
      });
      (window as any)._gsiInitialized = true;
    }

    googleButtonRef.current.innerHTML = "";
    googleApi.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: targetWidth,
      logo_alignment: "left",
    });
  }, [googleClientId, googleScriptReady, isGoogleLoginEnabled]);

  return (
    <AuthShell
      variant="split"
      splitContentAlignment="start"
      splitContentClassName="pt-4 lg:pt-14 xl:pt-16"
      splitInnerClassName="max-w-[430px]"
      hideSplitVisualOnMobile
      hideSplitTopBadge
      title="Welcome Back to Bina Cendekia!"
      description="Masuk ke akun Anda untuk membuka dashboard belajar, jadwal, dan progres terbaru."
      footer={
        <div className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#c2410c] transition hover:text-[#9a3412] underline-offset-4 hover:underline"
          >
            Daftar sekarang
          </Link>
        </div>
      }
    >
      {isGoogleLoginEnabled ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setGoogleScriptReady(true)}
          onError={() => {
            setGoogleScriptReady(false);
            setErrorMessage("Google Sign-In gagal dimuat. Silakan gunakan login email.");
          }}
        />
      ) : null}

      <div className="space-y-7">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Your Email
              </label>
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
                placeholder="name@example.com"
                className="h-12 rounded-xl border-[#f2c7b3] bg-white px-4 shadow-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                autoComplete="email"
                required
                disabled={loading || googleLoading}
              />
              <InputError message={fieldErrors.email} />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
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
                  placeholder="********"
                  className="h-12 rounded-xl border-[#f2c7b3] bg-white px-4 pr-12 shadow-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  autoComplete="current-password"
                  required
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || googleLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <InputError message={fieldErrors.password} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="group flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 transition hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-slate-300 accent-orange-600 transition focus:ring-orange-500/10"
                disabled={loading || googleLoading}
                suppressHydrationWarning
              />
              Remember Me
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-slate-400 transition hover:text-orange-600"
            >
              Forgot Password?
            </Link>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[linear-gradient(135deg,#ea580c_0%,#dc2626_100%)] text-sm font-semibold text-white shadow-[0_20px_34px_-24px_rgba(220,38,38,0.45)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            disabled={loading || googleLoading}
          >
            {loading || googleLoading ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#fff8f1] px-4 font-medium tracking-[0.18em] text-slate-400">
              Atau lanjut dengan
            </span>
          </div>
        </div>

        <div>
          {isGoogleLoginEnabled ? (
            <div className="rounded-2xl border border-[#f3d6c4] bg-white p-3 shadow-[0_16px_30px_-28px_rgba(194,65,12,0.2)]">
              <div ref={googleButtonRef} className="w-full min-h-[44px]" />
              {!googleScriptReady ? (
                <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm text-slate-500">
                  <LoaderCircle className="size-4 animate-spin text-orange-600" />
                  Menyiapkan Google Sign-In...
                </div>
              ) : null}
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
              Login Google belum diaktifkan pada aplikasi ini.
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
