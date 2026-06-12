import { Button } from "@/components/ui/button";

type AdminPaginationFooterProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  visibleCount: number;
  limit: number;
  isLoading?: boolean;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function AdminPaginationFooter({
  page,
  totalPages,
  totalItems,
  visibleCount,
  limit,
  isLoading = false,
  label,
  onPrevious,
  onNext,
}: AdminPaginationFooterProps) {
  const pageStart = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const pageEnd = pageStart > 0 ? pageStart + visibleCount - 1 : 0;

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_12px_22px_-26px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-medium text-slate-800">
          Halaman {page} dari {totalPages}
        </p>
        <p className="text-xs text-slate-500">
          Menampilkan {visibleCount} {label} pada halaman ini.
          {totalItems > 0 && pageEnd > 0
            ? ` Rentang data ${pageStart}-${pageEnd} dari total ${totalItems} ${label}.`
            : ` Belum ada ${label} yang cocok dengan filter aktif.`}
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isLoading || page <= 1}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={isLoading || page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
