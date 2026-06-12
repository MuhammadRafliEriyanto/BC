import type { Metadata } from "next";

import { GuruTopbar } from "@/components/dashboard-guru/components";
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
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_18%),linear-gradient(180deg,#fffdf9_0%,#ffffff_52%,#fff7ed_100%)]">
      <GuruTopbar />
      <AbsensiKelasSection
        key={params.kelasId ?? "default"}
        kelasId={params.kelasId ?? null}
      />
    </main>
  );
}
