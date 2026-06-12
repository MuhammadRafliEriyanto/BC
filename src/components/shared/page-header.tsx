import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  metrics?: { label: string; value: string }[];
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  metrics,
}: PageHeaderProps) {
  return (
    <section className="surface-panel p-6 lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge variant="info" className="w-fit">
            {eyebrow}
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
              {title}
            </h1>
            <p className="text-sm leading-7 text-slate-600 lg:text-base">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {metrics?.length ? (
        <div className="mt-6 grid gap-3 border-t border-white/80 pt-6 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-white/65 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {metric.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
