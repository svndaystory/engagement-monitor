import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeContent, ScraperError } from "@/lib/scraper";
import { resolveThumbnailCache } from "@/lib/thumbnail-cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { error: "Field `url` wajib diisi." },
        { status: 400 }
      );
    }

    const scraped = await scrapeContent(url);
    const postedAt = scraped.posted_at ? new Date(scraped.posted_at) : null;
    const thumb = await resolveThumbnailCache({
      thumbnailUrl: scraped.thumbnail_url,
      pageUrl: url,
      platform: scraped.platform,
    });

    const content = await prisma.content.upsert({
      where: { url },
      create: {
        url,
        platform: scraped.platform,
        title: scraped.title,
        thumbnailUrl: thumb?.sourceUrl ?? scraped.thumbnail_url,
        thumbnailData: thumb?.data,
        thumbnailMime: thumb?.mime,
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
      update: {
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

    return NextResponse.json({
      data: {
        id: content.id,
        url: content.url,
        platform: content.platform,
        title: content.title,
        thumbnail_url: content.thumbnailUrl,
        author: content.author,
        likes: content.likes,
        comments: content.comments,
        shares: content.shares,
        views: content.views,
        posted_at: content.postedAt,
        created_at: content.createdAt,
        updated_at: content.updatedAt,
        latest_snapshot: content.snapshots[0] ?? null,
      },
    });
  } catch (error) {
    if (error instanceof ScraperError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("[POST /api/scrape]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat scrape konten." },
      { status: 500 }
    );
  }
}
