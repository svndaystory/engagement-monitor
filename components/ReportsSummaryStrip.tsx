import Link from "next/link";
import {
  formatCompact,
  formatNumber,
  platformLabel,
} from "@/lib/format";
import type { ReportsSummary } from "@/lib/reports-shared";

type Props = {
  summary: ReportsSummary["summary"];
};

export function ReportsSummaryStrip({ summary }: Props) {
  const growth = summary.fastestGrowth;
  const growthValue =
    growth == null
      ? "—"
      : `${growth.growthPercent >= 0 ? "+" : ""}${growth.growthPercent.toFixed(1)}%`;

  const cards = [
    {
      label: "Total engagement",
      value: formatCompact(summary.totalEngagement),
      hint: formatNumber(summary.totalEngagement),
    },
    {
      label: "Rata-rata ER",
      value:
        summary.averageEngagementRate == null
          ? "—"
          : `${summary.averageEngagementRate.toFixed(1)}%`,
      hint: "likes+comments+shares / views",
    },
    {
      label: "Total views",
      value: formatCompact(summary.totalViews),
      hint: formatNumber(summary.totalViews),
    },
    {
      label: "Pertumbuhan tercepat",
      value: growthValue,
      hint: growth
        ? growth.title || platformLabel(growth.platform)
        : "Butuh ≥2 snapshots",
      href: growth ? `/content/${growth.id}` : null,
    },
  ];

  return (
    <section
      aria-label="Ringkasan reports"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
    >
      {cards.map((card) => {
        const body = (
          <>
            <p className="text-xs text-muted">{card.label}</p>
            <p className="mt-2 font-mono text-xl font-medium tracking-tight text-text sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-1 truncate text-[11px] text-muted">{card.hint}</p>
          </>
        );

        if (card.href) {
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-surface px-4 py-3 transition-colors hover:bg-bg/60 sm:px-5 sm:py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber"
            >
              {body}
            </Link>
          );
        }

        return (
          <div key={card.label} className="bg-surface px-4 py-3 sm:px-5 sm:py-4">
            {body}
          </div>
        );
      })}
    </section>
  );
}
