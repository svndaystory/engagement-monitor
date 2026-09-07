import { computeTrend, type TrendDirection } from "@/lib/format";

type Props = {
  current: number;
  previous?: number | null;
  className?: string;
};

/**
 * Compact % change vs previous snapshot.
 * Hidden when there is no previous baseline.
 * Amber = up, muted red = down.
 */
export function TrendIndicator({ current, previous = null, className = "" }: Props) {
  if (previous == null) return null;

  const trend = computeTrend(current, previous);
  if (trend.direction === "flat") {
    return (
      <span className={`font-mono text-[10px] text-muted ${className}`}>
        0%
      </span>
    );
  }

  return (
    <TrendMark
      direction={trend.direction}
      percent={trend.percent}
      className={className}
    />
  );
}

function TrendMark({
  direction,
  percent,
  className = "",
}: {
  direction: Exclude<TrendDirection, "flat">;
  percent: number | null;
  className?: string;
}) {
  const up = direction === "up";
  const color = up ? "text-amber" : "text-danger";
  const arrow = up ? "▲" : "▼";
  const label =
    percent == null
      ? up
        ? "naik"
        : "turun"
      : `${up ? "+" : ""}${percent.toFixed(1)}%`;

  return (
    <span className={`font-mono text-[10px] ${color} ${className}`}>
      {arrow} {label}
    </span>
  );
}
