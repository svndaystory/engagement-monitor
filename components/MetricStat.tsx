import { computeTrend, formatNumber, type TrendDirection } from "@/lib/format";

type Props = {
  label: string;
  value: number;
  previous?: number | null;
  accent?: "amber" | "teal" | "text";
};

function TrendBadge({
  direction,
  delta,
  percent,
}: {
  direction: TrendDirection;
  delta: number;
  percent: number | null;
}) {
  if (direction === "flat") {
    return <span className="text-xs text-muted">Stabil</span>;
  }

  const positive = direction === "up";
  const color = positive ? "text-amber" : "text-danger";
  const arrow = positive ? "▲" : "▼";
  const pct =
    percent == null
      ? ""
      : ` (${positive ? "+" : ""}${percent.toFixed(1)}%)`;

  return (
    <span className={`font-mono text-xs ${color}`}>
      {arrow} {positive ? "+" : ""}
      {formatNumber(delta)}
      {pct}
    </span>
  );
}

export function MetricStat({
  label,
  value,
  previous = null,
  accent = "text",
}: Props) {
  const trend = computeTrend(value, previous);
  const valueColor =
    accent === "amber"
      ? "text-amber"
      : accent === "teal"
        ? "text-teal"
        : "text-text";

  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-medium tracking-tight sm:text-3xl ${valueColor}`}>
        {formatNumber(value)}
      </p>
      <div className="mt-2 min-h-[1rem]">
        {previous != null ? (
          <TrendBadge
            direction={trend.direction}
            delta={trend.delta}
            percent={trend.percent}
          />
        ) : null}
      </div>
    </div>
  );
}
