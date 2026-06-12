/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  CalendarClock,
  FilterX,
  LoaderCircle,
  PencilLine,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  OwnerExpensesManager,
} from "@/components/dashboard-owner/hooks/useOwnerExpenses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type OwnerDashboardExpensesSectionProps = {
  manager: OwnerExpensesManager;
};

const flashToneClasses = {
  success: "border-emerald-200/80 bg-emerald-50/85 text-emerald-700",
  warning: "border-amber-200/80 bg-amber-50/85 text-amber-700",
  danger: "border-red-200/80 bg-red-50/85 text-red-700",
  info: "border-sky-200/80 bg-sky-50/85 text-sky-700",
} as const;

const expenseStatusMeta = {
  Menunggu: {
    badgeVariant: "warning" as const,
    label: "Menunggu",
  },
  Dijadwalkan: {
    badgeVariant: "secondary" as const,
    label: "Dijadwalkan",
  },
  Selesai: {
    badgeVariant: "success" as const,
    label: "Selesai",
  },
  Dibatalkan: {
    badgeVariant: "danger" as const,
    label: "Dibatalkan",
  },
} as const;

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function InputError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs leading-5 text-rose-600">{message}</p>;
}

export function OwnerDashboardExpensesSection({
  manager,
}: OwnerDashboardExpensesSectionProps) {
  const [recipientSuggestionValue, setRecipientSuggestionValue] = useState("__none__");
  const hasActiveFilters =
    manager.searchQuery.trim().length > 0 ||
    manager.categoryFilter !== "Semua" ||
    manager.statusFilter !== "Semua";

  const isTeacherSalary = manager.form.category === "Gaji Guru";
  const isAdminSalary = manager.form.category === "Gaji Admin";
  const recipientSuggestions = isTeacherSalary
    ? manager.teacherRecipientOptions
    : isAdminSalary
      ? manager.adminRecipientOptions
      : [];
  const recipientSuggestionLabel = isTeacherSalary
    ? "Pilih dari data guru"
    : isAdminSalary
      ? "Pilih dari data admin cabang"
      : null;

  useEffect(() => {
    setRecipientSuggestionValue("__none__");
  }, [manager.dialog.isOpen, manager.form.category]);

  const summary = useMemo(() => {
    const totalAmount = manager.expenses.reduce((total, expense) => total + expense.amount, 0);
    const pendingCount = manager.expenses.filter(
      (expense) => expense.status === "Menunggu" || expense.status === "Dijadwalkan",
    ).length;
    const completedCount = manager.expenses.filter(
      (expense) => expense.status === "Selesai",
    ).length;

    return {
      totalAmount,
      pendingCount,
      completedCount,
    };
  }, [manager.expenses]);

  const emptyStateTitle = manager.isLoading
    ? "Memuat data pengeluaran..."
    : hasActiveFilters
      ? "Belum ada pengeluaran yang cocok"
      : "Belum ada data pengeluaran";
  const emptyStateDescription = manager.isLoading
    ? "Daftar pengeluaran dari sistem sedang diambil."
    : hasActiveFilters
      ? "Coba ubah kata kunci pencarian atau reset filter agar data kembali tampil."
      : "Tambahkan pengeluaran pertama agar monitoring owner dan aktivitas pembayaran keluar ikut terisi.";

  function handleDeleteExpense(expenseId: string, expenseTitle: string) {
    const confirmed = window.confirm(`Hapus pengeluaran ${expenseTitle}?`);

    if (!confirmed) {
      return;
    }

    manager.removeExpense(expenseId);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Pengeluaran
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Kelola pengeluaran operasional yang otomatis akan muncul juga pada
              monitoring owner di menu Pembayaran.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-600"
          >
            Kelola Pengeluaran
          </Badge>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            Transaksi
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {manager.filteredExpenseCount} pengeluaran
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {manager.filteredExpenseCount} dari {manager.totalExpenses} data sesuai filter.
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            Nominal
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(summary.totalAmount)}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Akumulasi pengeluaran yang sedang tampil di tabel.
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Status
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {summary.completedCount} selesai
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {summary.pendingCount} masih menunggu atau dijadwalkan.
          </p>
        </div>
      </div>

      <section className="space-y-5 rounded-[30px] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.14)]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                Daftar pengeluaran gaji
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Halaman ini difokuskan untuk gaji guru dan gaji admin. Cabang akan
                mengikuti data guru atau admin yang dipilih.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-full xl:w-auto"
              onClick={manager.openCreateDialog}
            >
              <Plus className="size-4" />
              Tambah pengeluaran
            </Button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={manager.searchQuery}
                onChange={(event) => manager.setSearchQuery(event.target.value)}
                placeholder="Cari judul, penerima, kategori, metode, atau ID..."
                className="pl-10"
              />
            </div>

            <Select
              value={manager.categoryFilter}
              onValueChange={(value) =>
                manager.setCategoryFilter(value as typeof manager.categoryFilter)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter kategori" />
              </SelectTrigger>
              <SelectContent>
                {manager.categoryFilterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={manager.statusFilter}
              onValueChange={(value) =>
                manager.setStatusFilter(value as typeof manager.statusFilter)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {manager.statusFilterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-start xl:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={manager.resetFilters}
                disabled={!hasActiveFilters}
              >
                <FilterX className="size-4" />
                Reset filter
              </Button>
            </div>
          </div>

          {manager.flash ? (
            <div
              className={cn(
                "flex flex-col gap-3 rounded-[24px] border px-4 py-3 text-sm leading-6 sm:flex-row sm:items-start sm:justify-between",
                flashToneClasses[manager.flash.tone],
              )}
            >
              <p>{manager.flash.message}</p>
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-full px-3 text-current hover:bg-black/5 hover:text-current"
                onClick={manager.dismissFlash}
              >
                Tutup
              </Button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200/80 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.1)]">
          <Table className="min-w-[1120px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-200/70">
                <TableHead className="w-16 px-6 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  No
                </TableHead>
                <TableHead className="w-32 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  ID
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Judul
                </TableHead>
                <TableHead className="w-52 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Kategori / Penerima
                </TableHead>
                <TableHead className="w-40 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Nominal
                </TableHead>
                <TableHead className="w-44 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Status
                </TableHead>
                <TableHead className="w-40 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Tanggal
                </TableHead>
                <TableHead className="w-32 px-6 text-center text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manager.expenses.length > 0 ? (
                manager.expenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className="border-slate-200/70 transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="px-6 text-sm font-semibold text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {expense.expenseId}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{expense.title}</p>
                        <p className="text-xs text-slate-400">
                          {expense.paymentMethod || "Metode belum diisi"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {expense.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          {expense.vendorOrRecipient}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={expenseStatusMeta[expense.status].badgeVariant}
                        className="rounded-full px-3 py-1.5"
                      >
                        {expenseStatusMeta[expense.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(expense.paidAt ?? expense.dueDate ?? expense.updatedAt)}
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-10 rounded-full"
                          onClick={() => manager.openEditDialog(expense.id)}
                        >
                          <PencilLine className="size-4" />
                          <span className="sr-only">Edit pengeluaran</span>
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-10 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() =>
                            handleDeleteExpense(expense.id, expense.title)
                          }
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Hapus pengeluaran</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                        <ReceiptText className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-900">
                          {emptyStateTitle}
                        </p>
                        <p className="max-w-md text-sm leading-6 text-slate-500">
                          {emptyStateDescription}
                        </p>
                      </div>
                      {!manager.isLoading ? (
                        <Button
                          type="button"
                          variant="subtle"
                          className="rounded-full"
                          onClick={manager.openCreateDialog}
                        >
                          <Plus className="size-4" />
                          Tambah pengeluaran
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={manager.dialog.isOpen} onOpenChange={(open) => !open && manager.closeDialog()}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-3xl p-0 sm:w-[calc(100%-2rem)]">
          <form
            className="flex max-h-[min(88vh,820px)] flex-col overflow-hidden"
            onSubmit={(event) => {
              event.preventDefault();
              manager.submitForm();
            }}
          >
            <DialogHeader className="shrink-0 border-b border-slate-200/70 px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
              <DialogTitle>{manager.dialog.title}</DialogTitle>
              <DialogDescription>{manager.dialog.description}</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="expense-title">
                    Judul pengeluaran
                  </label>
                  <div className="relative">
                    <ReceiptText className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="expense-title"
                      value={manager.form.title}
                      onChange={(event) =>
                        manager.updateFormValue("title", event.target.value)
                      }
                      placeholder="Contoh: Gaji Admin Mei 2026"
                      className="pl-10"
                    />
                  </div>
                  <InputError message={manager.dialog.fieldErrors.title} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Kategori</label>
                  <Select
                    value={manager.form.category}
                    onValueChange={(value) =>
                      manager.updateFormValue("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {manager.categoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-5 text-slate-500">
                    Pilih jenis gaji yang ingin dicatat.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Cabang
                  </label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                    Cabang akan mengikuti data guru atau admin yang dipilih, dengan
                    fokus pada cabang Slawi dan Adiwerna.
                  </div>
                </div>

                {recipientSuggestionLabel ? (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      {recipientSuggestionLabel}
                    </label>
                    {recipientSuggestions.length > 0 ? (
                      <Select
                        value={recipientSuggestionValue}
                        onValueChange={(value) => {
                          setRecipientSuggestionValue(value);

                          if (value !== "__none__") {
                            manager.applyRecipientSuggestion(value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={recipientSuggestionLabel} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Pilih data penerima</SelectItem>
                          {recipientSuggestions.map((option) => (
                            <SelectItem key={option.id} value={option.name}>
                              {option.name}
                              {option.subtitle ? ` - ${option.subtitle}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                        Opsi dropdown belum tersedia saat ini. Isi penerima secara manual
                        pada field di bawah. Cabang akan memakai data terakhir yang
                        tersedia.
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="space-y-2 md:col-span-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="expense-recipient"
                  >
                    Vendor / penerima
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="expense-recipient"
                      value={manager.form.vendorOrRecipient}
                      onChange={(event) =>
                        manager.updateFormValue("vendorOrRecipient", event.target.value)
                      }
                      placeholder="Contoh: Budi Santoso / PT Internet Cepat"
                      className="pl-10"
                    />
                  </div>
                  <InputError message={manager.dialog.fieldErrors.vendorOrRecipient} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="expense-amount">
                    Nominal
                  </label>
                  <div className="relative">
                    <WalletCards className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="expense-amount"
                      type="number"
                      min="0"
                      value={manager.form.amount}
                      onChange={(event) =>
                        manager.updateFormValue("amount", event.target.value)
                      }
                      placeholder="500000"
                      className="pl-10"
                    />
                  </div>
                  <InputError message={manager.dialog.fieldErrors.amount} />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="expense-payment-method"
                  >
                    Metode pembayaran
                  </label>
                  <div className="relative">
                    <WalletCards className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="expense-payment-method"
                      value={manager.form.paymentMethod}
                      onChange={(event) =>
                        manager.updateFormValue("paymentMethod", event.target.value)
                      }
                      placeholder="Contoh: Transfer BCA"
                      className="pl-10"
                    />
                  </div>
                  <InputError message={manager.dialog.fieldErrors.paymentMethod} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={manager.form.status}
                    onValueChange={(value) => manager.updateFormValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {manager.statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="expense-paid-at">
                    Tanggal dibayar
                  </label>
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="expense-paid-at"
                      type="date"
                      value={manager.form.paidAt}
                      onChange={(event) =>
                        manager.updateFormValue("paidAt", event.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                <p className="text-xs leading-5 text-slate-500">
                    Jika status Selesai dan tanggal dibayar kosong, sistem akan mengisi
                    otomatis.
                </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="expense-due-date">
                    Jatuh tempo
                  </label>
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="expense-due-date"
                      type="date"
                      value={manager.form.dueDate}
                      onChange={(event) =>
                        manager.updateFormValue("dueDate", event.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="expense-note">
                    Catatan
                  </label>
                  <Textarea
                    id="expense-note"
                    value={manager.form.note}
                    onChange={(event) => manager.updateFormValue("note", event.target.value)}
                    placeholder="Catatan tambahan untuk pengeluaran ini"
                    rows={3}
                  />
                  <InputError message={manager.dialog.fieldErrors.note} />
                </div>
              </div>

              {manager.dialog.error ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  {manager.dialog.error}
                </div>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 border-t border-slate-200/70 bg-white px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={manager.closeDialog}
                disabled={manager.isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="secondary"
                className="rounded-full"
                disabled={manager.isSubmitting}
              >
                {manager.isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {manager.dialog.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
