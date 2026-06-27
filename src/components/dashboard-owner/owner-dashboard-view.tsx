"use client";

import { OwnerDashboardCanvasSection } from "@/components/dashboard-owner/sections";

export function OwnerDashboardView() {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6 overflow-x-hidden sm:overflow-visible pb-16 md:pb-0">
      <OwnerDashboardCanvasSection />
    </div>
  );
}
