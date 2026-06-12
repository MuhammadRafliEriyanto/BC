"use client";

import { useState } from "react";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthRequestError, USER_ROLES, authService, type UserRole } from "@/lib/auth";

function InputError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "siswa" as UserRole,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    try {
      const response = await authService.register(formValues);

      setSuccessMessage(
        response.data?.email
          ? `${response.message} Link verifikasi dikirim ke ${response.data.email}.`
          : response.message,
      );
      setFormValues({
        nama: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "siswa",
      });
    } catch (error) {
      if (error instanceof AuthRequestError) {
        setErrorMessage(error.message);

        if (error.errors && typeof error.errors === "object" && !Array.isArray(error.errors)) {
          setFieldErrors(error.errors as Record<string, string>);
        }
      } else {
        setErrorMessage("Registrasi gagal diproses. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Registrasi"
      title="Buat akun LMS baru"
      description="Pendaftaran ini akan mengirim email verifikasi. Akun baru belum bisa login sebelum link verifikasi dibuka."
      footer={
        <p className="text-sm leading-7 text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-orange-600 transition hover:text-orange-700">
            Masuk di sini
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nama" className="text-sm font-medium text-slate-700">
            Nama lengkap
          </label>
          <Input
            id="nama"
            value={formValues.nama}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                nama: event.target.value,
              }))
            }
            placeholder="Masukkan nama lengkap"
            className="mt-2"
            autoComplete="name"
            required
          />
          <InputError message={fieldErrors.nama} />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="nama@email.com"
            className="mt-2"
            autoComplete="email"
            required
          />
          <InputError message={fieldErrors.email} />
        </div>

        <div>
          <label htmlFor="role" className="text-sm font-medium text-slate-700">
            Role
          </label>
          <Select
            value={formValues.role}
            onValueChange={(value) =>
              setFormValues((current) => ({
                ...current,
                role: value as UserRole,
              }))
            }
          >
            <SelectTrigger id="role" className="mt-2">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <InputError message={fieldErrors.role} />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formValues.password}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Minimal 8 karakter"
              className="pr-12"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <InputError message={fieldErrors.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Konfirmasi password
          </label>
          <div className="relative mt-2">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formValues.confirmPassword}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              placeholder="Ulangi password"
              className="pr-12"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
              aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <InputError message={fieldErrors.confirmPassword} />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          variant="secondary"
          className="w-full justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Menyimpan akun...
            </>
          ) : (
            "Daftar akun"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
