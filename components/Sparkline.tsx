"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";

type Props = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

export function Sparkline({
  values,
  width = 96,
  height = 32,
  className = "",
}: Props) {
  if (values.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-[10px] leading-tight text-muted ${className}`}
        style={{ width, height }}
        title="Belum ada data tren"
      >
        {values.length === 1 ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-amber"
              aria-hidden
            />
            Belum ada data tren
          </span>
        ) : (
          "—"
        )}
      </div>
    );
  }

  const data = values.map((likes, index) => ({ index, likes }));
  const rising = values[values.length - 1] >= values[0];
  const stroke = rising ? "var(--accent-amber)" : "var(--danger)";

  return (
    <div className={className} style={{ width, height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Line
            type="monotone"
            dataKey="likes"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
