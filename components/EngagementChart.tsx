"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";

export type SnapshotPoint = {
  id: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  captured_at: string;
};

type Props = {
  snapshots: SnapshotPoint[];
};

function formatTick(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <p className="mb-1.5 text-muted">{formatTick(String(label))}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-text">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: entry.color }}
              aria-hidden
            />
            <span className="text-muted">{entry.name}</span>
            <span className="ml-auto font-mono">
              {formatNumber(entry.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EngagementChart({ snapshots }: Props) {
  if (snapshots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-muted">
        Belum ada snapshot.
      </p>
    );
  }

  const data = snapshots.map((snapshot) => ({
    ...snapshot,
    label: snapshot.captured_at,
  }));

  return (
    <div className="h-80 w-full rounded-lg border border-border bg-surface p-3 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickFormatter={formatTick}
            minTickGap={28}
            tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-ibm-plex-mono)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-ibm-plex-mono)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={{ stroke: "var(--border)" }}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)" }} />
          <Legend
            wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="likes"
            name="Likes"
            stroke="var(--accent-amber)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--accent-amber)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="comments"
            name="Comments"
            stroke="var(--accent-teal)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--accent-teal)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
