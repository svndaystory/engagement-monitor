"use client";

import { useState } from "react";
import { proxiedMediaUrl } from "@/lib/media";

type Props = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
};

export function ContentThumbnail({
  src,
  alt = "",
  className = "h-12 w-10 rounded object-cover bg-bg",
}: Props) {
  const proxied = proxiedMediaUrl(src);
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
