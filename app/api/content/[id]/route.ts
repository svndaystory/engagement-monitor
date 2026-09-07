import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: context.params.id },
      include: {
        snapshots: {
          orderBy: { capturedAt: "asc" },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Konten tidak ditemukan." },
        { status: 404 }
      );
    }

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
        snapshots: content.snapshots.map((snapshot) => ({
          id: snapshot.id,
          likes: snapshot.likes,
          comments: snapshot.comments,
          shares: snapshot.shares,
          views: snapshot.views,
          captured_at: snapshot.capturedAt,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/content/[id]]", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail konten." },
      { status: 500 }
    );
  }
}
