import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type OwnerDashboardAccent =
  | "orange"
  | "emerald"
  | "amber"
  | "sky"
  | "slate";

export type OwnerDashboardStatCardProps = {
  title: string;
  value: string;
  note?: string;
  progress: number;
  trend: string;
  direction: "up" | "down";
  accent: OwnerDashboardAccent;
  icon: LucideIcon;
};

const accentStyles: Record<
  OwnerDashboardAccent,
  {
    bar: string;
    title: string;
    trend: string;
    iconBox: string;
    icon: string;
    progress: string;
    glow: string;
    orb: string;
  }
> = {
  orange: {
    bar: "before:bg-orange-500",
    title: "text-orange-600",
    trend: "text-orange-600",
    iconBox: "border-orange-100/80 bg-orange-50/90",
    icon: "text-orange-300",
    progress: "[&>div]:bg-orange-500",
    glow: "from-transparent via-orange-200 to-transparent",
    orb: "bg-orange-100/60",
  },
  emerald: {
    bar: "before:bg-emerald-500",
    title: "text-emerald-600",
    trend: "text-emerald-600",
    iconBox: "border-emerald-100/80 bg-emerald-50/90",
    icon: "text-emerald-300",
    progress: "[&>div]:bg-emerald-500",
    glow: "from-transparent via-emerald-200 to-transparent",
    orb: "bg-emerald-100/60",
  },
  amber: {
    bar: "before:bg-amber-500",
    title: "text-amber-600",
    trend: "text-amber-600",
    iconBox: "border-amber-100/80 bg-amber-50/90",
    icon: "text-amber-300",
    progress: "[&>div]:bg-amber-500",
    glow: "from-transparent via-amber-200 to-transparent",
    orb: "bg-amber-100/60",
  },
  sky: {
    bar: "before:bg-sky-500",
    title: "text-sky-600",
    trend: "text-sky-600",
    iconBox: "border-sky-100/80 bg-sky-50/90",
    icon: "text-sky-300",
    progress: "[&>div]:bg-sky-500",
    glow: "from-transparent via-sky-200 to-transparent",
    orb: "bg-sky-100/60",
  },
  slate: {
    bar: "before:bg-slate-500",
    title: "text-slate-600",
    trend: "text-slate-600",
    iconBox: "border-slate-200/80 bg-slate-50/90",
    icon: "text-slate-300",
    progress: "[&>div]:bg-slate-700",
    glow: "from-transparent via-slate-200 to-transparent",
    orb: "bg-slate-100/70",
  },
};

export function OwnerDashboardStatCard({
  title,
  value,
  note,
  progress,
  trend,
  direction,
  accent,
  icon: Icon,
}: OwnerDashboardStatCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_14px_30px_-22px_rgba(15,23,42,0.15)] transition-all duration-300 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:rounded-l-[20px] hover:-translate-y-1 hover:border-orange-200/70 hover:shadow-[0_22px_44px_-24px_rgba(249,115,22,0.22)]",
        styles.bar,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          styles.glow,
        )}
      />
      <div
        className={cn(
          "absolute -right-9 -top-8 size-28 rounded-full blur-3xl transition-transform duration-300 group-hover:scale-110",
          styles.orb,
        )}
      />

      <CardContent className="relative p-4 lg:p-[1.125rem]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.14em]",
                styles.title,
              )}
            >
              {title}
            </p>

            <div className="flex flex-wrap items-end gap-2">
              <h3 className="text-[1.55rem] font-semibold leading-none tracking-[-0.03em] text-slate-950">
                {value}
              </h3>

              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold",
                  styles.trend,
                )}
              >
                {direction === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {trend}
              </span>
            </div>
          </div>

          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[16px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105",
              styles.iconBox,
            )}
          >
            <Icon className={cn("size-5.5", styles.icon)} />
          </div>
        </div>

        {note ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-500">
            {note}
          </p>
        ) : null}

        <Progress
          value={progress}
          className={cn(
            note ? "mt-3 h-1.5 bg-slate-100/90" : "mt-4 h-1.5 bg-slate-100/90",
            styles.progress,
          )}
        />

        <div className="mt-1.5 flex justify-end">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {progress}% progress
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
