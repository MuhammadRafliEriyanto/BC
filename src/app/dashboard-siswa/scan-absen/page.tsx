import ScanAbsenClient from "@/components/dashboard-siswa/pages/ScanAbsenClient";

export const metadata = {
  title: "Scan Absensi - Bimbel",
  description: "Scan QR Code untuk melakukan absensi kehadiran kelas.",
};

export default function ScanAbsenPage() {
  return <ScanAbsenClient />;
}
