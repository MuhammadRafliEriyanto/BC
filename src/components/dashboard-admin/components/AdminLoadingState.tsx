import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AdminSummaryLineSkeletonProps = {
  badges?: number;
  className?: string;
};

export function AdminSummaryLineSkeleton({
  badges = 3,
  className,
}: AdminSummaryLineSkeletonProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label="Memuat ringkasan data"
      role="status"
    >
      <Skeleton className="h-4 w-44" />
      {Array.from({ length: badges }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-24 rounded-full" />
      ))}
      <span className="sr-only">Memuat ringkasan data...</span>
    </div>
  );
}

type AdminMetricGridSkeletonProps = {
  count?: number;
  compact?: boolean;
  className?: string;
};

export function AdminMetricGridSkeleton({
  count = 4,
  compact = false,
  className,
}: AdminMetricGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-[20px] border border-slate-200/80 bg-white shadow-[0_16px_28px_-28px_rgba(15,23,42,0.18)]",
            compact ? "px-3 py-2.5" : "px-4 py-4",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className={cn("w-32", compact ? "h-4" : "h-7")} />
            </div>
            {!compact ? <Skeleton className="size-10 rounded-2xl" /> : null}
          </div>
          {!compact ? <Skeleton className="mt-3 h-3 w-4/5" /> : null}
        </div>
      ))}
    </div>
  );
}

export function AdminChartSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-[320px] rounded-[20px] border border-slate-100 bg-white/70 p-5",
        className,
      )}
      aria-label="Memuat visualisasi data"
      role="status"
    >
      <div className="flex h-full items-end gap-3">
        {[42, 68, 50, 82, 60, 74, 56].map((height, index) => (
          <Skeleton
            key={index}
            className="flex-1 rounded-t-xl rounded-b-sm"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <span className="sr-only">Memuat visualisasi data...</span>
    </div>
  );
}

export function AdminDonutSkeleton() {
  return (
    <div
      className="flex h-[320px] flex-col items-center justify-center gap-7"
      aria-label="Memuat distribusi data"
      role="status"
    >
      <Skeleton className="size-[210px] rounded-full" />
      <div className="flex w-full gap-2">
        <Skeleton className="h-11 flex-1 rounded-2xl" />
        <Skeleton className="h-11 flex-1 rounded-2xl" />
      </div>
      <span className="sr-only">Memuat distribusi data...</span>
    </div>
  );
}

export function AdminListPanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="space-y-3 rounded-[24px] border border-slate-200/80 bg-white p-4"
      aria-label="Memuat daftar data"
      role="status"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-[18px] border border-slate-100 px-3 py-3"
        >
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Memuat daftar data...</span>
    </div>
  );
}
