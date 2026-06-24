import type { Metadata } from "next";

import JadwalGuruSection from "@/components/dashboard-guru/sections/JadwalGuruSection";

export const metadata: Metadata = {
  title: "Jadwal Guru",
};

export default function DashboardGuruJadwalPage() {
  return <JadwalGuruSection />;
}
