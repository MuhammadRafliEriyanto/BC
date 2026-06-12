import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-slate-950">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-slate-950" : ""}>{item.label}</span>
              )}
              {!isLast && <ChevronRight className="size-4 text-slate-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
