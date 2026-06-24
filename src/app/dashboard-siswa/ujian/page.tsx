import type { Metadata } from "next";

import TryoutSiswaPageView from "@/components/dashboard-siswa/pages/TryoutSiswaPageView";

export const metadata: Metadata = {
  title: "Ujian Siswa",
  description:
    "Daftar UTS, UAS, dan Tryout siswa yang tersedia sesuai kelas dan cabang.",
};

export default function DashboardSiswaExamPage() {
  return <TryoutSiswaPageView />;
}
