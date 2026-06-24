import type { Metadata } from "next";

import DetailKelasGuruSection from "@/components/dashboard-guru/sections/DetailKelasGuruSection";

export const metadata: Metadata = {
  title: "Detail Kelas Guru",
  description: "Halaman detail kelas guru dengan peserta, tugas, dan nilai.",
};

export default async function DashboardGuruDetailKelasPage({
  searchParams,
}: {
  searchParams: Promise<{ kelasId?: string }>;
}) {
  const params = await searchParams;

  return (
    <DetailKelasGuruSection
      key={params.kelasId ?? "default"}
      kelasId={params.kelasId ?? null}
    />
  );
}
