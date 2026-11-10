import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { Activity, ExternalLink, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PlatformAdminUsagePage() {
  await requireSuperAdmin("/platform-admin/usage");

  const gyms = await db.gym.findMany({
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      members: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
      classes: {
        select: { id: true },
      },
      whatsAppNotifications: {
        select: { id: true },
      },
      usageRecords: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-indigo-400" />
            <span>Platform Usage & Quota Consumption</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of active members, scheduled classes, and messaging volume per tenant.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-semibold">Gym Tenant</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Tier Plan</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Active Members / Quota</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Scheduled Classes</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">WhatsApp Messages</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Capacity Status</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gyms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  No gyms found on the platform.
                </TableCell>
              </TableRow>
            ) : (
              gyms.map((g) => {
                const sub = g.subscription;
                const activeCount = g.members.length;
                const maxQuota = sub?.maxMembersOverride ?? sub?.plan.maxMembers ?? null;
                const pct = maxQuota ? Math.round((activeCount / maxQuota) * 100) : 0;
                const isNearLimit = maxQuota ? pct >= 90 : false;
                const isOverLimit = maxQuota ? activeCount > maxQuota : false;

                return (
                  <TableRow key={g.id} className="border-slate-800/60 hover:bg-slate-900/40">
                    <TableCell className="font-medium text-xs text-white">
                      <div className="font-bold">{g.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">/{g.slug}</div>
                    </TableCell>
                    <TableCell>
                      {sub?.plan ? (
                        <Badge variant="outline" className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px]">
                          {sub.plan.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{activeCount}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{maxQuota ? maxQuota : "Unlimited"}</span>
                        {maxQuota && (
                          <span className="text-[10px] text-slate-500 font-mono">({pct}%)</span>
                        )}
                      </div>
                      {maxQuota && (
                        <div className="w-28 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverLimit
                                ? "bg-rose-500"
                                : isNearLimit
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-bold">
                      {g.classes.length}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-bold">
                      {g.whatsAppNotifications.length}
                    </TableCell>
                    <TableCell>
                      {isOverLimit ? (
                        <Badge variant="outline" className="bg-rose-950 text-rose-300 border-rose-800 text-[10px] gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>EXCEEDED QUOTA</span>
                        </Badge>
                      ) : isNearLimit ? (
                        <Badge variant="outline" className="bg-amber-950 text-amber-300 border-amber-800 text-[10px]">
                          NEAR LIMIT ({pct}%)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]">
                          HEALTHY
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/platform-admin/gyms/${g.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
