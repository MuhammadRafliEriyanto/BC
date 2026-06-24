import { Fragment, type ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { adminPoppins } from "./admin-font";

export type AdminColumnDefinition<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T, index: number) => ReactNode;
};

type AdminDataTableProps<T> = {
  columns: AdminColumnDefinition<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  minWidthClassName?: string;
  getRowClassName?: (row: T, index: number, data: T[]) => string | undefined;
  renderBeforeRow?: (row: T, index: number, data: T[]) => ReactNode;
  square?: boolean;
  isLoading?: boolean;
};

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = "Belum ada data untuk ditampilkan",
  emptyDescription = "Coba ubah filter atau tambahkan data baru untuk melanjutkan.",
  minWidthClassName = "min-w-[920px]",
  getRowClassName,
  renderBeforeRow,
  square = false,
  isLoading = false,
}: AdminDataTableProps<T>) {
  if (isLoading) {
    return (
      <div
        className={cn(
          adminPoppins.className,
          "overflow-hidden border border-slate-200/80 bg-white shadow-[0_18px_34px_-28px_rgba(15,23,42,0.14)]",
          square ? "rounded-none" : "rounded-[22px]",
        )}
      >
        <Table className={minWidthClassName}>
          <TableHeader className="bg-gradient-to-r from-slate-50/95 via-white to-slate-50/70">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    <Skeleton className="h-4 w-full max-w-[80%]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className={cn(
          adminPoppins.className,
          "border border-dashed border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-6 py-12 text-center shadow-[0_18px_34px_-30px_rgba(15,23,42,0.12)]",
          square ? "rounded-none" : "rounded-[22px]",
        )}
      >
        <h3 className="text-base font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        adminPoppins.className,
        "overflow-hidden border border-slate-200/80 bg-white shadow-[0_18px_34px_-28px_rgba(15,23,42,0.14)]",
        square ? "rounded-none" : "rounded-[22px]",
      )}
    >
      <Table className={minWidthClassName}>
        <TableHeader className="bg-gradient-to-r from-slate-50/95 via-white to-slate-50/70">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <Fragment key={keyExtractor(row)}>
              {renderBeforeRow?.(row, index, data)}
              <TableRow
                className={cn(
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/30",
                  "border-slate-100",
                  getRowClassName?.(row, index, data),
                )}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
