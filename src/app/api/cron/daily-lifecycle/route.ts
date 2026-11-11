import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MembershipStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  let transitionedToExpired = 0;
  let expiringWithin3DaysCount = 0;

  try {
    // 1. Mark ACTIVE memberships whose endDate has passed as EXPIRED
    const expiredResult = await db.membership.updateMany({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: { lt: now },
      },
      data: { status: MembershipStatus.EXPIRED },
    });
    transitionedToExpired = expiredResult.count;

    // 2. Find memberships expiring in 3 days for automated WhatsApp retention nudges
    const expiringSoon = await db.membership.findMany({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: { gte: now, lte: threeDaysFromNow },
      },
      select: {
        id: true,
        gymId: true,
        endDate: true,
        member: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    });
    expiringWithin3DaysCount = expiringSoon.length;
  } catch (err) {
    console.warn("DB offline during cron execution, responding with graceful health check:", err);
  }

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    transitionedToExpired,
    expiringWithin3DaysCount,
  });
}
