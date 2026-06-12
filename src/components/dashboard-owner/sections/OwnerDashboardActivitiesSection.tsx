/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";

import { OwnerActivityDetailDialog } from "@/components/dashboard-owner/sections/activities/OwnerActivityDetailDialog";
import { OwnerIncomingPaymentsTable } from "@/components/dashboard-owner/sections/activities/OwnerIncomingPaymentsTable";
import { OwnerActivitySummaryCards } from "@/components/dashboard-owner/sections/activities/OwnerActivitySummaryCards";
import { OwnerStudentActivationsTable } from "@/components/dashboard-owner/sections/activities/OwnerStudentActivationsTable";
import type {
  BranchFilter,
  IncomingPaymentStatusFilter,
  MembershipActivationFilter,
  OwnerIncomingPaymentRecord,
  OwnerStudentActivationRecord,
  PaymentTab,
  StudentClassFilter,
  StudentLevelFilter,
} from "@/components/dashboard-owner/sections/activities/owner-activity-types";
import {
  allBranchFilter,
  allClassOptions,
  classOptionsByLevel,
  combinedIncomingPaymentStatusFilter,
  createExportFileName,
  escapeCsvCell,
  getBranchFilterOptions,
  inactiveActivationStatusFilter,
  mapRouteActivationStatusToFilter,
  mapRouteIncomingStatusToFilter,
  triggerDownload,
} from "@/components/dashboard-owner/sections/activities/owner-activity-utils";
import { subscribeOwnerDashboardRefresh } from "@/components/dashboard-owner/dashboard-refresh-events";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  defaultOwnerActivitiesRouteState,
  type OwnerActivitiesRouteState,
} from "@/lib/owner-dashboard-routing";
import { fetchOwnerActivities } from "@/lib/owner-activities";

type OwnerDashboardActivitiesSectionProps = {
  initialRouteState?: OwnerActivitiesRouteState;
};

