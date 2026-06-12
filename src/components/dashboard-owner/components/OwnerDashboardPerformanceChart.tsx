import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OwnerDashboardPerformanceDatum = {
  label: string;
  primary: number;
  secondary: number;
};

type OwnerDashboardPerformanceChartProps = {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  data: OwnerDashboardPerformanceDatum[];
  valueFormatter?: (value: number) => string;
  headerControl?: ReactNode;
  emptyStateMessage?: string | null;
};

function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  maxValue: number,
) {
  return values.map((value, index) => {
    const x = dataPointPosition(index, values.length, width);
    const y = height - (value / maxValue) * height;

    return { x, y };
  });
}

function dataPointPosition(index: number, total: number, width: number) {
  if (total <= 1) {
    return width / 2;
  }

  return (index / (total - 1)) * width;
}

function toSmoothLinePath(points: Array<{ x: number; y: number }>) {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpointX = (current.x + next.x) / 2;
    const midpointY = (current.y + next.y) / 2;

    path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${midpointX.toFixed(2)} ${midpointY.toFixed(2)}`;
  }

  const lastPoint = points[points.length - 1];
  path += ` T ${lastPoint.x.toFixed(2)} ${lastPoint.y.toFixed(2)}`;

  return path;
}

function toSmoothAreaPath(points: Array<{ x: number; y: number }>, height: number) {
  if (!points.length) {
    return "";
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return [
    toSmoothLinePath(points),
    `L ${lastPoint.x.toFixed(2)} ${height.toFixed(2)}`,
    `L ${firstPoint.x.toFixed(2)} ${height.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function roundChartMax(value: number) {
  if (value <= 5) {
    return 5;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function OwnerDashboardPerformanceChart({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  data,
  valueFormatter,
  headerControl,
  emptyStateMessage,
}: OwnerDashboardPerformanceChartProps) {
  const width = 760;
  const height = 250;
  const primaryValues = data.map((item) => item.primary);
  const secondaryValues = data.map((item) => item.secondary);
  const normalizedMax = roundChartMax(
    Math.max(...primaryValues, ...secondaryValues, 1),
  );
  const yAxisValues = Array.from({ length: 5 }, (_, index) => {
    const ratio = 1 - index / 4;
    return Math.round(normalizedMax * ratio);
  });
  const formatValue =
    valueFormatter ??
    ((value: number) =>
      new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0,
      }).format(value));

  const primaryPoints = buildLinePoints(primaryValues, width, height, normalizedMax);
  const secondaryPoints = buildLinePoints(
    secondaryValues,
    width,
    height,
    normalizedMax,
  );

  return (
    <Card className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_18px_38px_-28px_rgba(15,23,42,0.18)]">
      <CardHeader className="border-b border-slate-200/80 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-orange-600">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          </div>

          {headerControl ? (
            <div className="ml-auto flex w-full justify-end sm:w-auto">{headerControl}</div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)]">
          <div className="hidden h-[300px] flex-col justify-between pb-10 pt-2 text-xs font-medium text-slate-400 xl:flex">
            {yAxisValues.map((value) => (
              <span key={value}>{formatValue(value)}</span>
            ))}
          </div>

          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-[18px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf5_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-100/60 blur-3xl" />

              {yAxisValues.map((value, index) => (
                <div
                  key={value}
                  className={cn(
                    "absolute inset-x-4 border-t border-dashed border-slate-200/80",
                    index === yAxisValues.length - 1 ? "bottom-14" : "",
                  )}
                  style={{
                    top:
                      index === yAxisValues.length - 1
                        ? undefined
                        : `${20 + (index / (yAxisValues.length - 1)) * 220}px`,
                  }}
                />
              ))}

              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="relative z-10 h-[250px] w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="ownerPrimaryArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.03" />
                  </linearGradient>
                  <linearGradient
                    id="ownerSecondaryArea"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#fdba74" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#fdba74" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <path
                  d={toSmoothAreaPath(secondaryPoints, height)}
                  fill="url(#ownerSecondaryArea)"
                />
                <path
                  d={toSmoothLinePath(secondaryPoints)}
                  fill="none"
                  stroke="#fdba74"
                  strokeDasharray="7 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />

                <path
                  d={toSmoothAreaPath(primaryPoints, height)}
                  fill="url(#ownerPrimaryArea)"
                />
                <path
                  d={toSmoothLinePath(primaryPoints)}
                  fill="none"
                  stroke="#f97316"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />

                {primaryPoints.map((point, index) => (
                  <g key={`${data[index]?.label}-${point.x}`}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      fill="#ffffff"
                      r="6"
                      stroke="#fed7aa"
                      strokeWidth="2"
                    />
                    <circle cx={point.x} cy={point.y} fill="#f97316" r="3.4" />
                  </g>
                ))}
              </svg>

              {emptyStateMessage ? (
                <div className="absolute inset-x-6 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-slate-200/80 bg-white/92 px-4 py-3 text-center text-sm text-slate-500 shadow-sm backdrop-blur-sm">
                  {emptyStateMessage}
                </div>
              ) : null}

              <div className="relative z-10 mt-4 flex justify-between gap-2 text-xs font-semibold text-slate-400">
                {data.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-orange-500" />
                {primaryLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-orange-300" />
                {secondaryLabel}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
