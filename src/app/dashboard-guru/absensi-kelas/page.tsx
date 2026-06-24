import type { Metadata } from "next";

import AbsensiKelasSection from "@/components/dashboard-guru/sections/AbsensiKelasSection";

export const metadata: Metadata = {
  title: "Absensi Kelas Guru",
  description: "Halaman absensi kelas guru dengan QR dinamis.",
};

export default async function DashboardGuruAbsensiKelasPage({
  searchParams,
}: {
  searchParams: Promise<{ kelasId?: string }>;
}) {
  const params = await searchParams;

  return (
    <AbsensiKelasSection
      key={params.kelasId ?? "default"}
      kelasId={params.kelasId ?? null}
    />
  );
}
