import { prisma } from "@/lib/prisma";
import {
  averageEngagementRate,
  engagementRate,
  platformLabel,
} from "@/lib/format";
import type {
  ReportsExportRow,
  ReportsFastestGrowth,
  ReportsSummary,
  ReportsTopItem,
  ReportsTopSort,
} from "@/lib/reports-shared";

export type {
  ReportsExportRow,
  ReportsFastestGrowth,
  ReportsSummary,
  ReportsTopItem,
  ReportsTopSort,
} from "@/lib/reports-shared";

export { buildReportsCsv, platformChartColor } from "@/lib/reports-shared";

function totalEngagement(metrics: {
  likes: number;
  comments: number;
  shares: number;
}): number {
  return metrics.likes + metrics.comments + metrics.shares;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toTopItem(item: {
  id: string;
  title: string | null;
  platform: string;
  thumbnailUrl: string | null;
  author: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}): ReportsTopItem {
  return {
    id: item.id,
    title: item.title,
    platform: item.platform,
    thumbnailUrl: item.thumbnailUrl,
    author: item.author,
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    views: item.views,
    engagement: totalEngagement(item),
    engagementRate: engagementRate(item),
  };
}

function sortTop(
  items: ReportsTopItem[],
  sort: ReportsTopSort
): ReportsTopItem[] {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sort === "engagement_rate") {
      const ar = a.engagementRate ?? -1;
      const br = b.engagementRate ?? -1;
      if (br !== ar) return br - ar;
      return b.engagement - a.engagement;
    }
    if (sort === "likes") {
      if (b.likes !== a.likes) return b.likes - a.likes;
      return b.engagement - a.engagement;
    }
    if (b.views !== a.views) return b.views - a.views;
    return b.engagement - a.engagement;
  });
  return copy.slice(0, 5);
}

export async function getReportsSummary(): Promise<ReportsSummary> {
  const contents = await prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      url: true,
      title: true,
      platform: true,
      thumbnailUrl: true,
      author: true,
      likes: true,
      comments: true,
      shares: true,
      views: true,
      updatedAt: true,
      snapshots: {
        orderBy: { capturedAt: "asc" },
        select: {
          likes: true,
          comments: true,
          shares: true,
          views: true,
          capturedAt: true,
        },
      },
    },
  });

  if (contents.length === 0) {
    return {
      empty: true,
      contentCount: 0,
      summary: {
        totalEngagement: 0,
        averageEngagementRate: null,
        totalViews: 0,
        fastestGrowth: null,
      },
      top: {
        byEngagementRate: [],
        byLikes: [],
        byViews: [],
      },
      platformBreakdown: [],
      trend: [],
      exportRows: [],
    };
  }

  const latestMetrics = contents.map((content) => {
    const latest = content.snapshots[content.snapshots.length - 1];
    const likes = latest?.likes ?? content.likes;
    const comments = latest?.comments ?? content.comments;
    const shares = latest?.shares ?? content.shares;
    const views = latest?.views ?? content.views;
    return {
      id: content.id,
      title: content.title,
      platform: content.platform,
      thumbnailUrl: content.thumbnailUrl,
      author: content.author,
      updatedAt: content.updatedAt,
      likes,
      comments,
      shares,
      views,
      snapshots: content.snapshots,
    };
  });

  const totalEngagementSum = latestMetrics.reduce(
    (sum, item) => sum + totalEngagement(item),
    0
  );
  const totalViews = latestMetrics.reduce((sum, item) => sum + item.views, 0);
  const avgRate = averageEngagementRate(latestMetrics);

  let fastestGrowth: ReportsFastestGrowth | null = null;
  for (const item of latestMetrics) {
    if (item.snapshots.length < 2) continue;
    const first = item.snapshots[0];
    const latest = item.snapshots[item.snapshots.length - 1];
    const firstEngagement = totalEngagement(first);
    const latestEngagement = totalEngagement(latest);
    if (firstEngagement <= 0) continue;
    const growthPercent =
      ((latestEngagement - firstEngagement) / firstEngagement) * 100;
    if (!fastestGrowth || growthPercent > fastestGrowth.growthPercent) {
      fastestGrowth = {
        id: item.id,
        title: item.title,
        platform: item.platform,
        author: item.author,
        growthPercent,
        firstEngagement,
        latestEngagement,
      };
    }
  }

  const topItems = latestMetrics.map(toTopItem);

  const platformMap = new Map<
    string,
    { engagement: number; contentCount: number }
  >();
  for (const item of latestMetrics) {
    const current = platformMap.get(item.platform) ?? {
      engagement: 0,
      contentCount: 0,
    };
    current.engagement += totalEngagement(item);
    current.contentCount += 1;
    platformMap.set(item.platform, current);
  }

  const platformOrder = ["TIKTOK", "INSTAGRAM", "YOUTUBE"] as const;
  const platformBreakdown: ReportsSummary["platformBreakdown"] = platformOrder
    .filter((platform) => platformMap.has(platform))
    .map((platform) => {
      const data = platformMap.get(platform)!;
      return {
        platform,
        label: platformLabel(platform),
        engagement: data.engagement,
        contentCount: data.contentCount,
      };
    });

  Array.from(platformMap.keys()).forEach((platform) => {
    if ((platformOrder as readonly string[]).includes(platform)) return;
    const data = platformMap.get(platform)!;
    platformBreakdown.push({
      platform,
      label: platformLabel(platform),
      engagement: data.engagement,
      contentCount: data.contentCount,
    });
  });

  const byDay = new Map<string, number>();
  for (const content of contents) {
    for (const snapshot of content.snapshots) {
      const key = dayKey(snapshot.capturedAt);
      byDay.set(key, (byDay.get(key) ?? 0) + totalEngagement(snapshot));
    }
  }
  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, engagement]) => ({ date, engagement }));

  const exportRows: ReportsExportRow[] = latestMetrics.map((item) => ({
    title: item.title || item.id,
    platform: platformLabel(item.platform),
    author: item.author || "",
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    views: item.views,
    engagementRate: engagementRate(item),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return {
    empty: false,
    contentCount: contents.length,
    summary: {
      totalEngagement: totalEngagementSum,
      averageEngagementRate: avgRate,
      totalViews,
      fastestGrowth,
    },
    top: {
      byEngagementRate: sortTop(topItems, "engagement_rate"),
      byLikes: sortTop(topItems, "likes"),
      byViews: sortTop(topItems, "views"),
    },
    platformBreakdown,
    trend,
    exportRows,
  };
}
