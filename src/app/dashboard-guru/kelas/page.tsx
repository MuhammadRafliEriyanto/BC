import type { Metadata } from "next";

import SemuaKelasGuruSection from "@/components/dashboard-guru/sections/SemuaKelasGuruSection";

export const metadata: Metadata = {
  title: "Semua Kelas Guru",
  description: "Halaman daftar seluruh kelas guru dengan statistik dan filter.",
};

export default function DashboardGuruKelasPage() {
  return <SemuaKelasGuruSection />;
}
