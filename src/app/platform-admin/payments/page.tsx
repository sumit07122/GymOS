import * as React from "react";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listSubscriptionInvoices } from "@/lib/services/platform-admin.service";
import { Receipt, DollarSign, AlertCircle, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecordSubscriptionPaymentDialog } from "@/components/admin/record-subscription-payment-dialog";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";
import { StatusBadge } from "@/components/design-system/status-badge";

export default async function PlatformAdminPaymentsPage() {
  const session = await requireSuperAdmin("/platform-admin/payments");
  const invoices = await listSubscriptionInvoices(session.user.id);

  const totalCollected = invoices.reduce((acc, inv) => {
    const paid = inv.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0);
    return acc + paid;
  }, 0);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
  const pendingCount = invoices.filter((i) => i.status !== "PAID" && i.status !== "VOID").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="SaaS Payments & Platform Ledger"
        description="Track subscription invoices issued to gym owners, reconcile multi-tenant fee settlements, and record direct wire payments."
        breadcrumbs={[
          { label: "Overview", href: "/platform-admin" },
          { label: "Payments" },
        ]}
        actions={<RecordSubscriptionPaymentDialog invoices={invoices} />}
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Collected Revenue"
          value={`₹${totalCollected.toLocaleString("en-IN")}`}
          icon={DollarSign}
          trend={{ value: `${Math.round((totalCollected / (totalInvoiced || 1)) * 100)}% collected`, isPositive: true }}
          subtext="Reconciled SaaS income"
        />
        <StatCard
          label="Total Invoiced"
          value={`₹${totalInvoiced.toLocaleString("en-IN")}`}
          icon={Receipt}
          subtext={`${invoices.length} billing cycles`}
        />
        <StatCard
          label="Pending Collections"
          value={pendingCount}
          icon={AlertCircle}
          trend={pendingCount > 0 ? { value: "Action required", isPositive: false } : undefined}
          subtext="Awaiting verification"
        />
      </div>

      {/* Invoice Ledger Table */}
      <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-canvas border-b border-line">
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted text-xs font-semibold">Invoice #</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Gym Workspace</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Amount</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Due Date</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Payment Status</TableHead>
              <TableHead className="text-muted text-xs font-semibold">Settled Date</TableHead>
              <TableHead className="text-muted text-xs font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted">
                  No subscription invoices generated yet.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => {
                const totalPaid = inv.payments.reduce((acc, p) => acc + Number(p.amount), 0);

                return (
                  <TableRow key={inv.id} className="border-line/60 hover:bg-canvas/50">
                    <TableCell className="font-mono text-xs font-bold text-ink">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-ink">
                      <div className="font-bold text-ink">{inv.gym.name}</div>
                      <div className="text-[10px] text-muted font-mono">/{inv.gym.slug}</div>
                    </TableCell>
                    <TableCell className="text-xs text-ink font-bold">
                      ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                      {totalPaid > 0 && totalPaid < Number(inv.totalAmount) && (
                        <div className="text-[10px] text-pine font-normal">
                          Paid: ₹{totalPaid.toLocaleString("en-IN")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted">
                      {inv.paidAt ? (
                        <span className="text-pine font-medium">
                          {new Date(inv.paidAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/platform-admin/gyms/${inv.gymId}`}
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
