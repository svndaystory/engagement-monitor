"use client";

import { Download } from "lucide-react";
import { buildReportsCsv, type ReportsExportRow } from "@/lib/reports-shared";

type Props = {
  rows: ReportsExportRow[];
  disabled?: boolean;
};

export function ExportCsvButton({ rows, disabled = false }: Props) {
  function handleExport() {
    if (rows.length === 0) return;

    const csv = buildReportsCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `engagement-report-${stamp}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || rows.length === 0}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-bg/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" aria-hidden />
      Export CSV
    </button>
  );
}
