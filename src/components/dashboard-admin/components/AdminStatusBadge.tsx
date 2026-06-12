import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { adminPoppins } from "./admin-font";

type AdminStatusTone = "default" | "info" | "success" | "warning" | "danger";

type AdminStatusBadgeProps = {
  status: string;
  tone?: AdminStatusTone;
  className?: string;
};

const toneStyles: Record<AdminStatusTone, string> = {
  default: "bg-slate-100 text-slate-700",
  info: "bg-orange-50 text-orange-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

function inferTone(status: string): AdminStatusTone {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("rejected") ||
    normalized.includes("nonaktif") ||
    normalized.includes("hapus") ||
    normalized.includes("bentrok")
  ) {
    return "danger";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("padat") ||
    normalized.includes("menunggu") ||
    normalized.includes("persiapan") ||
    normalized.includes("review")
  ) {
    return "warning";
  }

  if (
    normalized.includes("verified") ||
    normalized.includes("aktif") ||
    normalized.includes("lunas") ||
    normalized.includes("normal") ||
    normalized.includes("tersedia")
  ) {
    return "success";
  }

  if (
    normalized.includes("dipakai") ||
    normalized.includes("berjalan") ||
    normalized.includes("siap")
  ) {
    return "info";
  }

  if (normalized.includes("cuti") || normalized.includes("ditolak")) {
    return "danger";
  }

  return "default";
}

export function AdminStatusBadge({
  status,
  tone,
  className,
}: AdminStatusBadgeProps) {
  const resolvedTone = tone ?? inferTone(status);

  return (
    <Badge
      variant="secondary"
      className={cn(adminPoppins.className, toneStyles[resolvedTone], className)}
    >
      {status}
    </Badge>
  );
}
