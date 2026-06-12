"use client";

import { useOwnerExpenses } from "@/components/dashboard-owner/hooks/useOwnerExpenses";
import { OwnerDashboardExpensesSection } from "@/components/dashboard-owner/sections";

export function OwnerDashboardExpensesView() {
  const { expensesManager } = useOwnerExpenses();

  return <OwnerDashboardExpensesSection manager={expensesManager} />;
}
