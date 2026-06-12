type MiniBarChartProps = {
  data: { label: string; value: number }[];
};

export function MiniBarChart({ data }: MiniBarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">{item.label}</span>
            <span className="font-semibold text-slate-950">{item.value}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
