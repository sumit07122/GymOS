import * as React from "react";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSubscriptionAddons } from "@/lib/services/platform-admin.service";
import { Layers } from "lucide-react";
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

export default async function PlatformAdminAddonsPage() {
  const session = await requireSuperAdmin("/platform-admin/addons");
  const addons = await listSubscriptionAddons(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-400" />
            <span>SaaS Add-on Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modular add-ons (extra WhatsApp messaging quota, dedicated storage, additional staff licenses).
          </p>
        </div>

        <AddonCreatorDialog />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/80 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-semibold">Add-on Name & Code</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Description</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Entitlement Key</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Monthly Price</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Annual Price</TableHead>
              <TableHead className="text-slate-400 text-xs font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-500">
                  No subscription add-ons configured yet.
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => (
                <TableRow key={addon.id} className="border-slate-800/60 hover:bg-slate-900/40">
                  <TableCell className="font-medium text-xs text-white">
                    <div className="font-bold">{addon.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{addon.code}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 max-w-xs truncate">
                    {addon.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px] font-mono">
                      {addon.featureKey}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-white font-bold">
                    ₹{Number(addon.monthlyPrice).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs text-white font-bold">
                    ₹{Number(addon.yearlyPrice).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        addon.isActive
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]"
                          : "bg-slate-800 text-slate-400 text-[10px]"
                      }
                    >
                      {addon.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
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
