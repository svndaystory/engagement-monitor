import { platformDotClass, platformLabel } from "@/lib/format";

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${platformDotClass(platform)}`}
        aria-hidden
      />
      <span>{platformLabel(platform)}</span>
    </span>
  );
}

export function LiveIndicator({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="live-dot" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
