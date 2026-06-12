import type { LucideIcon } from "lucide-react";
import { Activity, Building2, LayoutGrid, UserCog, WalletCards } from "lucide-react";

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
    badge: "Home",
  },
   {
    id: "branch-admins",
    label: "Admin Cabang",
    description: "Kelola akun admin yang dipakai pada setiap cabang.",
    href: "/dashboard-owner/admin-cabang",
    icon: UserCog,
  },
  {
    id: "branches",
    label: "Cabang",
    description: "Kelola data dan status semua cabang.",
    href: "/dashboard-owner/cabang",
    icon: Building2,
  },
  {
    id: "activities",
    label: "Pembayaran",
    description: "Pantau pembayaran masuk, keluar, dan aktivasi membership.",
    href: "/dashboard-owner/aktivitas",
    icon: Activity,
  },
  {
    id: "expenses",
    label: "Pengeluaran",
    description: "Kelola expense operasional yang tercatat ke backend.",
    href: "/dashboard-owner/pengeluaran",
    icon: WalletCards,
  },
];
