import type { Metadata } from "next";

import { GuruTopbar } from "@/components/dashboard-guru/components";
import JadwalGuruSection from "@/components/dashboard-guru/sections/JadwalGuruSection";

export const metadata: Metadata = {
  title: "Jadwal Guru",
};

export default function DashboardGuruJadwalPage() {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_18%),linear-gradient(180deg,#fffdf9_0%,#ffffff_52%,#fff7ed_100%)]">
      <GuruTopbar />
      <JadwalGuruSection />
    </main>
  );
}
