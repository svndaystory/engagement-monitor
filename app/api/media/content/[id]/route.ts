import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveThumbnailCache } from "@/lib/thumbnail-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const id = context.params.id;

  try {
    const content = await prisma.content.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        platform: true,
        thumbnailUrl: true,
        thumbnailData: true,
        thumbnailMime: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: "Konten tidak ditemukan." }, { status: 404 });
    }

    if (content.thumbnailData && content.thumbnailData.length > 0) {
      const mime = content.thumbnailMime || "image/jpeg";
      return new NextResponse(new Uint8Array(content.thumbnailData), {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          "Content-Length": String(content.thumbnailData.length),
        },
      });
    }

    const cached = await resolveThumbnailCache({
      thumbnailUrl: content.thumbnailUrl,
      pageUrl: content.url,
      platform: content.platform,
    });

    if (!cached) {
      return NextResponse.json(
        { error: "Thumbnail tidak tersedia." },
        { status: 404 }
      );
    }

    // Persist so later requests don't depend on short-lived CDN signatures
    await prisma.content
      .update({
        where: { id: content.id },
        data: {
          thumbnailUrl: cached.sourceUrl,
          thumbnailData: cached.data,
          thumbnailMime: cached.mime,
        },
      })
      .catch((error) => {
        console.error("[GET /api/media/content/:id] cache persist failed", error);
      });

    return new NextResponse(new Uint8Array(cached.data), {
      status: 200,
      headers: {
        "Content-Type": cached.mime,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Content-Length": String(cached.data.byteLength),
      },
    });
  } catch (error) {
    console.error("[GET /api/media/content/:id]", error);
    return NextResponse.json(
      { error: "Gagal mengambil thumbnail." },
      { status: 502 }
    );
  }
}
