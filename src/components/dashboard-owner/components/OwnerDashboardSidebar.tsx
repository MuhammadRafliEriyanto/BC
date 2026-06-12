"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";

import { ownerDashboardNavigationItems } from "@/components/dashboard-owner/navigation";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const OWNER_DASHBOARD_SIDEBAR_WIDTH_CLASS = "w-[248px]";

export function OwnerDashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        poppins.className,
        `sticky top-0 flex h-screen ${OWNER_DASHBOARD_SIDEBAR_WIDTH_CLASS} shrink-0 self-start flex-col overflow-y-auto border-r border-orange-300/30 bg-[linear-gradient(180deg,#fb923c_0%,#f97316_52%,#ea580c_100%)] px-4 py-0 text-white`,
      )}
    >
      <div className="flex h-full min-h-0 flex-col pb-6">
        <div className="flex h-[72px] items-center border-b border-white/14">
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em] text-white">
              Bimbel LMS
            </p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-orange-100/80">
              Owner Dashboard
            </p>
          </div>
        </div>

        <div className="pt-6">
          <p className="px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-orange-100/72">
            Menu
          </p>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-1">
          {ownerDashboardNavigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center rounded-[16px] px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/96 text-orange-600 shadow-[0_18px_32px_-24px_rgba(255,255,255,0.5)]"
                    : "text-orange-50/92 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 size-4 shrink-0 transition-colors duration-200",
                    isActive ? "text-orange-500" : "text-orange-100/85",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
