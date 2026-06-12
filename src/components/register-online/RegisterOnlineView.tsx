"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

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
import {
  CLASS_OPTIONS_BY_PROGRAM,
  MembershipRequestError,
  ONLINE_PACKAGES,
  PROGRAM_OPTIONS,
  formatRupiah,
  getPackageByKey,
  membershipService,
  type OnlinePackageKey,
  type ProgramOptionValue,
  type RegisterBranchOption,
  type RegisterOnlinePayload,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type RegisterOnlineViewProps = {
  initialPackageKey?: OnlinePackageKey;
};

const DEFAULT_PACKAGE_KEY: OnlinePackageKey = "3-bulan";

function resolvePackageKey(packageKey?: OnlinePackageKey): OnlinePackageKey {
  const matchedPackage = ONLINE_PACKAGES.find((item) => item.packageKey === packageKey);

  return matchedPackage?.packageKey ?? DEFAULT_PACKAGE_KEY;
}

function InputError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export default function RegisterOnlineView({ initialPackageKey }: RegisterOnlineViewProps) {
  const router = useRouter();
  const resolvedInitialPackageKey = useMemo(
    () => resolvePackageKey(initialPackageKey),
    [initialPackageKey],
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [branchOptions, setBranchOptions] = useState<RegisterBranchOption[]>([]);
  const [branchOptionsLoading, setBranchOptionsLoading] = useState(true);
  const [branchOptionsError, setBranchOptionsError] = useState("");
  const [formValues, setFormValues] = useState<RegisterOnlinePayload>(() => ({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    branch: "",
    program: "SMP",
    classLevel: "Kelas 7",
    packageKey: resolvedInitialPackageKey,
  }));

  const classOptions = useMemo(
    () => CLASS_OPTIONS_BY_PROGRAM[formValues.program],
    [formValues.program],
  );
  const selectedPackage = getPackageByKey(formValues.packageKey);
  const selectedMonthlyPrice = Math.round(selectedPackage.amount / selectedPackage.durationMonth);

  useEffect(() => {
    let isMounted = true;

    async function loadBranchOptions() {
      try {
        setBranchOptionsLoading(true);
        setBranchOptionsError("");

        const response = await membershipService.getRegisterBranchOptions();
        const nextBranchOptions = Array.isArray(response.data?.branches)
          ? response.data.branches
          : [];

        if (!isMounted) {
          return;
        }

        setBranchOptions(nextBranchOptions);

        if (!nextBranchOptions.length) {
          setBranchOptionsError("Cabang aktif belum tersedia. Silakan hubungi admin.");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBranchOptions([]);
        setBranchOptionsError(
          error instanceof Error
            ? error.message
            : "Daftar cabang belum bisa dimuat saat ini.",
        );
      } finally {
        if (isMounted) {
          setBranchOptionsLoading(false);
        }
      }
    }

    void loadBranchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const response = await membershipService.register(formValues);
      const nextPath = response.data?.payment?.paymentId
        ? `/register-online/payment/${response.data.payment.paymentId}`
        : response.data?.statusPagePath ?? "/register-online/status";

      router.push(nextPath);
    } catch (error) {
      if (error instanceof MembershipRequestError) {
        setErrorMessage(error.message);

        if (error.errors && typeof error.errors === "object" && !Array.isArray(error.errors)) {
          setFieldErrors(error.errors as Record<string, string>);
        }
      } else {
        setErrorMessage("Pendaftaran online belum berhasil diproses. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  function updateProgram(programValue: ProgramOptionValue) {
    const nextClassOptions = CLASS_OPTIONS_BY_PROGRAM[programValue];

    setFormValues((current) => ({
      ...current,
      program: programValue,
      classLevel: nextClassOptions.some((item) => item === current.classLevel)
        ? current.classLevel
        : nextClassOptions[0],
    }));
  }

  function updatePackage(packageKey: OnlinePackageKey) {
    setFormValues((current) => ({
      ...current,
      packageKey,
    }));
  }

  const isSubmitDisabled =
    loading || branchOptionsLoading || Boolean(branchOptionsError) || !branchOptions.length;

  return (
    <AuthShell
      variant="immersive"
      title="Daftar online membership"
      description="Lengkapi data siswa, pilih paket belajar, lalu lanjutkan ke proses pembayaran."
      panelClassName="max-w-[980px]"
      footer={
        <div className="space-y-2 text-center text-sm text-slate-500">
          <p>
            Sudah punya akun siswa?{" "}
            <Link
              href="/login"
              className="font-semibold text-orange-600 transition hover:text-orange-700"
            >
              Masuk di sini
            </Link>
          </p>
          <p>
            <Link
              href="/"
              className="font-medium text-slate-500 transition hover:text-orange-600"
            >
              Kembali ke landing page
            </Link>
          </p>
        </div>
      }
    >
      <form className="mx-auto max-w-[860px] space-y-3" onSubmit={handleSubmit}>
        <div className="rounded-[28px] border border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_26px_44px_-34px_rgba(249,115,22,0.22)] sm:p-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
              Paket {selectedPackage.packageName}
            </span>
            <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              {formatRupiah(selectedPackage.amount)}
            </span>
            <span className="inline-flex items-center rounded-full border border-orange-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              {selectedPackage.durationMonth} bulan
            </span>
            {initialPackageKey ? (
              <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
                Dipilih dari landing
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nama" className="text-sm font-medium text-orange-700">
                Nama siswa
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
                placeholder="Masukkan nama lengkap siswa"
                className="mt-2 h-[52px] rounded-[20px] border-orange-100 bg-white"
                autoComplete="name"
                required
              />
              <InputError message={fieldErrors.nama} />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-orange-700">
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
                className="mt-2 h-[52px] rounded-[20px] border-orange-100 bg-white"
                autoComplete="email"
                required
              />
              <InputError message={fieldErrors.email} />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium text-orange-700">
                Nomor HP
              </label>
              <Input
                id="phone"
                value={formValues.phone}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="08xxxxxxxxxx"
                className="mt-2 h-[52px] rounded-[20px] border-orange-100 bg-white"
                autoComplete="tel"
                required
              />
              <InputError message={fieldErrors.phone} />
            </div>

            <div>
              <label htmlFor="program" className="text-sm font-medium text-orange-700">
                Jenjang / Program
              </label>
              <Select value={formValues.program} onValueChange={updateProgram}>
                <SelectTrigger
                  id="program"
                  className="mt-2 h-[52px] rounded-[20px] border-orange-100 bg-white"
                >
                  <SelectValue placeholder="Pilih jenjang" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={fieldErrors.program} />
            </div>

            <div>
              <label htmlFor="branch" className="text-sm font-medium text-orange-700">
                Cabang
              </label>
              <Select
                value={formValues.branch}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    branch: value,
                  }))
                }
                disabled={branchOptionsLoading || branchOptions.length === 0}
              >
                <SelectTrigger
                  id="branch"
                  className="mt-2 h-[52px] rounded-[20px] border-orange-100 bg-white"
                >
                  <SelectValue
                    placeholder={
                      branchOptionsLoading
                        ? "Memuat cabang aktif..."
                        : "Pilih cabang"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.shortAddress
                        ? `${branch.name} - ${branch.shortAddress}`
                        : branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={fieldErrors.branch || branchOptionsError} />
            </div>

            <div>
              <label htmlFor="classLevel" className="text-sm font-medium text-orange-700">
                Kelas
              </label>
              <Select
                value={formValues.classLevel}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    classLevel: value,
                  }))
                }
              >
                <SelectTrigger
                  id="classLevel"
                  className="mt-2 h-[52px] rounded-[20px] border-orange-100 bg-white"
                >
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={fieldErrors.classLevel} />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-orange-700">
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
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pr-12"
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
              <label htmlFor="confirmPassword" className="text-sm font-medium text-orange-700">
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
                  className="h-[52px] rounded-[20px] border-orange-100 bg-white pr-12"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-orange-600"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <InputError message={fieldErrors.confirmPassword} />
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-orange-100/80 bg-white/88 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Pilih paket belajar</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Membership aktif dimulai setelah pembayaran berhasil dikonfirmasi.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
                {ONLINE_PACKAGES.length} pilihan paket
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {ONLINE_PACKAGES.map((item) => {
                const isActive = formValues.packageKey === item.packageKey;

                return (
                  <button
                    key={item.packageKey}
                    type="button"
                    onClick={() => updatePackage(item.packageKey)}
                    className={cn(
                      "rounded-[22px] border p-4 text-left transition-all duration-300",
                      isActive
                        ? "border-orange-300 bg-[linear-gradient(180deg,rgba(255,247,237,0.98),rgba(255,255,255,0.98))] shadow-[0_22px_34px_-30px_rgba(249,115,22,0.26)]"
                        : "border-slate-200/90 bg-white hover:border-orange-200 hover:bg-orange-50/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.packageName}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.highlight}</p>
                      </div>
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-[16px] border",
                          isActive
                            ? "border-orange-200 bg-white text-orange-600"
                            : "border-slate-200 bg-slate-50 text-slate-400",
                        )}
                      >
                        <BookOpen className="size-4" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 font-semibold text-slate-800">
                        <CreditCard className="size-4 text-orange-500" />
                        {formatRupiah(item.amount)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-slate-500">
                        <Clock3 className="size-4 text-orange-500" />
                        {item.durationMonth} bulan
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <InputError message={fieldErrors.packageKey} />
          </div>

          <div className="mt-5 rounded-[24px] border border-orange-100/80 bg-white/88 p-4 shadow-[0_16px_28px_-26px_rgba(249,115,22,0.12)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Ringkasan membership
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {selectedPackage.packageName}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Status subscription dan pembayaran akan dibuat `pending`, lalu otomatis aktif
                  setelah pembayaran dikonfirmasi.
                </p>
              </div>

              <div className="rounded-[18px] border border-orange-100 bg-orange-50/70 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Total harga
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatRupiah(selectedPackage.amount)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatRupiah(selectedMonthlyPrice)} / bulan
                </p>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="secondary"
            className="mt-5 h-11 w-full justify-center rounded-[16px] bg-[linear-gradient(135deg,#f97316_0%,#f59e0b_100%)] text-sm shadow-[0_18px_34px_-24px_rgba(249,115,22,0.48)] hover:brightness-105"
            disabled={isSubmitDisabled}
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Membuat akun dan tagihan...
              </>
            ) : branchOptionsLoading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Memuat cabang aktif...
              </>
            ) : (
              <>
                Daftar & Buat Tagihan
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
