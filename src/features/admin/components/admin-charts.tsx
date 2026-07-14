'use client';

import { motion } from 'framer-motion';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  formatValue?: (v: number) => string;
}

export function AdminBarChart({ data, height = 200, formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((point, i) => {
        const pct = (point.value / max) * 100;
        return (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-brand/60 to-brand"
              title={formatValue ? formatValue(point.value) : String(point.value)}
            />
            <span className="text-[10px] text-muted-foreground">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminLineChart({ data, height = 180 }: { data: ChartDataPoint[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / max) * (height - 20);
    return `${x},${y}`;
  });

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E30613" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E30613" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#lineGrad)" points={`0,${height} ${points.join(' ')} ${width},${height}`} />
        <polyline fill="none" stroke="#E30613" strokeWidth="1.5" points={points.join(' ')} />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - (d.value / max) * (height - 20);
          return <circle key={d.label} cx={x} cy={y} r="2" fill="#E30613" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d) => (
          <span key={d.label} className="text-[10px] text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AdminDonutChart({
  data,
  size = 160,
}: {
  data: ChartDataPoint[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = ['#E30613', '#FF4D5A', '#B8050F', '#FF8A92', '#8A040D'];
  let cumulative = 0;

  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, start, pct, color: colors[i % colors.length] };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={`${seg.pct * 100} ${100 - seg.pct * 100}`}
              strokeDashoffset={-seg.start * 100}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg text-foreground">{total}%</span>
          <span className="text-[9px] text-muted-foreground">share</span>
        </div>
      </div>
      <ul className="space-y-2">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-foreground">{seg.label}</span>
            <span className="text-muted-foreground">{seg.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
