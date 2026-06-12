"use client";

import { useOwnerDashboard } from "@/components/dashboard-owner/hooks";
import { OwnerDashboardBranchesSection } from "@/components/dashboard-owner/sections";
import type { OwnerBranchesRouteState } from "@/lib/owner-dashboard-routing";

type OwnerDashboardBranchesViewProps = {
  initialRouteState?: OwnerBranchesRouteState;
};

function OwnerDashboardBranchesViewContent({
  initialRouteState,
}: OwnerDashboardBranchesViewProps) {
  const { branchManager } = useOwnerDashboard({ initialRouteState });

  return <OwnerDashboardBranchesSection manager={branchManager} />;
}

export function OwnerDashboardBranchesView({
  initialRouteState,
}: OwnerDashboardBranchesViewProps) {
  return (
    <OwnerDashboardBranchesViewContent
      key={initialRouteState?.status ?? "all"}
      initialRouteState={initialRouteState}
    />
  );
}
