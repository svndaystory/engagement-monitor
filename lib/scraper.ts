import {
  detectPlatform,
  PlatformDetectionError,
  type Platform,
} from "@/lib/platform";

export type ScrapedContent = {
  platform: Platform;
  title: string | null;
  thumbnail_url: string | null;
  author: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  posted_at: string | null;
};

export class ScraperError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ScraperError";
    this.status = status;
  }
}

const SCRAPECREATORS_BASE = "https://api.scrapecreators.com";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object"
    ? (value as JsonRecord)
    : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return 0;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function isBrowserFriendlyImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  // TikTok often returns .heic first; browsers can't render HEIC in <img>.
  if (lower.includes(".heic")) return false;
  return (
    lower.includes(".jpeg") ||
    lower.includes(".jpg") ||
    lower.includes(".png") ||
    lower.includes(".webp") ||
    lower.includes(".image") // TikTok dynamic cover variants that serve as jpeg
  );
}

function firstUrlFromCover(cover: unknown): string | null {
  const record = asRecord(cover);
  if (!record) return null;

  const urlList = Array.isArray(record.url_list)
    ? record.url_list.filter((item): item is string => typeof item === "string")
    : [];

  const preferred = urlList.find(isBrowserFriendlyImageUrl);
  if (preferred) return preferred;
  if (urlList[0]) return urlList[0];

  return asString(record.url);
}

async function callScrapeCreators(
  path: string,
  url: string
): Promise<JsonRecord> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;

  if (!apiKey) {
    throw new ScraperError(
      "SCRAPECREATORS_API_KEY belum dikonfigurasi di environment server.",
      500
    );
  }

  const endpoint = `${SCRAPECREATORS_BASE}${path}?url=${encodeURIComponent(url)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new ScraperError(
      "Gagal menghubungi ScrapeCreators API. Coba lagi beberapa saat.",
      502
    );
  }

  let payload: JsonRecord = {};
  try {
    payload = (await response.json()) as JsonRecord;
  } catch {
    // ignore parse errors; handled below via status
  }

  if (!response.ok) {
    const apiMessage =
      asString(payload.message) ||
      asString(payload.error) ||
      asString(payload.detail);

    if (response.status === 401) {
      throw new ScraperError(
        "API key ScrapeCreators tidak valid. Periksa SCRAPECREATORS_API_KEY.",
        401
      );
    }

    if (response.status === 402) {
      throw new ScraperError(
        "Kredit ScrapeCreators habis. Top up kredit lalu coba lagi.",
        402
      );
    }

    if (response.status === 404) {
      throw new ScraperError(
        "Konten tidak ditemukan atau bersifat privat.",
        404
      );
    }

    throw new ScraperError(
      apiMessage ||
        `ScrapeCreators mengembalikan error (HTTP ${response.status}).`,
      response.status >= 400 && response.status < 600 ? response.status : 502
    );
  }

  if (payload.success === false) {
    throw new ScraperError(
      asString(payload.message) ||
        asString(payload.error) ||
        "ScrapeCreators gagal mengambil data konten.",
      502
    );
  }

  return payload;
}

/**
 * Instagram live response (/v1/instagram/post):
 * data.xdt_shortcode_media.{
 *   thumbnail_src, display_url, owner.username,
 *   edge_media_preview_like.count, comment_count,
 *   edge_media_to_parent_comment.count, edge_media_preview_comment.count,
 *   video_play_count, edge_media_to_caption.edges[0].node.text, created_at
 * }
 * Shares are not provided by this endpoint → 0.
 */
function normalizeInstagram(payload: JsonRecord): ScrapedContent {
  const data = asRecord(payload.data);
  const media = asRecord(data?.xdt_shortcode_media);

  if (!media) {
    throw new ScraperError(
      "Response Instagram tidak lengkap. Tidak bisa memetakan data konten.",
      502
    );
  }

  const owner = asRecord(media.owner);
  const likeEdge = asRecord(media.edge_media_preview_like);
  const commentEdge =
    asRecord(media.edge_media_to_parent_comment) ||
    asRecord(media.edge_media_preview_comment);
  const captionEdge = asRecord(media.edge_media_to_caption);
  const captionEdges = Array.isArray(captionEdge?.edges)
    ? captionEdge.edges
    : [];
  const firstCaption = asRecord(asRecord(captionEdges[0])?.node);

  const title =
    asString(firstCaption?.text) ||
    asString(media.title) ||
    null;

  const postedAt =
    asString(media.created_at) ||
    (typeof media.taken_at_timestamp === "number"
      ? new Date(media.taken_at_timestamp * 1000).toISOString()
      : null);

  return {
    platform: "INSTAGRAM",
    title,
    thumbnail_url: asString(media.thumbnail_src) || asString(media.display_url),
    author: asString(owner?.username) || asString(owner?.full_name),
    likes: asNumber(likeEdge?.count),
    comments:
      asNumber(media.comment_count) || asNumber(commentEdge?.count),
    shares: 0,
    views: asNumber(media.video_play_count) || asNumber(media.video_view_count),
    posted_at: postedAt,
  };
}

/**
 * TikTok live response (/v2/tiktok/video):
 * Root-level aweme_detail (not nested under data) with:
 * aweme_detail.{desc, author.unique_id|nickname, create_time,
 * statistics.{digg_count, comment_count, share_count, play_count},
 * video.cover.url_list[0]}
 */
function normalizeTikTok(payload: JsonRecord): ScrapedContent {
  const data = asRecord(payload.data);
  const aweme =
    asRecord(payload.aweme_detail) ||
    asRecord(data?.aweme_detail) ||
    data;

  if (!aweme || !asRecord(aweme.statistics)) {
    throw new ScraperError(
      "Response TikTok tidak lengkap. Tidak bisa memetakan data konten.",
      502
    );
  }

  const author = asRecord(aweme.author);
  const statistics = asRecord(aweme.statistics);
  const video = asRecord(aweme.video);

  const thumbnail =
    firstUrlFromCover(video?.cover) ||
    firstUrlFromCover(video?.origin_cover) ||
    firstUrlFromCover(video?.dynamic_cover);

  const createTime = aweme.create_time;
  const postedAt =
    typeof createTime === "number"
      ? new Date(createTime * 1000).toISOString()
      : asString(createTime);

  return {
    platform: "TIKTOK",
    title: asString(aweme.desc),
    thumbnail_url: thumbnail,
    author:
      asString(author?.unique_id) ||
      asString(author?.nickname) ||
      asString(author?.uniqueId),
    likes: asNumber(statistics?.digg_count) || asNumber(statistics?.like_count),
    comments: asNumber(statistics?.comment_count),
    shares: asNumber(statistics?.share_count),
    views: asNumber(statistics?.play_count),
    posted_at: postedAt,
  };
}

export async function scrapeContent(url: string): Promise<ScrapedContent> {
  let platform: Platform;

  try {
    platform = detectPlatform(url);
  } catch (error) {
    if (error instanceof PlatformDetectionError) {
      throw new ScraperError(error.message, 400);
    }
    throw error;
  }

  if (platform === "YOUTUBE") {
    throw new ScraperError(
      "YouTube terdeteksi, tetapi scraper YouTube belum diaktifkan di MVP ini.",
      501
    );
  }

  if (platform === "INSTAGRAM") {
    const payload = await callScrapeCreators("/v1/instagram/post", url);
    return normalizeInstagram(payload);
  }

  // Official docs currently expose TikTok video info at /v2/tiktok/video
  const payload = await callScrapeCreators("/v2/tiktok/video", url);
  return normalizeTikTok(payload);
}
