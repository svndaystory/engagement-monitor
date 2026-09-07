import { isAllowedMediaHost } from "@/lib/media";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export type CachedThumbnail = {
  data: Buffer;
  mime: string;
  sourceUrl: string;
};

function refererForHost(hostname: string): string | undefined {
  const host = hostname.toLowerCase();
  if (host.includes("tiktok")) return "https://www.tiktok.com/";
  if (
    host.includes("instagram") ||
    host.includes("fbcdn") ||
    host.includes("cdninstagram")
  ) {
    return "https://www.instagram.com/";
  }
  return undefined;
}

export async function downloadImage(
  imageUrl: string
): Promise<{ data: Buffer; mime: string } | null> {
  let target: URL;
  try {
    target = new URL(imageUrl);
  } catch {
    return null;
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return null;
  }
  if (!isAllowedMediaHost(target.hostname)) {
    return null;
  }

  const referer = refererForHost(target.hostname);

  try {
    const response = await fetch(target.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...(referer
          ? { Referer: referer, Origin: new URL(referer).origin }
          : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const mime = response.headers.get("content-type") || "application/octet-stream";
    if (!mime.startsWith("image/") && !mime.includes("octet-stream")) {
      return null;
    }
    if (mime.includes("heic") || mime.includes("heif")) {
      return null;
    }

    const data = Buffer.from(await response.arrayBuffer());
    if (data.byteLength === 0 || data.byteLength > MAX_BYTES) {
      return null;
    }

    return {
      data,
      mime: mime.startsWith("image/") ? mime.split(";")[0].trim() : "image/jpeg",
    };
  } catch {
    return null;
  }
}

/** Fresh signed cover URL from TikTok's public oEmbed endpoint. */
export async function tiktokOEmbedThumbnailUrl(
  pageUrl: string
): Promise<string | null> {
  try {
    const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(pageUrl)}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { thumbnail_url?: unknown };
    return typeof payload.thumbnail_url === "string" && payload.thumbnail_url
      ? payload.thumbnail_url
      : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a displayable thumbnail: try remote URL, then TikTok oEmbed fallback.
 */
export async function resolveThumbnailCache(options: {
  thumbnailUrl: string | null | undefined;
  pageUrl: string;
  platform: string;
}): Promise<CachedThumbnail | null> {
  const candidates: string[] = [];
  if (options.thumbnailUrl) candidates.push(options.thumbnailUrl);

  if (options.platform === "TIKTOK") {
    const oembed = await tiktokOEmbedThumbnailUrl(options.pageUrl);
    if (oembed && !candidates.includes(oembed)) {
      candidates.push(oembed);
    }
  }

  for (const sourceUrl of candidates) {
    const downloaded = await downloadImage(sourceUrl);
    if (downloaded) {
      return { ...downloaded, sourceUrl };
    }
  }

  return null;
}
