"use client";

import { useOwnerBranchAdmins } from "@/components/dashboard-owner/hooks/useOwnerBranchAdmins";
import { OwnerDashboardBranchAdminsSection } from "@/components/dashboard-owner/sections";

export function OwnerDashboardBranchAdminsView() {
  const { branchAdminManager } = useOwnerBranchAdmins();

  return <OwnerDashboardBranchAdminsSection manager={branchAdminManager} />;
}
