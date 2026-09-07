"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { LiveIndicator, PlatformBadge } from "@/components/PlatformBadge";
import { Sparkline } from "@/components/Sparkline";
import { TrendIndicator } from "@/components/TrendIndicator";
import { useMonitorUI } from "@/components/MonitorUIProvider";
import { formatCompact, formatNumber } from "@/lib/format";

export type ContentListItem = {
  id: string;
  url: string;
  platform: string;
  title: string | null;
  author: string | null;
  thumbnailUrl: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  snapshotCount: number;
  likeSeries: number[];
  previousLikes: number | null;
  previousComments: number | null;
  previousViews: number | null;
};

type Props = {
  items: ContentListItem[];
  serverFiltered?: boolean;
  emptyHint?: string;
};

export function ContentList({
  items,
  serverFiltered = false,
  emptyHint,
}: Props) {
  const router = useRouter();
  const { searchQuery, openTrack } = useMonitorUI();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = searchQuery.trim().toLowerCase();
  const filtered =
    serverFiltered || !q
      ? items
      : items.filter((item) => {
          const haystack = [item.title, item.author, item.url, item.platform]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });

  async function handleDelete(item: ContentListItem) {
    const label = item.title || item.url;
    const confirmed = window.confirm(`Hapus konten?\n\n${label}`);
    if (!confirmed) return;

    setError(null);
    setDeletingId(item.id);

    try {
      const response = await fetch(
        `/api/content?id=${encodeURIComponent(item.id)}`,
        { method: "DELETE" }
      );
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error || "Gagal menghapus.");
        return;
      }

      router.refresh();
    } catch {
      setError("Gagal menghapus.");
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center">
        <p className="text-sm text-muted">{emptyHint || "Belum ada konten."}</p>
        <button
          type="button"
          onClick={openTrack}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-amber px-3 py-2 text-sm font-medium text-bg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Track
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
        Tidak ada hasil.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <ul className="overflow-hidden rounded-lg border border-border bg-surface">
        {filtered.map((item, index) => (
          <li
            key={item.id}
            className={[
              "px-3 py-3 sm:px-4",
              index > 0 ? "border-t border-border" : "",
              "hover:bg-bg/60",
            ].join(" ")}
          >
            <div className="flex items-start gap-3 sm:items-center">
              <Link
                href={`/content/${item.id}`}
                className="min-w-0 flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1.4fr)_112px_auto] sm:gap-4">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-12 w-10 rounded object-cover bg-bg"
                    />
                  ) : (
                    <div className="flex h-12 w-10 items-center justify-center rounded bg-bg text-[10px] text-muted">
                      —
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="truncate text-sm font-medium text-text">
                        {item.title || item.url}
                      </p>
                      <LiveIndicator />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="truncate text-xs text-muted">
                        {item.author ? `@${item.author}` : "—"}
                      </p>
                      <PlatformBadge platform={item.platform} />
                    </div>
                  </div>

                  <div className="col-span-2 hidden justify-center sm:col-span-1 sm:flex">
                    <Sparkline values={item.likeSeries} />
                  </div>

                  <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-1 sm:justify-end">
                    <Metric
                      label="likes"
                      value={item.likes}
                      previous={item.previousLikes}
                    />
                    <Metric
                      label="comments"
                      value={item.comments}
                      previous={item.previousComments}
                    />
                    <Metric
                      label="views"
                      value={item.views}
                      previous={item.previousViews}
                      compact
                    />
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.id}
                className="inline-flex shrink-0 items-center justify-center rounded-md border border-border p-2 text-muted hover:border-danger/40 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-50"
                aria-label={`Hapus ${item.title || item.url}`}
              >
                {deletingId === item.id ? (
                  <LoaderCircle
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden
                  />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({
  label,
  value,
  previous = null,
  compact = false,
}: {
  label: string;
  value: number;
  previous?: number | null;
  compact?: boolean;
}) {
  return (
    <div className="text-right">
      <p className="font-mono text-sm text-text">
        {compact ? formatCompact(value) : formatNumber(value)}
      </p>
      <div className="mt-0.5 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-muted">{label}</span>
        <TrendIndicator current={value} previous={previous} />
      </div>
    </div>
  );
}
