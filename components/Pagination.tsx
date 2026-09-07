import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath?: string;
  query?: string;
};

function hrefFor(basePath: string, page: number, query?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query?.trim()) params.set("q", query.trim());
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const btnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
const btnDisabledClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted/35";

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  basePath = "/content",
  query,
}: Props) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-xs text-muted">
        {from}–{to} / {total}
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={hrefFor(basePath, page - 1, query)}
            className={btnClass}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={btnDisabledClass} aria-hidden>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
        <span className="font-mono text-xs text-muted">
          {page}/{totalPages}
        </span>
        {hasNext ? (
          <Link
            href={hrefFor(basePath, page + 1, query)}
            className={btnClass}
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={btnDisabledClass} aria-hidden>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
