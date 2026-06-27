"use client";

import { useState } from "react";

import { Poppins } from "next/font/google";
import { OwnerDashboardSidebar } from "@/components/dashboard-owner/components/OwnerDashboardSidebar";
import { OwnerDashboardTopbar } from "@/components/dashboard-owner/components/OwnerDashboardTopbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ownerPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

type OwnerDashboardShellProps = {
  children: React.ReactNode;
};

export function OwnerDashboardShell({ children }: OwnerDashboardShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  return (
    <section className={cn("min-h-screen bg-[linear-gradient(180deg,#fffaf3_0%,#fff7ed_30%,#f8fafc_100%)] dark:bg-slate-950", ownerPoppins.className)}>
      <div className="flex min-h-screen bg-transparent">
        <OwnerDashboardSidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((current) => !current)}
        />

        <Sheet
          open={isMobileNavigationOpen}
          onOpenChange={setIsMobileNavigationOpen}
        >
          <SheetContent
            side="left"
            className="w-[288px] border-0 bg-orange-600 p-0 sm:max-w-[288px]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigasi Owner</SheetTitle>
              <SheetDescription>Menu utama dashboard Owner LMS.</SheetDescription>
            </SheetHeader>
            <OwnerDashboardSidebar
              mobile
              onNavigate={() => setIsMobileNavigationOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="relative min-w-0 flex-1 overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-orange-200/35 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(248,250,252,0.78))]" />
          </div>
          <div className="relative flex min-h-screen flex-col">
            <OwnerDashboardTopbar
              onOpenNavigation={() => setIsMobileNavigationOpen(true)}
            />
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
