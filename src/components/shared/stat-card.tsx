import { Info, LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "info";
  tooltip?: string;
};

const toneStyles = {
  default: "from-slate-100 to-white text-slate-700",
  success: "from-emerald-100 to-white text-emerald-700",
  warning: "from-amber-100 to-white text-amber-700",
  info: "from-orange-100 to-white text-orange-700",
} as const;

export function StatCard({
  label,
  value,
  change,
  detail,
  icon: Icon,
  tone = "default",
  tooltip,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-80",
          toneStyles[tone],
        )}
      />

      <CardContent className="relative flex h-full flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>{label}</span>

              {tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="rounded-full p-0.5 text-slate-400 transition hover:text-slate-600">
                      <Info className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              ) : null}
            </div>

            <h3 className="text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </h3>
          </div>

          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
            <Icon className="size-5 text-slate-700" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge
            variant={
              tone === "success"
                ? "success"
                : tone === "warning"
                  ? "warning"
                  : tone === "info"
                    ? "warning"
                    : "secondary"
            }
          >
            {change}
          </Badge>

          <p className="text-sm leading-6 text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
