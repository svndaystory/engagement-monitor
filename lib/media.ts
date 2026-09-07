/**
 * Allowed social CDN hosts for media proxying.
 * Keep this tight to avoid becoming an open proxy.
 */
export function isAllowedMediaHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.endsWith(".tiktokcdn.com") ||
    host.endsWith(".tiktokcdn-us.com") ||
    host.endsWith(".tiktokcdn-eu.com") ||
    host.endsWith(".cdninstagram.com") ||
    host.endsWith(".fbcdn.net") ||
    host.endsWith(".instagram.com") ||
    host === "i.ytimg.com" ||
    host.endsWith(".ggpht.com") ||
    host.endsWith(".googleusercontent.com")
  );
}

/** Rewrite remote thumbnail URL through our same-origin proxy. */
export function proxiedMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!isAllowedMediaHost(parsed.hostname)) {
      // Fall back to original URL for unknown hosts
      return url;
    }
    return `/api/media/proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return null;
  }
}
