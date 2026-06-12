type SparklineChartProps = {
  data: number[];
  labels: string[];
};

export function SparklineChart({ data, labels }: SparklineChartProps) {
  const width = 640;
  const height = 220;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  const area = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-56 w-full overflow-visible"
          aria-label="Grafik perkembangan siswa"
        >
          <defs>
            <linearGradient id="sparklineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#sparklineFill)" />
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * (height - 24) - 12;

            return (
              <g key={`${labels[index]}-${value}`}>
                <circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
        {labels.map((label, index) => (
          <div key={label} className="space-y-1">
            <p>{label}</p>
            <p className="text-sm font-semibold text-slate-950">{data[index]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
