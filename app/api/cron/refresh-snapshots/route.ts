import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeContent, ScraperError } from "@/lib/scraper";
import { resolveThumbnailCache } from "@/lib/thumbnail-cache";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RefreshSuccess = {
  contentId: string;
  url: string;
  status: "success";
  snapshotId: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
};

type RefreshFailure = {
  contentId: string;
  url: string;
  status: "error";
  error: string;
};

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (!header) return false;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return false;

  return token === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Header Authorization Bearer CRON_SECRET diperlukan." },
      { status: 401 }
    );
  }

  const startedAt = new Date();
  const contents = await prisma.content.findMany({
    orderBy: { updatedAt: "asc" },
    select: {
      id: true,
      url: true,
    },
  });

  const results: Array<RefreshSuccess | RefreshFailure> = [];

  for (const content of contents) {
    try {
      const scraped = await scrapeContent(content.url);
      const postedAt = scraped.posted_at ? new Date(scraped.posted_at) : null;
      const thumb = await resolveThumbnailCache({
        thumbnailUrl: scraped.thumbnail_url,
        pageUrl: content.url,
        platform: scraped.platform,
      });

      const updated = await prisma.content.update({
        where: { id: content.id },
        data: {
          platform: scraped.platform,
          title: scraped.title,
          thumbnailUrl: thumb?.sourceUrl ?? scraped.thumbnail_url,
          ...(thumb
            ? {
                thumbnailData: thumb.data,
                thumbnailMime: thumb.mime,
              }
            : {}),
          author: scraped.author,
          likes: scraped.likes,
          comments: scraped.comments,
          shares: scraped.shares,
          views: scraped.views,
          postedAt,
          snapshots: {
            create: {
              likes: scraped.likes,
              comments: scraped.comments,
              shares: scraped.shares,
              views: scraped.views,
            },
          },
        },
        include: {
          snapshots: {
            orderBy: { capturedAt: "desc" },
            take: 1,
          },
        },
      });

      const latestSnapshot = updated.snapshots[0];

      results.push({
        contentId: content.id,
        url: content.url,
        status: "success",
        snapshotId: latestSnapshot?.id ?? "",
        likes: scraped.likes,
        comments: scraped.comments,
        shares: scraped.shares,
        views: scraped.views,
      });
    } catch (error) {
      const message =
        error instanceof ScraperError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unknown scrape error";

      console.error(
        `[GET /api/cron/refresh-snapshots] Failed for ${content.id}`,
        message
      );

      results.push({
        contentId: content.id,
        url: content.url,
        status: "error",
        error: message,
      });
    }
  }

  const succeeded = results.filter((item) => item.status === "success").length;
  const failed = results.filter((item) => item.status === "error").length;
  const finishedAt = new Date();

  return NextResponse.json({
    ok: failed === 0,
    summary: {
      total: contents.length,
      succeeded,
      failed,
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
    },
    results,
  });
}
