import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-slate-950 text-white shadow-sm shadow-slate-950/10 hover:-translate-y-px hover:bg-slate-800 hover:shadow-md hover:shadow-slate-950/10 active:translate-y-0 active:bg-slate-900 active:shadow-sm focus-visible:ring-orange-500/15",
  secondary:
    "bg-orange-600 text-white shadow-sm shadow-orange-500/20 hover:-translate-y-px hover:bg-orange-700 hover:shadow-md hover:shadow-orange-500/25 active:translate-y-0 active:bg-orange-800 active:shadow-sm focus-visible:ring-orange-500/20",
  subtle:
    "border border-orange-100/80 bg-orange-50/95 text-orange-700 shadow-sm shadow-orange-100/40 hover:-translate-y-px hover:bg-orange-100 hover:shadow-md hover:shadow-orange-100/45 active:translate-y-0 active:bg-orange-200/80 active:shadow-sm focus-visible:ring-orange-500/15",
  outline:
    "border border-slate-200/90 bg-white/95 text-slate-700 shadow-sm shadow-slate-950/5 hover:-translate-y-px hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md hover:shadow-orange-100/40 active:translate-y-0 active:border-orange-300 active:bg-orange-100/80 active:text-orange-800 active:shadow-sm focus-visible:border-orange-300 focus-visible:ring-orange-500/10",
  ghost:
    "bg-transparent text-slate-600 hover:bg-orange-50/90 hover:text-orange-700 active:bg-orange-100/80 active:text-orange-800 focus-visible:ring-orange-500/10",
  destructive:
    "bg-danger text-white shadow-sm shadow-red-500/20 hover:-translate-y-px hover:bg-red-700 hover:shadow-md hover:shadow-red-500/25 active:translate-y-0 active:bg-red-800 active:shadow-sm focus-visible:ring-danger/20",
} as const;

const buttonSizes = {
  sm: "h-9 px-4 text-sm",
  default: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "size-11",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 outline-none ring-offset-white focus:outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 active:outline-none disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
