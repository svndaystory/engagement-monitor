import { NextRequest, NextResponse } from "next/server";
import { isAllowedMediaHost } from "@/lib/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Query `url` wajib." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Protocol tidak didukung." }, { status: 400 });
  }

  if (!isAllowedMediaHost(target.hostname)) {
    return NextResponse.json({ error: "Host media tidak diizinkan." }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        // Avoid social CDN hotlink / referrer blocks
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 60 * 60 * 6 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream gagal (HTTP ${upstream.status}).` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
      return NextResponse.json(
        { error: "Response upstream bukan gambar." },
        { status: 502 }
      );
    }

    // HEIC is not displayable in most browsers
    if (contentType.includes("heic") || contentType.includes("heif")) {
      return NextResponse.json(
        { error: "Format HEIC tidak didukung browser." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran gambar tidak valid." },
        { status: 502 }
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400",
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (error) {
    console.error("[GET /api/media/proxy]", error);
    return NextResponse.json(
      { error: "Gagal mengambil media." },
      { status: 502 }
    );
  }
}
