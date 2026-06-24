import type { Metadata } from "next";

import TryoutGuruSection from "@/components/dashboard-guru/sections/TryoutGuruSection";

export const metadata: Metadata = {
  title: "Manajemen Ujian Guru",
  description:
    "Halaman guru untuk mengelola UTS, UAS, dan Tryout beserta soal dan hasil siswa.",
};

export default function DashboardGuruUjianPage() {
  return <TryoutGuruSection />;
}
