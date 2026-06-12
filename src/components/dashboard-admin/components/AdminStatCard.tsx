import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { AdminTone } from "../admin-data";
import { adminPoppins } from "./admin-font";

type AdminStatCardProps = {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
  tone?: AdminTone;
  progress?: number;
};

const toneMap: Record<
  AdminTone,
  {
    shell: string;
    icon: string;
    badge: string;
    progress: string;
  }
> = {
  slate: {
    shell: "bg-white border-slate-200",
    icon: "bg-slate-100 text-slate-700",
    badge: "bg-slate-100 text-slate-700",
    progress: "[&>div]:bg-slate-700",
  },
  orange: {
    shell: "bg-white border-slate-200",
    icon: "bg-orange-50 text-orange-700",
    badge: "bg-orange-50 text-orange-700",
    progress: "[&>div]:bg-orange-500",
  },
  amber: {
    shell: "bg-white border-slate-200",
    icon: "bg-amber-50 text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    progress: "[&>div]:bg-amber-500",
  },
  emerald: {
    shell: "bg-white border-slate-200",
    icon: "bg-emerald-50 text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
    progress: "[&>div]:bg-emerald-500",
  },
  rose: {
    shell: "bg-white border-slate-200",
    icon: "bg-rose-50 text-rose-700",
    badge: "bg-rose-50 text-rose-700",
    progress: "[&>div]:bg-rose-600",
  },
};

export function AdminStatCard({
  label,
  value,
  change,
  detail,
  icon: Icon,
  tone = "orange",
  progress,
}: AdminStatCardProps) {
  const styles = toneMap[tone];
  const trend = change.trim().startsWith("+")
    ? "up"
    : change.trim().startsWith("-")
      ? "down"
      : "flat";

  return (
    <Card
      className={cn(
        adminPoppins.className,
        "overflow-hidden rounded-[24px] border shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16),0_12px_24px_-22px_rgba(249,115,22,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_26px_50px_-30px_rgba(249,115,22,0.26)]",
        styles.shell,
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          </div>

          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-2xl border border-white/80 shadow-sm shadow-slate-950/5",
              styles.icon,
            )}
          >
            <Icon className="size-4.5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={styles.badge}>
            {trend === "up" ? <ArrowUpRight className="size-3.5" /> : null}
            {trend === "down" ? <ArrowDownRight className="size-3.5" /> : null}
            {trend === "flat" ? <Minus className="size-3.5" /> : null}
            {change}
          </Badge>
        </div>

        <p className="text-sm text-slate-500">{detail}</p>

        {typeof progress === "number" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Target operasional</span>
              <span>{progress}%</span>
            </div>
            <Progress
              value={progress}
              className={cn("h-1.5 bg-slate-100", styles.progress)}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
