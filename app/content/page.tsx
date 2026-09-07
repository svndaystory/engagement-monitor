import { ContentList } from "@/components/ContentList";
import { Pagination } from "@/components/Pagination";
import { getPaginatedContents } from "@/lib/content-queries";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    page?: string;
    q?: string;
  };
};

export default async function ContentIndexPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams?.page || "1") || 1);
  const q = searchParams?.q?.trim() || "";

  let result = null;
  try {
    result = await getPaginatedContents({ page, q });
  } catch (error) {
    console.error("[ContentIndexPage] Failed to load contents", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
          Content
        </h1>
        {result ? (
          <p className="font-mono text-xs text-muted">
            {result.total}
            {q ? ` · “${q}”` : ""}
          </p>
        ) : null}
      </div>

      {result === null ? (
        <p
          role="alert"
          className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber"
        >
          Gagal memuat data. Coba refresh — biasanya koneksi database sementara
          putus.
        </p>
      ) : (
        <section className="space-y-3">
          <ContentList
            items={result.items}
            serverFiltered
            emptyHint={q ? "Tidak ada hasil." : "Belum ada konten."}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            basePath="/content"
            query={q}
          />
        </section>
      )}
    </div>
  );
}
