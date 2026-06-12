import type { ReactNode } from "react";

import {
  OwnerDashboardShell,
  OwnerDashboardSidebar,
} from "@/components/dashboard-owner/components";
import { OwnerDashboardHeaderSection } from "@/components/dashboard-owner/sections";

export default function DashboardOwnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OwnerDashboardShell sidebar={<OwnerDashboardSidebar />}>
      <OwnerDashboardHeaderSection />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_18%),#f8fafc] px-5 pb-6 pt-4 lg:px-8 lg:pb-8 lg:pt-5">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </OwnerDashboardShell>
  );
}
