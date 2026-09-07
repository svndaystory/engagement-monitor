import {
  averageEngagementRate,
  dominantPlatform,
  formatNumber,
  formatRelative,
  platformLabel,
} from "@/lib/format";

type ContentLike = {
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  updatedAt: Date;
};

type Props = {
  items: ContentLike[];
};

export function SummaryStrip({ items }: Props) {
  const total = items.length;
  const avgRate = averageEngagementRate(items);
  const topPlatform = dominantPlatform(items.map((item) => item.platform));
  const lastSync =
    items.length > 0
      ? items.reduce(
          (latest, item) =>
            item.updatedAt > latest ? item.updatedAt : latest,
          items[0].updatedAt
        )
      : null;

  const cards = [
    {
      label: "Konten",
      value: formatNumber(total),
    },
    {
      label: "Engagement",
      value: avgRate == null ? "—" : `${avgRate.toFixed(1)}%`,
    },
    {
      label: "Platform",
      value: topPlatform ? platformLabel(topPlatform) : "—",
    },
    {
      label: "Sync",
      value: formatRelative(lastSync),
    },
  ];

  return (
    <section
      aria-label="Ringkasan"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div key={card.label} className="bg-surface px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-xs text-muted">{card.label}</p>
          <p className="mt-2 font-mono text-xl font-medium tracking-tight text-text sm:text-2xl">
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}
