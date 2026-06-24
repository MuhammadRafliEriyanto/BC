import type { ReactNode } from "react";

import SiswaTopbar from "@/components/dashboard-siswa/siswa-topbar";

export default function DashboardSiswaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-slate-100/80">
      <SiswaTopbar />
      {children}
    </main>
  );
}
