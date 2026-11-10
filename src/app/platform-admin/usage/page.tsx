import * as React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { ExternalLink, AlertTriangle, Users, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

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

  const totalMembers = gyms.reduce((acc, g) => acc + g.members.length, 0);
  const totalClasses = gyms.reduce((acc, g) => acc + g.classes.length, 0);
  const totalWhatsApp = gyms.reduce((acc, g) => acc + g.whatsAppNotifications.length, 0);

  const overQuotaCount = gyms.filter((g) => {
    const max = g.subscription?.maxMembersOverride ?? g.subscription?.plan?.maxMembers;
    if (max == null || max === -1) return false;
    return g.members.length > max;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Platform Usage & Quota Consumption"
        description="Real-time supervision of active members, scheduled classes, and automated WhatsApp notification consumption across all gym instances."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Usage" },
        ]}
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Platform Members"
          value={totalMembers.toLocaleString()}
          icon={Users}
          subtext="Enrolled across all gyms"
        />
        <StatCard
          label="Scheduled Classes"
          value={totalClasses}
          icon={Calendar}
          subtext="Group training sessions"
        />
        <StatCard
          label="WhatsApp Messages"
          value={totalWhatsApp}
          icon={MessageSquare}
          subtext="Dispatched alerts"
        />
        <StatCard
          label="Over-Quota Workspaces"
          value={overQuotaCount}
          icon={AlertTriangle}
          trend={overQuotaCount > 0 ? { value: "Exceeding limit", isPositive: false } : undefined}
          subtext="Review license tiers"
        />
      </div>

      {/* Usage Table */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-canvas border-b border-line">
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted text-xs font-semibold">Gym Workspace</TableHead>
              <TableHead className="text-muted text-xs font-semibold">SaaS Tier Plan</TableHead>
              <TableHead className="text-muted text-xs font-semibold min-w-[220px]">
                Member Quota Utilization
              </TableHead>
              <TableHead className="text-muted text-xs font-semibold">Classes</TableHead>
              <TableHead className="text-muted text-xs font-semibold">WhatsApp Alerts</TableHead>
              <TableHead className="text-muted text-xs font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gyms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted">
                  No gym workspaces found.
                </TableCell>
              </TableRow>
            ) : (
              gyms.map((gym) => {
                const sub = gym.subscription;
                const max = sub?.maxMembersOverride ?? sub?.plan?.maxMembers;
                const isUnlimited = max == null || max === -1;
                const count = gym.members.length;
                const pct = isUnlimited ? 0 : Math.round((count / (max || 1)) * 100);
                const isOver = !isUnlimited && count > max;

                return (
                  <TableRow key={gym.id} className="border-line/60 hover:bg-canvas/50">
                    <TableCell className="font-medium text-xs text-ink">
                      <div className="font-bold">{gym.name}</div>
                      <div className="text-[10px] text-muted font-mono">/{gym.slug}</div>
                    </TableCell>

                    <TableCell>
                      {sub?.plan ? (
                        <Badge variant="outline" className="bg-pine-soft text-pine border-pine/30 text-[10px] font-semibold">
                          {sub.plan.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted border-dashed">
                          No Plan
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-ink">
                            {count} <span className="text-muted font-normal">/ {isUnlimited ? "∞" : max}</span>
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isOver
                                ? "text-rose-600 font-bold"
                                : pct >= 80
                                ? "text-amber-700"
                                : "text-pine"
                            }`}
                          >
                            {isUnlimited ? "Unlimited" : `${pct}%`}
                          </span>
                        </div>

                        {!isUnlimited && (
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOver
                                  ? "bg-rose-600"
                                  : pct >= 80
                                  ? "bg-amber-500"
                                  : "bg-pine"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-ink font-semibold">
                      {gym.classes.length}
                    </TableCell>

                    <TableCell className="text-xs text-ink font-semibold">
                      {gym.whatsAppNotifications.length}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link
                        href={`/platform-admin/gyms/${gym.id}`}
                        className="inline-flex items-center gap-1 text-xs text-pine font-semibold hover:underline"
                      >
                        <span>Workspace</span>
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
