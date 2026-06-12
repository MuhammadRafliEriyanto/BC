import { OwnerDashboardBranchesView } from "@/components/dashboard-owner/owner-dashboard-branches-view";
import {
  resolveOwnerBranchesRouteState,
  type SearchParamRecord,
} from "@/lib/owner-dashboard-routing";

type DashboardOwnerCabangPageProps = {
  searchParams?: Promise<SearchParamRecord>;
};

export default async function DashboardOwnerCabangPage({
  searchParams,
}: DashboardOwnerCabangPageProps) {
  const initialRouteState = resolveOwnerBranchesRouteState(
    searchParams ? await searchParams : {},
  );

  return <OwnerDashboardBranchesView initialRouteState={initialRouteState} />;
}
