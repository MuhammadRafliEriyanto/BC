import type { ReactNode } from "react";

import SiswaTopbar from "@/components/dashboard-siswa/siswa-topbar";

export default function DashboardSiswaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_18%),linear-gradient(180deg,#fffdf9_0%,#ffffff_52%,#fff7ed_100%)]">
      <SiswaTopbar />
      {children}
    </main>
  );
}
