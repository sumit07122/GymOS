import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSubscriptionAddons } from "@/lib/services/platform-admin.service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddonCreatorDialog } from "@/components/admin/addon-creator-dialog";
import { PageHeader } from "@/components/design-system/page-header";
import { StatusBadge } from "@/components/design-system/status-badge";

export default async function PlatformAdminAddonsPage() {
  const session = await requireSuperAdmin("/platform-admin/addons");
  const addons = await listSubscriptionAddons(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SaaS Add-on Catalog"
        description="Configure optional modular expansion packs (extra WhatsApp notification quotas, custom branding, storage)."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Add-ons" },
        ]}
        actions={<AddonCreatorDialog />}
      />

      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-canvas border-b border-line">
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted text-xs font-semibold">Add-on Name & Code</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Description</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Entitlement Key</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Monthly Price</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Annual Price</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted">
                  No subscription add-ons configured yet.
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => (
                <TableRow key={addon.id} className="border-line/60 hover:bg-canvas/50">
                  <TableCell className="font-medium text-xs text-ink">
                    <div className="font-bold text-ink">{addon.name}</div>
                    <div className="text-[10px] text-muted font-mono">{addon.code}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted max-w-xs truncate">
                    {addon.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-pine-soft text-pine border-pine/30 text-[10px] font-mono font-semibold">
                      {addon.featureKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-ink font-bold">
                    ₹{Number(addon.monthlyPrice).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs text-ink font-bold">
                    ₹{Number(addon.yearlyPrice).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={addon.isActive ? "ACTIVE" : "INACTIVE"} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
