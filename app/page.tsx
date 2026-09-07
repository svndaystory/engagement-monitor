import Link from "next/link";
import { ContentList } from "@/components/ContentList";
import { SummaryStrip } from "@/components/SummaryStrip";
import {
  getContentSummaryItems,
  getRecentContents,
} from "@/lib/content-queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let summaryItems = null;
  let recentItems = null;

  try {
    [summaryItems, recentItems] = await Promise.all([
      getContentSummaryItems(),
      getRecentContents(5),
    ]);
  } catch (error) {
    console.error("[HomePage] Failed to load contents", error);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
        Dashboard
      </h1>

      {summaryItems === null || recentItems === null ? (
        <p
          role="alert"
          className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber"
        >
          Gagal memuat data.
        </p>
      ) : (
        <>
          <SummaryStrip items={summaryItems} />

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-base font-semibold text-text">Terbaru</h2>
              <Link
                href="/content"
                className="text-sm text-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Semua
              </Link>
            </div>
            <ContentList items={recentItems} emptyHint="Belum ada konten." />
          </section>
        </>
      )}
    </div>
  );
}
