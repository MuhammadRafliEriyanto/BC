import type { LucideIcon } from "lucide-react";
import { Building2, LayoutGrid, UserCog, WalletCards } from "lucide-react";

export type OwnerDashboardNavigationItem = {
  id: string;
  label: string;
  description: string;
  href: `/dashboard-owner${string}`;
  icon: LucideIcon;
  badge?: string;
};

export const ownerDashboardNavigationItems: OwnerDashboardNavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Ringkasan utama owner.",
    href: "/dashboard-owner",
    icon: LayoutGrid,
  },
  {
    id: "branches",
    label: "Cabang",
    description: "Kelola data dan status semua cabang.",
    href: "/dashboard-owner/cabang",
    icon: Building2,
  },
  {
    id: "branch-admins",
    label: "Admin Cabang",
    description: "Kelola akun admin yang dipakai pada setiap cabang.",
    href: "/dashboard-owner/admin-cabang",
    icon: UserCog,
  },
  {
    id: "activities",
    label: "Informasi Pembayaran",
    description: "Pantau pembayaran, pengeluaran, dan aktivasi membership.",
    href: "/dashboard-owner/aktivitas",
    icon: WalletCards,
  },
];