export function OwnerDashboardActivitiesSection({
  initialRouteState = defaultOwnerActivitiesRouteState,
}: OwnerDashboardActivitiesSectionProps) {
  const initialTab: PaymentTab =
    initialRouteState.tab === "aktivasi" ? "aktivasi" : "masuk";
  const routeIncomingStatusFilter = mapRouteIncomingStatusToFilter(
    initialRouteState.incomingStatus,
  );
  const routeActivationStatusFilter = mapRouteActivationStatusToFilter(
    initialRouteState.activationStatus,
  );
  const [activeTab, setActiveTab] = useState<PaymentTab>(initialTab);

  const [incomingSearchQuery, setIncomingSearchQuery] = useState("");
  const [incomingBranchFilter, setIncomingBranchFilter] =
    useState<BranchFilter>(allBranchFilter);
  const [incomingStatusFilter, setIncomingStatusFilter] =
    useState<IncomingPaymentStatusFilter>(routeIncomingStatusFilter);

  const [activationSearchQuery, setActivationSearchQuery] = useState("");
  const [activationBranchFilter, setActivationBranchFilter] =
    useState<BranchFilter>(allBranchFilter);
  const [activationStatusFilter, setActivationStatusFilter] =
    useState<MembershipActivationFilter>(routeActivationStatusFilter);
  const [levelFilter, setLevelFilter] = useState<StudentLevelFilter>("Semua");
  const [classFilter, setClassFilter] = useState<StudentClassFilter>("Semua");

  const [selectedIncomingPaymentId, setSelectedIncomingPaymentId] = useState<
    string | null
  >(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [incomingPayments, setIncomingPayments] = useState<OwnerIncomingPaymentRecord[]>(
    [],
  );
  const [activationStudents, setActivationStudents] = useState<
    OwnerStudentActivationRecord[]
  >([]);
  const [studentBranchAvailable, setStudentBranchAvailable] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setIncomingSearchQuery("");
    setIncomingBranchFilter(allBranchFilter);
    setIncomingStatusFilter(routeIncomingStatusFilter);
    setActivationSearchQuery("");
    setActivationBranchFilter(allBranchFilter);
    setActivationStatusFilter(routeActivationStatusFilter);
    setLevelFilter("Semua");
    setClassFilter("Semua");
    setSelectedIncomingPaymentId(null);
    setSelectedStudentId(null);
  }, [
    initialTab,
    routeActivationStatusFilter,
    routeIncomingStatusFilter,
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function loadOwnerActivities() {
      setIsLoadingActivities(true);
      setActivitiesError(null);

      try {
        const data = await fetchOwnerActivities();

        if (isCancelled) {
          return;
        }

        setIncomingPayments(data.incomingPayments);
        setActivationStudents(data.activationStudents);
        setStudentBranchAvailable(data.studentBranchAvailable);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setIncomingPayments([]);
        setActivationStudents([]);
        setStudentBranchAvailable(false);
        setActivitiesError(
          error instanceof Error
            ? error.message
            : "Data aktivitas owner dari backend belum bisa dimuat.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingActivities(false);
        }
      }
    }

    void loadOwnerActivities();
    const unsubscribe = subscribeOwnerDashboardRefresh(() => {
      void loadOwnerActivities();
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  const incomingBranchOptions = useMemo(
    () => getBranchFilterOptions(incomingPayments),
    [incomingPayments],
  );
  const activationBranchOptions = useMemo(
    () => getBranchFilterOptions(activationStudents),
    [activationStudents],
  );

  const classFilterOptions = useMemo(() => {
    if (levelFilter === "Semua") {
      return allClassOptions;
    }

    return classOptionsByLevel[levelFilter];
  }, [levelFilter]);

  const filteredIncomingPayments = useMemo(() => {
    const query = incomingSearchQuery.trim().toLowerCase();

    return incomingPayments.filter((item) => {
      const matchesQuery = query
        ? item.studentName.toLowerCase().includes(query) ||
          item.branch.toLowerCase().includes(query) ||
          item.packageName.toLowerCase().includes(query) ||
          item.method.toLowerCase().includes(query) ||
          (item.paymentId ?? "").toLowerCase().includes(query)
        : true;
      const matchesBranch =
        incomingBranchFilter === allBranchFilter
          ? true
          : item.branch === incomingBranchFilter;
      const matchesStatus =
        incomingStatusFilter === "Semua"
          ? true
          : incomingStatusFilter === combinedIncomingPaymentStatusFilter
            ? item.status === "failed" || item.status === "expired"
            : item.status === incomingStatusFilter;

      return matchesQuery && matchesBranch && matchesStatus;
    });
  }, [incomingBranchFilter, incomingPayments, incomingSearchQuery, incomingStatusFilter]);

  const filteredStudents = useMemo(() => {
    const query = activationSearchQuery.trim().toLowerCase();

    return activationStudents.filter((item) => {
      const matchesQuery = query
        ? item.studentName.toLowerCase().includes(query) ||
          item.branch.toLowerCase().includes(query) ||
          item.membershipPackage.toLowerCase().includes(query) ||
          item.jenjang.toLowerCase().includes(query) ||
          item.kelas.toLowerCase().includes(query)
        : true;
      const matchesBranch =
        activationBranchFilter === allBranchFilter
          ? true
          : item.branch === activationBranchFilter;
      const matchesStatus =
        activationStatusFilter === "Semua"
          ? true
          : activationStatusFilter === inactiveActivationStatusFilter
            ? item.activationStatus !== "Aktif"
            : item.activationStatus === activationStatusFilter;
      const matchesLevel = levelFilter === "Semua" ? true : item.jenjang === levelFilter;
      const matchesClass = classFilter === "Semua" ? true : item.kelas === classFilter;

      return (
        matchesQuery &&
        matchesBranch &&
        matchesStatus &&
        matchesLevel &&
        matchesClass
      );
    });
  }, [
    activationBranchFilter,
    activationStudents,
    activationSearchQuery,
    activationStatusFilter,
    classFilter,
    levelFilter,
  ]);

  const financialSummary = useMemo(() => {
    const incomingValidated = incomingPayments
      .filter((item) => item.status === "paid")
      .reduce((total, item) => total + item.amount, 0);
    const incomingPending = incomingPayments
      .filter((item) => item.status !== "paid")
      .reduce((total, item) => total + item.amount, 0);

    return {
      incomingValidated,
      incomingPending,
    };
  }, [incomingPayments]);

  const incomingOverview = useMemo(() => {
    const filteredAmount = filteredIncomingPayments.reduce(
      (total, item) => total + item.amount,
      0,
    );
    const paidCount = filteredIncomingPayments.filter((item) => item.status === "paid")
      .length;
    const pendingCount = filteredIncomingPayments.filter((item) => item.status !== "paid")
      .length;

    return {
      totalCount: filteredIncomingPayments.length,
      filteredAmount,
      paidCount,
      pendingCount,
    };
  }, [filteredIncomingPayments]);

  const activationOverview = useMemo(() => {
    const activeCount = filteredStudents.filter(
      (item) => item.activationStatus === "Aktif",
    ).length;
    const pendingCount = filteredStudents.filter(
      (item) => item.activationStatus === "Menunggu Pembayaran",
    ).length;
    const expiredCount = filteredStudents.filter(
      (item) => item.activationStatus === "Expired",
    ).length;
    const failedCount = filteredStudents.filter(
      (item) => item.activationStatus === "Pembayaran Gagal",
    ).length;

    return {
      totalCount: filteredStudents.length,
      activeCount,
      pendingCount,
      expiredCount,
      failedCount,
    };
  }, [filteredStudents]);

  const selectedIncomingPayment = useMemo(
    () =>
      selectedIncomingPaymentId
        ? incomingPayments.find((item) => item.id === selectedIncomingPaymentId) ?? null
        : null,
    [incomingPayments, selectedIncomingPaymentId],
  );

  const selectedStudent = useMemo(
    () =>
      selectedStudentId
        ? activationStudents.find((item) => item.id === selectedStudentId) ?? null
        : null,
    [activationStudents, selectedStudentId],
  );

  const hasIncomingFilters =
    incomingSearchQuery.trim().length > 0 ||
    incomingBranchFilter !== allBranchFilter ||
    incomingStatusFilter !== "Semua";

  const hasActivationFilters =
    activationSearchQuery.trim().length > 0 ||
    activationBranchFilter !== allBranchFilter ||
    activationStatusFilter !== "Semua" ||
    levelFilter !== "Semua" ||
    classFilter !== "Semua";

  function handleLevelFilterChange(value: string) {
    setLevelFilter(value as StudentLevelFilter);
    setClassFilter("Semua");
  }

  function resetIncomingFilters() {
    setIncomingSearchQuery("");
    setIncomingBranchFilter(allBranchFilter);
    setIncomingStatusFilter("Semua");
  }

  function resetActivationFilters() {
    setActivationSearchQuery("");
    setActivationBranchFilter(allBranchFilter);
    setActivationStatusFilter("Semua");
    setLevelFilter("Semua");
    setClassFilter("Semua");
  }

  function exportIncomingPayments(format: "csv" | "json") {
    if (filteredIncomingPayments.length === 0) {
      return;
    }

    const exportRows = filteredIncomingPayments.map((payment) => ({
      namaSiswa: payment.studentName,
      cabang: payment.branch,
      paket: payment.packageName,
      metode: payment.method,
      jumlah: payment.amount,
      status: payment.status,
      tanggalBayar: payment.paidAt ?? "",
      expiredAt: payment.expiresAt ?? "",
      paymentId: payment.paymentId ?? "",
      subscriptionCode: payment.subscriptionCode ?? "",
    }));

    if (format === "json") {
      triggerDownload(
        createExportFileName("pembayaran-masuk", "json"),
        JSON.stringify(exportRows, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }

    const csvContent = [
      "nama siswa,cabang,paket,metode,jumlah,status,tanggal bayar,expired at,payment id,subscription code",
      ...exportRows.map((payment) =>
        [
          escapeCsvCell(payment.namaSiswa),
          escapeCsvCell(payment.cabang),
          escapeCsvCell(payment.paket),
          escapeCsvCell(payment.metode),
          escapeCsvCell(String(payment.jumlah)),
          escapeCsvCell(payment.status),
          escapeCsvCell(payment.tanggalBayar),
          escapeCsvCell(payment.expiredAt),
          escapeCsvCell(payment.paymentId),
          escapeCsvCell(payment.subscriptionCode),
        ].join(","),
      ),
    ].join("\n");

    triggerDownload(
      createExportFileName("pembayaran-masuk", "csv"),
      csvContent,
      "text/csv;charset=utf-8",
    );
  }

  function exportActivationStudents(format: "csv" | "json") {
    if (filteredStudents.length === 0) {
      return;
    }

    const exportRows = filteredStudents.map((student) => ({
      namaSiswa: student.studentName,
      cabang: student.branch,
      jenjang: student.jenjang,
      kelas: student.classLabel,
      paketMembership: student.membershipPackage,
      pembayaran: student.paymentStatus,
      statusAktivasi: student.activationStatus,
      tanggalDaftar: student.registeredAt,
      activeUntil: student.activeUntil ?? "",
      paymentId: student.paymentId ?? "",
      subscriptionCode: student.subscriptionCode,
    }));

    if (format === "json") {
      triggerDownload(
        createExportFileName("aktivasi-siswa", "json"),
        JSON.stringify(exportRows, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }

    const csvContent = [
      "nama siswa,cabang,jenjang,kelas,paket membership,status pembayaran,status aktivasi,tanggal daftar,active until,payment id,subscription code",
      ...exportRows.map((student) =>
        [
          escapeCsvCell(student.namaSiswa),
          escapeCsvCell(student.cabang),
          escapeCsvCell(student.jenjang),
          escapeCsvCell(student.kelas),
          escapeCsvCell(student.paketMembership),
          escapeCsvCell(student.pembayaran),
          escapeCsvCell(student.statusAktivasi),
          escapeCsvCell(student.tanggalDaftar),
          escapeCsvCell(student.activeUntil),
          escapeCsvCell(student.paymentId),
          escapeCsvCell(student.subscriptionCode),
        ].join(","),
      ),
    ].join("\n");

    triggerDownload(
      createExportFileName("aktivasi-siswa", "csv"),
      csvContent,
      "text/csv;charset=utf-8",
    );
  }

  const incomingPanelNote = studentBranchAvailable
    ? "Owner hanya memantau. Tidak ada aksi edit atau hapus di halaman ini."
    : "Owner hanya memantau. Tidak ada aksi edit atau hapus di halaman ini. Kolom cabang siswa masih belum tersedia di backend, jadi sementara ditampilkan sebagai Belum diatur.";

  const activationPanelNote = studentBranchAvailable
    ? "Status aktivasi mengikuti hasil pembayaran otomatis."
    : "Status aktivasi mengikuti hasil pembayaran otomatis. Cabang siswa belum tersedia di backend, jadi sementara ditampilkan sebagai Belum diatur.";

  const incomingEmptyDescription = isLoadingActivities
    ? "Sedang memuat data pembayaran masuk dari backend."
    : activitiesError
      ? activitiesError
      : hasIncomingFilters
        ? "Ubah pencarian atau filter agar data kembali tampil."
        : "Belum ada data pembayaran masuk dari backend.";

  const activationEmptyDescription = isLoadingActivities
    ? "Sedang memuat data aktivasi siswa dari backend."
    : activitiesError
      ? activitiesError
      : hasActivationFilters
        ? "Ubah pencarian atau filter agar data kembali tampil."
        : "Belum ada data aktivasi siswa dari backend.";

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Aktivitas Pembayaran
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Pantau pembayaran masuk siswa dan aktivasi siswa dalam satu tampilan
              ringkas tanpa area input data.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-600"
          >
            View only
          </Badge>
        </div>
      </section>

      {activitiesError ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          Data aktivitas owner belum bisa dimuat penuh dari backend. Halaman tetap
          menampilkan state kosong yang jujur tanpa data dummy.
        </section>
      ) : null}

      <OwnerActivitySummaryCards
        activationOverview={activationOverview}
        financialSummary={financialSummary}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PaymentTab)}>
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-2 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.12)]">
          <TabsList className="grid w-full grid-cols-1 rounded-[20px] bg-slate-100/80 p-1 sm:grid-cols-2">
            <TabsTrigger
              value="masuk"
              className="rounded-2xl px-5 py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
            >
              Pembayaran Masuk
            </TabsTrigger>
            <TabsTrigger
              value="aktivasi"
              className="rounded-2xl px-5 py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
            >
              Aktivasi Siswa
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="masuk" className="space-y-4">
          <OwnerIncomingPaymentsTable
            branchFilter={incomingBranchFilter}
            branchOptions={incomingBranchOptions}
            emptyDescription={incomingEmptyDescription}
            hasActiveFilters={hasIncomingFilters}
            isLoading={isLoadingActivities}
            overview={incomingOverview}
            panelNote={incomingPanelNote}
            payments={filteredIncomingPayments}
            searchQuery={incomingSearchQuery}
            statusFilter={incomingStatusFilter}
            onBranchFilterChange={setIncomingBranchFilter}
            onExport={exportIncomingPayments}
            onOpenDetail={setSelectedIncomingPaymentId}
            onResetFilters={resetIncomingFilters}
            onSearchQueryChange={setIncomingSearchQuery}
            onStatusFilterChange={setIncomingStatusFilter}
          />
        </TabsContent>

        <TabsContent value="aktivasi" className="space-y-4">
          <OwnerStudentActivationsTable
            activationBranchFilter={activationBranchFilter}
            activationBranchOptions={activationBranchOptions}
            activationStatusFilter={activationStatusFilter}
            classFilter={classFilter}
            classFilterOptions={classFilterOptions}
            emptyDescription={activationEmptyDescription}
            hasActiveFilters={hasActivationFilters}
            levelFilter={levelFilter}
            overview={activationOverview}
            panelNote={activationPanelNote}
            searchQuery={activationSearchQuery}
            students={filteredStudents}
            onActivationBranchFilterChange={setActivationBranchFilter}
            onActivationStatusFilterChange={setActivationStatusFilter}
            onClassFilterChange={setClassFilter}
            onExport={exportActivationStudents}
            onLevelFilterChange={handleLevelFilterChange}
            onOpenDetail={setSelectedStudentId}
            onResetFilters={resetActivationFilters}
            onSearchQueryChange={setActivationSearchQuery}
          />
        </TabsContent>
      </Tabs>

      <OwnerActivityDetailDialog
        selectedIncomingPayment={selectedIncomingPayment}
        selectedStudent={selectedStudent}
        onCloseIncomingPayment={() => setSelectedIncomingPaymentId(null)}
        onCloseStudent={() => setSelectedStudentId(null)}
      />
    </div>
  );
}
