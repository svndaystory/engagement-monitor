export type ReportsTopSort = "engagement_rate" | "likes" | "views";

export type ReportsTopItem = {
  id: string;
  title: string | null;
  platform: string;
  thumbnailUrl: string | null;
  author: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
  engagementRate: number | null;
};

export type ReportsFastestGrowth = {
  id: string;
  title: string | null;
  platform: string;
  author: string | null;
  growthPercent: number;
  firstEngagement: number;
  latestEngagement: number;
};

export type ReportsExportRow = {
  title: string;
  platform: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagementRate: number | null;
  updatedAt: string;
};

export type ReportsSummary = {
  empty: boolean;
  contentCount: number;
  summary: {
    totalEngagement: number;
    averageEngagementRate: number | null;
    totalViews: number;
    fastestGrowth: ReportsFastestGrowth | null;
  };
  top: {
    byEngagementRate: ReportsTopItem[];
    byLikes: ReportsTopItem[];
    byViews: ReportsTopItem[];
  };
  platformBreakdown: Array<{
    platform: string;
    label: string;
    engagement: number;
    contentCount: number;
  }>;
  trend: Array<{
    date: string;
    engagement: number;
  }>;
  exportRows: ReportsExportRow[];
};

export function buildReportsCsv(rows: ReportsExportRow[]): string {
  const headers = [
    "title",
    "platform",
    "author",
    "likes",
    "comments",
    "shares",
    "views",
    "engagement_rate",
    "last_updated",
  ];

  const escape = (value: string | number | null): string => {
    const raw =
      value == null
        ? ""
        : typeof value === "number"
          ? String(value)
          : value;
    if (/[",\n\r]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        escape(row.title),
        escape(row.platform),
        escape(row.author),
        escape(row.likes),
        escape(row.comments),
        escape(row.shares),
        escape(row.views),
        escape(
          row.engagementRate == null
            ? ""
            : Number(row.engagementRate.toFixed(4))
        ),
        escape(row.updatedAt),
      ].join(",")
    ),
  ];

  return `${lines.join("\n")}\n`;
}

export function platformChartColor(platform: string): string {
  switch (platform) {
    case "TIKTOK":
      return "#FF3B5C";
    case "INSTAGRAM":
      return "#C13584";
    case "YOUTUBE":
      return "#FF3B30";
    default:
      return "#7c8798";
  }
}
