import { NextResponse } from "next/server";
import { getReportsSummary } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getReportsSummary();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/reports/summary]", error);
    return NextResponse.json(
      { error: "Gagal memuat ringkasan reports." },
      { status: 500 }
    );
  }
}
