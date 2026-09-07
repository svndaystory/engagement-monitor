export type Platform = "INSTAGRAM" | "TIKTOK" | "YOUTUBE";

export class PlatformDetectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlatformDetectionError";
  }
}

const PLATFORM_PATTERNS: Array<{ platform: Platform; pattern: RegExp }> = [
  {
    platform: "INSTAGRAM",
    pattern: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\//i,
  },
  {
    platform: "TIKTOK",
    pattern: /^(https?:\/\/)?((www|vm|vt)\.)?tiktok\.com\//i,
  },
  {
    platform: "YOUTUBE",
    pattern:
      /^(https?:\/\/)?((www|m)\.)?(youtube\.com|youtu\.be)\//i,
  },
];

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function detectPlatform(url: string): Platform {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new PlatformDetectionError("URL tidak boleh kosong.");
  }

  if (!isValidUrl(trimmed)) {
    throw new PlatformDetectionError(
      "URL tidak valid. Pastikan dimulai dengan http:// atau https://."
    );
  }

  for (const { platform, pattern } of PLATFORM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return platform;
    }
  }

  throw new PlatformDetectionError(
    "Platform tidak didukung. Saat ini hanya TikTok, Instagram, dan YouTube."
  );
}
