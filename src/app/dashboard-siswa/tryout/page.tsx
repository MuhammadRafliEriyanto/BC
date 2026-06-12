import type { Metadata } from "next";

import TryoutSiswaPageView from "@/components/dashboard-siswa/pages/TryoutSiswaPageView";

export const metadata: Metadata = {
  title: "Tryout Siswa",
  description:
    "Halaman tryout siswa dengan timer, navigasi soal, dan ringkasan progres pengerjaan.",
};

export default function DashboardSiswaTryoutPage() {
  return <TryoutSiswaPageView />;
}
