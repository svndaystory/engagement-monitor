import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectPlatform, PlatformDetectionError } from "@/lib/platform";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { snapshots: true } },
      },
    });

    return NextResponse.json({
      data: contents.map((item) => ({
        id: item.id,
        url: item.url,
        platform: item.platform,
        title: item.title,
        thumbnail_url: item.thumbnailUrl,
        author: item.author,
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
        views: item.views,
        posted_at: item.postedAt,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        snapshot_count: item._count.snapshots,
      })),
    });
  } catch (error) {
    console.error("[GET /api/content]", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar konten." },
      { status: 500 }
    );
  }
}

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

    let platform;
    try {
      platform = detectPlatform(url);
    } catch (error) {
      if (error instanceof PlatformDetectionError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    const existing = await prisma.content.findUnique({ where: { url } });
    if (existing) {
      return NextResponse.json({ data: existing }, { status: 200 });
    }

    const content = await prisma.content.create({
      data: {
        url,
        platform,
      },
    });

    return NextResponse.json({ data: content }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/content]", error);
    return NextResponse.json(
      { error: "Gagal membuat konten." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Query `id` wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/content]", error);
    return NextResponse.json(
      { error: "Gagal menghapus konten. Pastikan ID valid." },
      { status: 500 }
    );
  }
}
