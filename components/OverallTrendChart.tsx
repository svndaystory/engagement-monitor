"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";

type Point = {
  date: string;
  engagement: number;
};

type Props = {
  data: Point[];
};

function formatDay(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <p className="mb-1.5 text-muted">{formatDay(String(label))}</p>
      <p className="flex items-center justify-between gap-4 text-text">
        <span className="text-muted">Engagement</span>
        <span className="font-mono">{formatNumber(payload[0]?.value ?? 0)}</span>
      </p>
    </div>
  );
}

export function OverallTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-muted">
        Belum ada snapshot untuk tren.
      </p>
    );
  }

  return (
    <div className="h-72 w-full rounded-lg border border-border bg-surface p-3 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            minTickGap={28}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 11,
              fontFamily: "var(--font-ibm-plex-mono)",
            }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 11,
              fontFamily: "var(--font-ibm-plex-mono)",
            }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={{ stroke: "var(--border)" }}
            width={56}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "var(--border)" }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            name="Engagement"
            stroke="var(--accent-amber)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--accent-amber)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
