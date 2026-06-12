import type { ReactNode } from "react";

import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { OwnerDashboardAccent } from "./OwnerDashboardStatCard";

export type OwnerDashboardMetricListItem = {
  label: string;
  value: string;
  detail: string;
  progress?: number;
  badge?: string;
  accent: OwnerDashboardAccent;
};

export type OwnerDashboardMetricListDonutItem = {
  label: string;
  value: string;
  share: number;
  accent: OwnerDashboardAccent;
};

type OwnerDashboardMetricListProps = {
  title: string;
  description: string;
  items: OwnerDashboardMetricListItem[];
  donutItems?: OwnerDashboardMetricListDonutItem[];
  donutLabel?: string;
  donutValue?: string;
  footerNote?: string;
  headerControl?: ReactNode;
};

const accentStyles: Record<
  OwnerDashboardAccent,
  {
    dot: string;
    badge: string;
    progress: string;
    label: string;
    ring: string;
  }
> = {
  orange: {
    dot: "bg-orange-500",
    badge: "border-orange-100/80 bg-orange-50 text-orange-700",
    progress: "[&>div]:bg-orange-500",
    label: "text-orange-600",
    ring: "#f97316",
  },
  emerald: {
    dot: "bg-emerald-500",
    badge: "border-emerald-100/80 bg-emerald-50 text-emerald-700",
    progress: "[&>div]:bg-emerald-500",
    label: "text-emerald-600",
    ring: "#10b981",
  },
  amber: {
    dot: "bg-amber-500",
    badge: "border-amber-100/80 bg-amber-50 text-amber-700",
    progress: "[&>div]:bg-amber-500",
    label: "text-amber-600",
    ring: "#f59e0b",
  },
  sky: {
    dot: "bg-sky-500",
    badge: "border-sky-100/80 bg-sky-50 text-sky-700",
    progress: "[&>div]:bg-sky-500",
    label: "text-sky-600",
    ring: "#38bdf8",
  },
  slate: {
    dot: "bg-slate-500",
    badge: "border-slate-200/80 bg-slate-100 text-slate-700",
    progress: "[&>div]:bg-slate-700",
    label: "text-slate-600",
    ring: "#94a3b8",
  },
};

function buildDonutSegments(items: OwnerDashboardMetricListDonutItem[]) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  let consumedLength = 0;

  return items.map((item) => {
    const rawSegmentLength = (item.share / 100) * circumference;
    const segmentLength = Math.max(rawSegmentLength - 5, 0);
    const dashOffset = -consumedLength;

    consumedLength += rawSegmentLength;

    return {
      ...item,
      dashArray: `${segmentLength} ${circumference}`,
      dashOffset,
    };
  });
}

export function OwnerDashboardMetricList({
  title,
  description,
  items,
  donutItems,
  donutLabel = "Total",
  donutValue = "100%",
  footerNote,
  headerControl,
}: OwnerDashboardMetricListProps) {
  const donutSegments = donutItems ? buildDonutSegments(donutItems) : null;

  return (
    <Card className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_18px_38px_-28px_rgba(15,23,42,0.18)]">
      <CardHeader className="border-b border-slate-200/80 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl text-orange-600">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          </div>

          {headerControl ? (
            <div className="ml-auto flex w-full justify-end sm:w-auto">{headerControl}</div>
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-400 shadow-sm shadow-slate-950/5">
              <MoreVertical className="size-4" />
            </span>
          )}
        </div>
      </CardHeader>

      {donutSegments ? (
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative flex size-[220px] items-center justify-center">
              <div className="absolute inset-6 rounded-full bg-orange-100/40 blur-3xl" />

              <svg
                viewBox="0 0 200 200"
                className="relative z-10 size-full -rotate-90 overflow-visible"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="74"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                />

                {donutSegments.map((item) => {
                  const styles = accentStyles[item.accent];

                  return (
                    <circle
                      key={item.label}
                      cx="100"
                      cy="100"
                      r="74"
                      fill="none"
                      stroke={styles.ring}
                      strokeDasharray={item.dashArray}
                      strokeDashoffset={item.dashOffset}
                      strokeLinecap="round"
                      strokeWidth="18"
                    />
                  );
                })}
              </svg>

              <div className="absolute z-20 flex size-[122px] flex-col items-center justify-center rounded-full border border-slate-200/80 bg-white shadow-[0_16px_28px_-22px_rgba(15,23,42,0.24)]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {donutLabel}
                </span>
                <span className="mt-2 text-[1.8rem] font-semibold tracking-[-0.03em] text-slate-950">
                  {donutValue}
                </span>
              </div>
            </div>

            <div className="mt-6 grid w-full gap-3">
              {donutSegments.map((item) => {
                const styles = accentStyles[item.accent];

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[18px] border border-slate-200/80 bg-slate-50/70 px-4 py-3 transition-colors duration-200 hover:border-orange-200 hover:bg-orange-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("size-3 rounded-full", styles.dot)} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.share}% komposisi</p>
                      </div>
                    </div>

                    <p className={cn("text-sm font-semibold", styles.label)}>
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {footerNote ? (
              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                {footerNote}
              </p>
            ) : null}
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-2">
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const styles = accentStyles[item.accent];

              return (
                <div key={item.label} className="py-4 first:pt-2 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2.5 rounded-full", styles.dot)} />
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.detail}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                      {item.badge ? (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "mt-2 rounded-full px-2.5 py-1 text-[11px]",
                            styles.badge,
                          )}
                        >
                          {item.badge}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {typeof item.progress === "number" ? (
                    <Progress
                      value={item.progress}
                      className={cn("mt-4 h-2 bg-slate-100/90", styles.progress)}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
