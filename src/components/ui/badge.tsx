import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-slate-950 text-white",

  secondary: "border border-slate-200/70 bg-slate-100/85 text-slate-700",

  outline: "border border-slate-200 bg-white text-slate-700 shadow-sm",

  success: "border border-emerald-100/80 bg-emerald-50 text-emerald-700",

  warning: "border border-amber-100/80 bg-amber-50 text-amber-700",

  danger: "border border-red-100/80 bg-red-50 text-red-700",

  info: "border border-orange-100/80 bg-orange-50 text-orange-700",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
