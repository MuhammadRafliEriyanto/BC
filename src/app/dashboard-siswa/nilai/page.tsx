import { Metadata } from "next";

import NilaiSiswaPageView from "@/components/dashboard-siswa/pages/NilaiSiswaPageView";

export const metadata: Metadata = {
  title: "Rekapitulasi Nilai | Dashboard Siswa",
  description: "Lihat hasil nilai tugas dan ujian Anda.",
};

export default function NilaiSiswaPage() {
  return <NilaiSiswaPageView />;
}
