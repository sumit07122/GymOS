import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  listInventoryItems,
  getInventoryOverview,
} from "@/lib/services/inventory.service";
import { InventoryHub } from "@/components/inventory/inventory-hub";
import { Loader2 } from "lucide-react";
import { GymRole, SystemRole } from "@prisma/client";
import { db } from "@/lib/db";

interface InventoryPageProps {
  params: Promise<{ gymSlug: string }>;
}

function InventorySkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading inventory registry and stock valuation…</span>
      </div>
    </div>
  );
}

async function InventoryContent({ params }: InventoryPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [itemsResult, overview, gym] = await Promise.all([
    listInventoryItems(ctx, { limit: 100 }),
    getInventoryOverview(ctx),
    db.gym.findUnique({
      where: { id: ctx.gymId },
      select: { currency: true },
    }),
  ]);

  const canManage =
    ctx.role === GymRole.OWNER ||
    ctx.role === GymRole.STAFF ||
    ctx.role === SystemRole.SUPER_ADMIN;

  return (
    <InventoryHub
      items={itemsResult.items}
      overview={overview}
      gymId={ctx.gymId}
      gymSlug={gymSlug}
      canManage={canManage}
      currency={gym?.currency ?? "INR"}
    />
  );
}

export default function InventoryPage({ params }: InventoryPageProps) {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryContent params={params} />
    </Suspense>
  );
}

