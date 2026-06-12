import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { adminPoppins } from "./admin-font";

type AdminSectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  square?: boolean;
};

export function AdminSectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  square = false,
}: AdminSectionCardProps) {
  return (
    <Card
      className={cn(
        adminPoppins.className,
        square
          ? "overflow-hidden rounded-none border border-slate-200/80 bg-white/96 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.12)]"
          : "relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/96 shadow-[0_22px_38px_-30px_rgba(15,23,42,0.16)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-14 before:bg-gradient-to-b before:from-slate-50/80 before:to-transparent",
        className,
      )}
    >
      <CardHeader className="relative flex flex-col gap-4 border-b border-slate-100/90 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="shrink-0 sm:self-center">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("relative pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
