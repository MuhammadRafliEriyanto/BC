import type { ReactNode } from "react";

import { GuruTopbar } from "@/components/dashboard-guru/components";

export default function DashboardGuruLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-slate-100/80">
      <GuruTopbar />
      {children}
    </main>
  );
}
