import { Inbox, LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel ? (
        <Button variant="outline" className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
