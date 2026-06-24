import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, suppressHydrationWarning, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-slate-400 hover:border-orange-200 hover:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 focus-visible:border-orange-300 focus-visible:ring-4 focus-visible:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      // Browser extensions can inject attributes into form fields before React hydrates.
      suppressHydrationWarning={suppressHydrationWarning ?? true}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
