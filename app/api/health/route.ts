import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  const region = process.env.VERCEL_REGION ?? "local";

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "up",
      region,
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[GET /api/health]", message);
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        region,
        latencyMs: Date.now() - started,
        error: message.slice(0, 200),
      },
      { status: 503 }
    );
  }
}
