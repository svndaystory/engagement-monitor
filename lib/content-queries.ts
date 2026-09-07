import { prisma } from "@/lib/prisma";
import type { ContentListItem } from "@/components/ContentList";
import { Prisma } from "@prisma/client";

export const CONTENT_PAGE_SIZE = 10;

function previousMetric(series: number[]): number | null {
  if (series.length < 2) return null;
  return series[series.length - 2];
}

export function mapContentToListItem(
  item: {
    id: string;
    url: string;
    platform: string;
    title: string | null;
    author: string | null;
    thumbnailUrl: string | null;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    _count: { snapshots: number };
    snapshots: Array<{
      likes: number;
      comments: number;
      views: number;
    }>;
  }
): ContentListItem {
  const likeSeries = item.snapshots.map((snapshot) => snapshot.likes);
  const commentSeries = item.snapshots.map((snapshot) => snapshot.comments);
  const viewSeries = item.snapshots.map((snapshot) => snapshot.views);

  return {
    id: item.id,
    url: item.url,
    platform: item.platform,
    title: item.title,
    author: item.author,
    thumbnailUrl: item.thumbnailUrl,
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    views: item.views,
    snapshotCount: item._count.snapshots,
    likeSeries,
    previousLikes: previousMetric(likeSeries),
    previousComments: previousMetric(commentSeries),
    previousViews: previousMetric(viewSeries),
  };
}

const contentListInclude = {
  _count: { select: { snapshots: true } },
  snapshots: {
    orderBy: { capturedAt: "asc" as const },
    select: {
      likes: true,
      comments: true,
      shares: true,
      views: true,
      capturedAt: true,
    },
  },
};

function buildSearchWhere(q: string | undefined): Prisma.ContentWhereInput {
  const query = q?.trim();
  if (!query) return {};

  const platformAliases: Record<string, "TIKTOK" | "INSTAGRAM" | "YOUTUBE"> = {
    tiktok: "TIKTOK",
    instagram: "INSTAGRAM",
    youtube: "YOUTUBE",
    ig: "INSTAGRAM",
    yt: "YOUTUBE",
  };
  const platform = platformAliases[query.toLowerCase()];

  return {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { author: { contains: query, mode: "insensitive" } },
      { url: { contains: query, mode: "insensitive" } },
      ...(platform ? [{ platform }] : []),
    ],
  };
}

export async function getContentSummaryItems() {
  return prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      platform: true,
      likes: true,
      comments: true,
      shares: true,
      views: true,
      updatedAt: true,
    },
  });
}

export async function getRecentContents(limit = 5) {
  const items = await prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: contentListInclude,
  });
  return items.map(mapContentToListItem);
}

export async function getPaginatedContents(options: {
  page: number;
  q?: string;
  pageSize?: number;
}) {
  const pageSize = options.pageSize ?? CONTENT_PAGE_SIZE;
  const page = Math.max(1, options.page);
  const where = buildSearchWhere(options.q);

  const [total, items] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: contentListInclude,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  // If requested page is beyond last page, refetch last page
  const pageItems =
    safePage === page
      ? items
      : await prisma.content.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (safePage - 1) * pageSize,
          take: pageSize,
          include: contentListInclude,
        });

  return {
    items: pageItems.map(mapContentToListItem),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
