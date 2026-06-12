import type { Metadata } from "next";

import { GuruTopbar } from "@/components/dashboard-guru/components";
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
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_18%),linear-gradient(180deg,#fffdf9_0%,#ffffff_52%,#fff7ed_100%)]">
      <GuruTopbar />
      <DetailKelasGuruSection
        key={params.kelasId ?? "default"}
        kelasId={params.kelasId ?? null}
      />
    </main>
  );
}
