import { OwnerDashboardActivitiesSection } from "@/components/dashboard-owner/sections";
import { redirect } from "next/navigation";
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
  const rawTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0] ?? ""
    : resolvedSearchParams.tab ?? "";

  if (rawTab.trim().toLowerCase() === "keluar") {
    redirect("/dashboard-owner/pengeluaran");
  }

  const initialRouteState = resolveOwnerActivitiesRouteState(resolvedSearchParams);

  return <OwnerDashboardActivitiesSection initialRouteState={initialRouteState} />;
}
