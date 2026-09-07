"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";
import { platformChartColor } from "@/lib/reports-shared";

type Point = {
  platform: string;
  label: string;
  engagement: number;
  contentCount: number;
};

type Props = {
  data: Point[];
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: Point;
    value?: number;
  }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <p className="mb-1.5 text-text">{point.label}</p>
      <p className="flex items-center justify-between gap-4 text-muted">
        <span>Engagement</span>
        <span className="font-mono text-text">
          {formatNumber(point.engagement)}
        </span>
      </p>
      <p className="mt-1 flex items-center justify-between gap-4 text-muted">
        <span>Konten</span>
        <span className="font-mono text-text">{point.contentCount}</span>
      </p>
    </div>
  );
}

export function PlatformBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-muted">
        Belum ada data platform.
      </p>
    );
  }

  return (
    <div className="h-72 w-full rounded-lg border border-border bg-surface p-3 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 11,
              fontFamily: "var(--font-public-sans)",
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
            cursor={{ fill: "color-mix(in srgb, var(--border) 55%, transparent)" }}
          />
          <Bar dataKey="engagement" name="Engagement" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.platform}
                fill={platformChartColor(entry.platform)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
