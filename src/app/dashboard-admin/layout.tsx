import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/dashboard-admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
