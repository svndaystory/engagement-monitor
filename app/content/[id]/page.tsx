import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DeleteContentButton } from "@/components/DeleteContentButton";
import { EngagementChart } from "@/components/EngagementChart";
import { MetricStat } from "@/components/MetricStat";
import { LiveIndicator, PlatformBadge } from "@/components/PlatformBadge";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function ContentDetailPage({ params }: PageProps) {
  const content = await prisma.content
    .findUnique({
      where: { id: params.id },
      include: {
        snapshots: {
          orderBy: { capturedAt: "asc" },
        },
      },
    })
    .catch(() => null);

  if (!content) {
    notFound();
  }

  const snapshots = content.snapshots.map((snapshot) => ({
    id: snapshot.id,
    likes: snapshot.likes,
    comments: snapshot.comments,
    shares: snapshot.shares,
    views: snapshot.views,
    captured_at: snapshot.capturedAt.toISOString(),
  }));

  const previous =
    snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/content"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Content
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <LiveIndicator />
          <DeleteContentButton
            contentId={content.id}
            label={content.title || content.url}
          />
        </div>
      </div>

      <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          {content.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.thumbnailUrl}
              alt={content.title || "Thumbnail"}
              referrerPolicy="no-referrer"
              className="h-44 w-32 rounded-md object-cover bg-bg"
            />
          ) : (
            <div className="flex h-44 w-32 items-center justify-center rounded-md bg-bg text-xs text-muted">
              —
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <PlatformBadge platform={content.platform} />
              <span className="font-mono text-xs text-muted">
                {snapshots.length} snapshots
              </span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
              {content.title || "Tanpa judul"}
            </h1>
            <p className="text-sm text-muted">
              {content.author ? `@${content.author}` : "—"}
            </p>
            <a
              href={content.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex max-w-full items-center gap-1.5 text-sm text-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{content.url}</span>
            </a>
            <p className="text-xs text-muted">
              Posted {formatDateTime(content.postedAt)} · Updated{" "}
              {formatDateTime(content.updatedAt)}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Metrik utama"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <MetricStat
          label="Likes"
          value={content.likes}
          previous={previous?.likes}
          accent="amber"
        />
        <MetricStat
          label="Comments"
          value={content.comments}
          previous={previous?.comments}
          accent="teal"
        />
        <MetricStat
          label="Shares"
          value={content.shares}
          previous={previous?.shares}
        />
        <MetricStat
          label="Views"
          value={content.views}
          previous={previous?.views}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text">Pertumbuhan</h2>
        <EngagementChart snapshots={snapshots} />
      </section>
    </div>
  );
}
