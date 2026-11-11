import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let dbStatus = "connected";
  let dbLatencyMs = 0;
  let gymCount = 0;

  try {
    // Perform lightweight ping to PostgreSQL
    const res = await db.$queryRaw<Array<{ ping: number }>>`SELECT 1 as ping`;
    dbLatencyMs = Date.now() - start;
    if (!res || !Array.isArray(res) || res.length === 0) {
      dbStatus = "unexpected_response";
    }
    gymCount = await db.gym.count().catch(() => 0);
  } catch (err: unknown) {
    dbStatus = "error";
    dbLatencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Health check DB probe failed:", msg);
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: "2.4.0",
      environment: process.env.NODE_ENV || "production",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        registeredGyms: gymCount,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    }
  );
}

