/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/resolver";
import {
  getFinancialOverview,
  getInvoicesList,
  getPaymentsList,
} from "@/lib/services/payment.service";
import { db } from "@/lib/db";
import { PaymentsHub } from "@/components/payments/payments-hub";
import { Loader2 } from "lucide-react";
import { GymRole, SystemRole } from "@prisma/client";

interface PaymentsPageProps {
  params: Promise<{ gymSlug: string }>;
}

function PaymentsSkeleton() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading financial ledger, billing records, and dues...</span>
      </div>
    </div>
  );
}

async function PaymentsContent({ params }: PaymentsPageProps) {
  const { gymSlug } = await params;
  const ctx = await resolveTenantContext(gymSlug);

  const [gym, overview, invoicesResult, paymentsResult, membersRaw] =
    await Promise.all([
      db.gym.findUnique({
        where: { id: ctx.gymId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          addressLine1: true,
          city: true,
          state: true,
          currency: true,
        },
      }),
      getFinancialOverview(ctx),
      getInvoicesList(ctx, { limit: 100 }),
      getPaymentsList(ctx, { limit: 100 }),
      db.member.findMany({
        where: {
          gymId: ctx.gymId,
          status: { not: "ARCHIVED" },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberCode: true,
          email: true,
          phone: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

  const isOwner =
    ctx.role === GymRole.OWNER || ctx.role === SystemRole.SUPER_ADMIN;

  const members = membersRaw.map((m) => ({
    id: m.id,
    fullName: `${m.firstName} ${m.lastName}`.trim(),
    memberNumber: m.memberCode,
    email: m.email,
    phone: m.phone,
  }));

  const gymAddress =
    [gym?.addressLine1, gym?.city, gym?.state].filter(Boolean).join(", ") || null;

  const serializableInvoices = invoicesResult.invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    memberId: inv.memberId,
    membershipId: inv.membershipId,
    subtotal: Number(inv.subtotal),
    taxAmount: Number(inv.taxAmount),
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    dueAmount: Number(inv.dueAmount),
    status: inv.status,
    notes: inv.notes,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    member: {
      id: inv.member.id,
      fullName: `${inv.member.firstName} ${inv.member.lastName}`.trim(),
      memberNumber: inv.member.memberCode,
      email: inv.member.email,
      phone: inv.member.phone,
    },
    gym: {
      name: gym?.name || "Fitness Hub",
      email: gym?.email || null,
      phone: gym?.phone || null,
      address: gymAddress,
      currency: gym?.currency || "INR",
    },
  }));

  const serializablePayments = paymentsResult.payments.map((pay) => ({
    id: pay.id,
    paymentNumber: pay.paymentNumber,
    memberId: pay.memberId,
    amount: Number(pay.amount),
    method: pay.method,
    gatewayRef: pay.gatewayRef,
    status: pay.status,
    isGatewayVerified: pay.isGatewayVerified,
    notes: pay.notes,
    receivedAt: pay.receivedAt.toISOString(),
    createdAt: pay.createdAt.toISOString(),
    member: {
      id: pay.member.id,
      fullName: `${pay.member.firstName} ${pay.member.lastName}`.trim(),
      memberNumber: pay.member.memberCode,
      email: pay.member.email,
      phone: pay.member.phone,
    },
    gym: {
      name: gym?.name || "Fitness Hub",
      email: gym?.email || null,
      phone: gym?.phone || null,
      address: gymAddress,
    },
    recordedByStaff: pay.recordedByStaff
      ? {
          name: pay.recordedByStaff.name,
          email: pay.recordedByStaff.email,
        }
      : null,
    allocations: pay.allocations?.map((a: any) => ({
      id: a.id,
      amount: Number(a.amount),
      invoice: {
        id: a.invoice.id,
        invoiceNumber: a.invoice.invoiceNumber,
        totalAmount: Number(a.invoice.totalAmount),
        dueAmount: Number(a.invoice.dueAmount || 0),
        status: a.invoice.status,
      },
    })),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PaymentsHub
        gymId={ctx.gymId}
        gymSlug={gymSlug}
        isOwner={isOwner}
        overview={overview}
        invoices={serializableInvoices}
        payments={serializablePayments}
        members={members}
      />
    </div>
  );
}

export default function PaymentsPage(props: PaymentsPageProps) {
  return (
    <Suspense fallback={<PaymentsSkeleton />}>
      <PaymentsContent {...props} />
    </Suspense>
  );
}
