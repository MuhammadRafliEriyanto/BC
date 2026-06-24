import { OwnerDashboardActivitiesSection } from "@/components/dashboard-owner/sections";
import {
  resolveOwnerActivitiesRouteState,
  type SearchParamRecord,
} from "@/lib/owner-dashboard-routing";

type DashboardOwnerAktivitasPageProps = {
  searchParams?: Promise<SearchParamRecord>;
};

export default async function DashboardOwnerAktivitasPage({
  searchParams,
}: DashboardOwnerAktivitasPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialRouteState = resolveOwnerActivitiesRouteState(resolvedSearchParams);

  return <OwnerDashboardActivitiesSection initialRouteState={initialRouteState} />;
}
