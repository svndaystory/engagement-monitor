import Link from "next/link";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import { OverallTrendChart } from "@/components/OverallTrendChart";
import { PlatformBreakdownChart } from "@/components/PlatformBreakdownChart";
import { ReportsSummaryStrip } from "@/components/ReportsSummaryStrip";
import { TopPerformingContent } from "@/components/TopPerformingContent";
import { getReportsSummary } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  let report = null;

  try {
    report = await getReportsSummary();
  } catch (error) {
    console.error("[ReportsPage] Failed to load summary", error);
  }

  if (report === null) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
          Reports
        </h1>
        <p
          role="alert"
          className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber"
        >
          Gagal memuat data. Coba refresh — biasanya koneksi database sementara
          putus.
        </p>
      </div>
    );
  }

  if (report.empty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
            Reports
          </h1>
          <ExportCsvButton rows={[]} disabled />
        </div>
        <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-12 text-center">
          <p className="text-sm text-text">
            Belum ada konten untuk dianalisis — tambahkan konten di halaman
            Dashboard terlebih dahulu.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            Ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">
          Reports
        </h1>
        <ExportCsvButton rows={report.exportRows} />
      </div>

      <ReportsSummaryStrip summary={report.summary} />

      <TopPerformingContent
        byEngagementRate={report.top.byEngagementRate}
        byLikes={report.top.byLikes}
        byViews={report.top.byViews}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text">
          Breakdown per platform
        </h2>
        <PlatformBreakdownChart data={report.platformBreakdown} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text">Tren keseluruhan</h2>
        <OverallTrendChart data={report.trend} />
      </section>
    </div>
  );
}
