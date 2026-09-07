"use client";

import { useState } from "react";
import Link from "next/link";
import { ContentThumbnail } from "@/components/ContentThumbnail";
import { PlatformBadge } from "@/components/PlatformBadge";
import { formatCompact, formatNumber } from "@/lib/format";
import type { ReportsTopItem, ReportsTopSort } from "@/lib/reports-shared";

type Props = {
  byEngagementRate: ReportsTopItem[];
  byLikes: ReportsTopItem[];
  byViews: ReportsTopItem[];
};

const SORT_OPTIONS: Array<{ value: ReportsTopSort; label: string }> = [
  { value: "engagement_rate", label: "Engagement rate" },
  { value: "likes", label: "Likes" },
  { value: "views", label: "Views" },
];

export function TopPerformingContent({
  byEngagementRate,
  byLikes,
  byViews,
}: Props) {
  const [sort, setSort] = useState<ReportsTopSort>("engagement_rate");

  const items =
    sort === "likes" ? byLikes : sort === "views" ? byViews : byEngagementRate;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-base font-semibold text-text">Top performing</h2>
        <div
          className="inline-flex rounded-md border border-border bg-surface p-0.5"
          role="group"
          aria-label="Urutkan top content"
        >
          {SORT_OPTIONS.map((option) => {
            const active = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                className={[
                  "rounded px-2.5 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
                  active
                    ? "bg-bg text-text"
                    : "text-muted hover:text-text",
                ].join(" ")}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          Belum ada konten untuk diperingkat.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border bg-surface">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={[
                "px-3 py-3 sm:px-4",
                index > 0 ? "border-t border-border" : "",
                "hover:bg-bg/60",
              ].join(" ")}
            >
              <Link
                href={`/content/${item.id}`}
                className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                <span className="w-5 shrink-0 font-mono text-xs text-muted">
                  {index + 1}
                </span>
                <ContentThumbnail
                  contentId={item.id}
                  src={item.thumbnailUrl}
                  className="h-12 w-10 rounded object-cover bg-bg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">
                    {item.title || "Tanpa judul"}
                  </p>
                  <div className="mt-1">
                    <PlatformBadge platform={item.platform} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {sort === "engagement_rate" ? (
                    <>
                      <p className="font-mono text-sm text-text">
                        {item.engagementRate == null
                          ? "—"
                          : `${item.engagementRate.toFixed(1)}%`}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted">ER</p>
                    </>
                  ) : sort === "likes" ? (
                    <>
                      <p className="font-mono text-sm text-text">
                        {formatCompact(item.likes)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {formatNumber(item.likes)} likes
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-sm text-text">
                        {formatCompact(item.views)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {formatNumber(item.views)} views
                      </p>
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
