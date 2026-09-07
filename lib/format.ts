export function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "Belum pernah";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Belum pernah";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  return `${days} hari lalu`;
}

export type TrendDirection = "up" | "down" | "flat";

export function computeTrend(
  current: number,
  previous: number | null | undefined
): { direction: TrendDirection; delta: number; percent: number | null } {
  if (previous == null) {
    return { direction: "flat", delta: 0, percent: null };
  }
  const delta = current - previous;
  if (delta === 0) return { direction: "flat", delta: 0, percent: 0 };
  const percent = previous === 0 ? null : (delta / previous) * 100;
  return {
    direction: delta > 0 ? "up" : "down",
    delta,
    percent,
  };
}

/** Engagement rate = (likes + comments + shares) / views * 100 */
export function engagementRate(input: {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}): number | null {
  if (!input.views || input.views <= 0) return null;
  return ((input.likes + input.comments + input.shares) / input.views) * 100;
}

export function averageEngagementRate(
  items: Array<{ likes: number; comments: number; shares: number; views: number }>
): number | null {
  const rates = items
    .map((item) => engagementRate(item))
    .filter((value): value is number => value != null);
  if (rates.length === 0) return null;
  return rates.reduce((sum, value) => sum + value, 0) / rates.length;
}

export function dominantPlatform(
  platforms: string[]
): string | null {
  if (platforms.length === 0) return null;
  const counts = new Map<string, number>();
  for (const platform of platforms) {
    counts.set(platform, (counts.get(platform) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  Array.from(counts.entries()).forEach(([platform, count]) => {
    if (count > bestCount) {
      best = platform;
      bestCount = count;
    }
  });
  return best;
}

export function platformLabel(platform: string): string {
  switch (platform) {
    case "TIKTOK":
      return "TikTok";
    case "INSTAGRAM":
      return "Instagram";
    case "YOUTUBE":
      return "YouTube";
    default:
      return platform;
  }
}

export function platformDotClass(platform: string): string {
  switch (platform) {
    case "TIKTOK":
      return "bg-platform-tiktok";
    case "INSTAGRAM":
      return "bg-platform-instagram";
    case "YOUTUBE":
      return "bg-platform-youtube";
    default:
      return "bg-muted";
  }
}
