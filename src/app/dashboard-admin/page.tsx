import type { Metadata } from "next";

import { AdminDashboard } from "@/components/dashboard-admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export default function DashboardAdminPage() {
  return <AdminDashboard />;
}
