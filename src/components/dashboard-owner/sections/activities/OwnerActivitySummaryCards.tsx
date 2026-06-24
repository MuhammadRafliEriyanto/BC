"use client";

import type { LucideIcon } from "lucide-react";
import { Clock3, CreditCard, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type {
  ActivitySectionMetric,
  OwnerActivityActivationOverview,
  OwnerActivityFinancialSummary,
  SurfaceTone,
} from "./owner-activity-types";
import { formatCurrency, surfaceToneStyles } from "./owner-activity-utils";

type OwnerActivitySummaryCardsProps = {
  activationOverview: OwnerActivityActivationOverview;
  financialSummary: OwnerActivityFinancialSummary;
};

type OwnerActivitySectionPanelProps = {
  tone: SurfaceTone;
  badgeLabel: string;
  title: string;
  description: string;
  metrics?: ActivitySectionMetric[];
  actions: ReactNode;
  filters: ReactNode;
  note: string;
  children: ReactNode;
};

type SummaryCardProps = {
  tone: SurfaceTone;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

type SectionMetricPillProps = ActivitySectionMetric;

function SectionMetricPill({ tone, label, value, hint }: SectionMetricPillProps) {
  const styles = surfaceToneStyles[tone];

  return (
    <div className={cn("rounded-2xl border px-4 py-4", styles.metric)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}

function SummaryCard({
  tone,
  label,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  const styles = surfaceToneStyles[tone];

  return (
    <div
      className={cn(
        "rounded-[24px] border bg-white p-5 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.12)]",
        styles.shell,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              styles.accentText,
            )}
          >
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
            styles.iconWrap,
          )}
        >
          <Icon className={cn("size-5", styles.icon)} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function OwnerActivitySectionPanel({
  tone,
  badgeLabel,
  title,
  description,
  metrics,
  actions,
  filters,
  note,
  children,
}: OwnerActivitySectionPanelProps) {
  const styles = surfaceToneStyles[tone];

  return (
    <section
      className={cn(
        "rounded-[30px] border px-6 py-6 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.14)]",
        styles.shell,
      )}
    >
      <div className="space-y-5">
        <div className="space-y-4">
          <div>
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]",
                styles.badge,
              )}
            >
              {badgeLabel}
            </Badge>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          {metrics && metrics.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {metrics.map((metric) => (
                <SectionMetricPill
                  key={`${metric.label}-${metric.value}`}
                  {...metric}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className={cn("rounded-[24px] border p-4", styles.toolbar)}>
          <div className="space-y-4">
            {actions}
            {filters}
            <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
              <span className={cn("mt-0.5 size-2 rounded-full", styles.dot)} />
              <p>{note}</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-[24px] border shadow-[0_14px_28px_-24px_rgba(15,23,42,0.1)]",
            styles.table,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function OwnerActivitySummaryCards({
  activationOverview,
  financialSummary,
}: OwnerActivitySummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        tone="orange"
        label="Pembayaran masuk"
        value={formatCurrency(financialSummary.incomingValidated)}
        description="Total pembayaran siswa yang sudah tervalidasi."
        icon={CreditCard}
      />
      <SummaryCard
        tone="sky"
        label="Belum lunas"
        value={formatCurrency(financialSummary.incomingPending)}
        description="Nominal pembayaran siswa yang masih pending, gagal, atau expired."
        icon={Clock3}
      />
      <SummaryCard
        tone="emerald"
        label="Aktivasi siswa"
        value={`${activationOverview.activeCount} siswa`}
        description="Siswa dengan membership aktif saat ini."
        icon={ShieldCheck}
      />
    </div>
  );
}
