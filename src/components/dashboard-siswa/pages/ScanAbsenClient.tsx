"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ScanLine } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

export default function ScanAbsenClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");

  const [isSuccess, setIsSuccess] = useState(false);
  const [error] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only initialize if not already success
    if (isSuccess) return;

    // Create the scanner instance if not exists
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false, // non-verbose
      );

      const onScanSuccess = (decodedText: string) => {
        // Stop scanning after success
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        setIsSuccess(true);
        console.log("Scanned:", decodedText);

        // Mock API call delay, then redirect back
        setTimeout(() => {
          router.push("/dashboard-siswa#jadwal-mata-pelajaran");
        }, 2500);
      };

      const onScanFailure = () => {
        // Ignore normal scan failures (happens every frame)
      };

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isSuccess, router]);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <header className="flex flex-col gap-5 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Scan Barcode Kehadiran
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Arahkan kamera ke QR Code absen yang ada di ruang kelas untuk mencatat kehadiran.
          </p>
          {scheduleId && (
            <p className="mt-1 text-xs font-semibold text-orange-600">
              Sesi Referensi: {scheduleId}
            </p>
          )}
        </div>
      </header>

      <div className="relative mx-auto w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-800">
              Absen Berhasil!
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kehadiran Anda telah dicatat oleh sistem.
            </p>
            <p className="mt-4 text-[11px] font-medium text-slate-400">
              Mengalihkan kembali ke jadwal...
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {error && (
              <div className="bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600">
                {error}
              </div>
            )}
            
            {/* Scanner Container */}
            <div id="qr-reader" className="w-full border-none [&_#qr-reader__dashboard_section_csr_span]:text-slate-700 [&_button]:rounded-full [&_button]:bg-orange-500 [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white [&_button]:transition-colors hover:[&_button]:bg-orange-600" />
            
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 p-4 text-xs font-medium text-slate-500">
              <ScanLine className="h-4 w-4" />
              Pastikan QR Code berada di dalam kotak
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
