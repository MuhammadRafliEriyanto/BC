import { Metadata } from "next";

import AbsensiSiswaPageView from "@/components/dashboard-siswa/pages/AbsensiSiswaPageView";

export const metadata: Metadata = {
  title: "Riwayat Absensi | Dashboard Siswa",
  description: "Pantau riwayat kehadiran Anda di setiap sesi kelas.",
};

export default function AbsensiSiswaPage() {
  return <AbsensiSiswaPageView />;
}
