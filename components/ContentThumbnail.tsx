"use client";

import { useState } from "react";
import { proxiedMediaUrl } from "@/lib/media";

type Props = {
  /** Prefer stable same-origin cache when available */
  contentId?: string;
  src?: string | null;
  alt?: string;
  className?: string;
};

export function ContentThumbnail({
  contentId,
  src,
  alt = "",
  className = "h-12 w-10 rounded object-cover bg-bg",
}: Props) {
  const proxied = contentId
    ? `/api/media/content/${contentId}`
    : proxiedMediaUrl(src);
  const [failed, setFailed] = useState(false);

  if (!proxied || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-bg text-[10px] text-muted ${className}`}
        aria-hidden
      >
        —
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={proxied}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
