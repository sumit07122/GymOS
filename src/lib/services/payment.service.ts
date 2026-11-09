/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
  assertTenantOwnership,
} from "@/lib/tenant/context";
import {
  Invoice,
  Payment,
  PaymentAllocation,
  AdjustmentOrRefund,
  InvoiceStatus,
  PaymentStatus,
  AdjustmentType,
} from "@prisma/client";
import {
  InvoiceCreateInput,
  PaymentRecordInput,
  RefundCreateInput,
  AdjustmentCreateInput,
  InvoiceVoidInput,
  InvoiceFilterParams,
  PaymentFilterParams,
} from "@/lib/validations/payment";

// ==============================================================================
// FIXIA GymOS — Financial Domain Errors
// ==============================================================================

export class InvoiceNotFoundError extends Error {
  constructor(id: string) {
    super(`Invoice "${id}" not found or does not belong to this gym.`);
    this.name = "InvoiceNotFoundError";
  }
}

export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment "${id}" not found or does not belong to this gym.`);
    this.name = "PaymentNotFoundError";
  }
}

export class DuplicatePaymentError extends Error {
  constructor(message = "Duplicate payment submission detected. Please verify transaction reference.") {
    super(message);
    this.name = "DuplicatePaymentError";
  }
}

export class ExcessiveAllocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExcessiveAllocationError";
  }
}

export class RefundExceededError extends Error {
  constructor(message = "Refund amount exceeds remaining refundable payment balance.") {
    super(message);
    this.name = "RefundExceededError";
  }
}

export class InvalidFinancialStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFinancialStateError";
  }
}

// ==============================================================================
// 1. UNIQUE IDENTIFIER GENERATORS
// ==============================================================================

export async function generateUniqueInvoiceNumber(gymId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count({ where: { gymId } });

  let counter = count + 1;
  let candidate = `INV-${year}-${String(counter).padStart(4, "0")}`;

  let exists = await db.invoice.findUnique({
    where: { gymId_invoiceNumber: { gymId, invoiceNumber: candidate } },
    select: { id: true },
  });

  while (exists) {
    counter++;
    candidate = `INV-${year}-${String(counter).padStart(4, "0")}`;
    exists = await db.invoice.findUnique({
      where: { gymId_invoiceNumber: { gymId, invoiceNumber: candidate } },
      select: { id: true },
    });
  }

  return candidate;
}

export async function generateUniquePaymentNumber(gymId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.payment.count({ where: { gymId } });

  let counter = count + 1;
  let candidate = `PAY-${year}-${String(counter).padStart(4, "0")}`;

  let exists = await db.payment.findUnique({
    where: { gymId_paymentNumber: { gymId, paymentNumber: candidate } },
    select: { id: true },
  });

  while (exists) {
    counter++;
    candidate = `PAY-${year}-${String(counter).padStart(4, "0")}`;
    exists = await db.payment.findUnique({
      where: { gymId_paymentNumber: { gymId, paymentNumber: candidate } },
      select: { id: true },
    });
  }

  return candidate;
}

// ==============================================================================
// 2. INVOICE CREATION & LIFECYCLE
// ==============================================================================

/**
 * Creates a new formal billing invoice for a member.
 */
export async function createInvoice(
  ctx: TenantContext,
  input: InvoiceCreateInput
): Promise<Invoice> {
  assertPermission(ctx, "INVOICE_CREATE");

  const member = await db.member.findUnique({
    where: { id: input.memberId },
    select: { id: true, gymId: true },
  });

  if (!member) {
    throw new Error("Target member not found in this gym workspace.");
  }
  assertTenantOwnership(ctx, member.gymId);

  if (input.membershipId) {
    const membership = await db.membership.findUnique({
      where: { id: input.membershipId },
      select: { id: true, gymId: true, memberId: true },
    });

    if (!membership) {
      throw new Error("Specified membership not found.");
    }
    assertTenantOwnership(ctx, membership.gymId);
    if (membership.memberId !== input.memberId) {
      throw new Error("Specified membership does not belong to this member in this gym.");
    }
  }

  const subtotal = Number(input.subtotal);
  const taxAmount = Number(input.taxAmount || 0);
  const totalAmount = subtotal + taxAmount;
  const dueAmount = totalAmount;
  const dueDate = input.dueDate
    ? new Date(input.dueDate)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invoiceNumber = await generateUniqueInvoiceNumber(ctx.gymId);

  return await db.invoice.create({
    data: {
      gymId: ctx.gymId,
      memberId: input.memberId,
      membershipId: input.membershipId || null,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      dueAmount,
      dueDate,
      status: InvoiceStatus.ISSUED,
      notes: input.notes || null,
    },
  });
}

// ==============================================================================
// 3. PAYMENT RECORDING & ALLOCATION
// ==============================================================================

export type RecordedPaymentResult = Payment & {
  payment: Payment;
  allocations: PaymentAllocation[];
  allocatedTotal: number;
  unallocatedAmount: number;
};

/**
 * Records a payment received (Cash, UPI, Card, Transfer), verifies idempotency,
 * and allocates funds to invoices within an atomic database transaction.
 * NEVER sets isGatewayVerified = true for manual entries.
 */
export async function recordPayment(
  ctx: TenantContext,
  input: PaymentRecordInput
): Promise<RecordedPaymentResult> {
  assertPermission(ctx, "PAYMENT_RECORD");

  const member = await db.member.findUnique({
    where: { id: input.memberId },
    select: { id: true, gymId: true, firstName: true, lastName: true },
  });

  if (!member) {
    throw new Error("Target member not found in this gym workspace.");
  }
  assertTenantOwnership(ctx, member.gymId);

  const paymentAmount = Number(input.amount);
  const receivedAt = input.receivedAt ? new Date(input.receivedAt) : new Date();

  // 1. Duplicate submission guard (Checks same member, amount, ref within 5 minutes)
  if (input.gatewayRef && input.gatewayRef.trim()) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingDuplicate = await db.payment.findFirst({
      where: {
        gymId: ctx.gymId,
        memberId: input.memberId,
        amount: paymentAmount,
        gatewayRef: input.gatewayRef.trim(),
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (existingDuplicate) {
      throw new DuplicatePaymentError(
        `A payment with reference "${input.gatewayRef}" and amount ${paymentAmount} was already recorded ${Math.round(
          (Date.now() - existingDuplicate.createdAt.getTime()) / 1000
        )}s ago.`
      );
    }
  }

  const paymentNumber = await generateUniquePaymentNumber(ctx.gymId);

  return await db.$transaction(async (tx) => {
    // 2. Persist Payment ledger entry
    const payment = await tx.payment.create({
      data: {
        gymId: ctx.gymId,
        memberId: input.memberId,
        paymentNumber,
        amount: paymentAmount,
        method: input.method,
        status: PaymentStatus.COMPLETED,
        isGatewayVerified: false, // Critical invariant: manual payments are NEVER gateway-verified
        gatewayRef: input.gatewayRef?.trim() || null,
        notes: input.notes?.trim() || null,
        receivedAt,
        recordedByStaffId: ctx.userId,
      },
    });

    let remainingToAllocate = paymentAmount;
    const createdAllocations: PaymentAllocation[] = [];

    // 3. Specific Invoice Allocation (if requested)
    if (input.invoiceId) {
      const targetInvoice = await tx.invoice.findUnique({
        where: { id: input.invoiceId },
      });

      if (!targetInvoice) {
        throw new InvoiceNotFoundError(input.invoiceId);
      }
      assertTenantOwnership(ctx, targetInvoice.gymId);

      if (
        targetInvoice.status === InvoiceStatus.PAID ||
        targetInvoice.status === InvoiceStatus.VOID
      ) {
        throw new InvalidFinancialStateError(
          `Cannot allocate payment to invoice "${targetInvoice.invoiceNumber}" with status "${targetInvoice.status}".`
        );
      }

      const invDue = Number(targetInvoice.dueAmount);
      const allocAmount = Math.min(remainingToAllocate, invDue);

      if (allocAmount > 0) {
        const allocation = await tx.paymentAllocation.create({
          data: {
            gymId: ctx.gymId,
            paymentId: payment.id,
            invoiceId: targetInvoice.id,
            allocatedAmount: allocAmount,
          },
        });
        createdAllocations.push(allocation);

        const newPaid = Number(targetInvoice.paidAmount) + allocAmount;
        const newDue = Math.max(0, Number(targetInvoice.totalAmount) - newPaid);
        const newStatus =
          newDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

        await tx.invoice.update({
          where: { id: targetInvoice.id },
          data: {
            paidAmount: newPaid,
            dueAmount: newDue,
            status: newStatus,
          },
        });

        remainingToAllocate -= allocAmount;
      }
    }

    // 4. Auto-FIFO Allocation to remaining open invoices (if enabled and funds remain)
    if (input.autoAllocate && remainingToAllocate > 0) {
      const openInvoices = await tx.invoice.findMany({
        where: {
          gymId: ctx.gymId,
          memberId: input.memberId,
          status: {
            in: [
              InvoiceStatus.ISSUED,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
          ...(input.invoiceId ? { id: { not: input.invoiceId } } : {}),
        },
        orderBy: { issueDate: "asc" }, // FIFO
      });

      for (const openInv of openInvoices) {
        if (remainingToAllocate <= 0) break;

        const invDue = Number(openInv.dueAmount);
        const allocAmount = Math.min(remainingToAllocate, invDue);

        if (allocAmount > 0) {
          const allocation = await tx.paymentAllocation.create({
            data: {
              gymId: ctx.gymId,
              paymentId: payment.id,
              invoiceId: openInv.id,
              allocatedAmount: allocAmount,
            },
          });
          createdAllocations.push(allocation);

          const newPaid = Number(openInv.paidAmount) + allocAmount;
          const newDue = Math.max(0, Number(openInv.totalAmount) - newPaid);
          const newStatus =
            newDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

          await tx.invoice.update({
            where: { id: openInv.id },
            data: {
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newStatus,
            },
          });

          remainingToAllocate -= allocAmount;
        }
      }
    }

    const allocatedTotal = paymentAmount - remainingToAllocate;

    return {
      ...payment,
      payment,
      allocations: createdAllocations,
      allocatedTotal,
      unallocatedAmount: remainingToAllocate,
    };
  });
}

// ==============================================================================
// 4. REFUND WORKFLOW
// ==============================================================================

/**
 * Processes a refund for an existing payment with manager audit record.
 */
export async function processRefund(
  ctx: TenantContext,
  input: RefundCreateInput
): Promise<AdjustmentOrRefund> {
  assertPermission(ctx, "REFUND_PROCESS");

  const payment = await db.payment.findUnique({
    where: { id: input.paymentId },
    include: {
      adjustments: { where: { type: AdjustmentType.REFUND } },
      allocations: { include: { invoice: true } },
    },
  });

  if (!payment) {
    throw new PaymentNotFoundError(input.paymentId);
  }
  assertTenantOwnership(ctx, payment.gymId);

  const refundAmount = Number(input.amount);
  const totalAlreadyRefunded = payment.adjustments.reduce(
    (acc, adj) => acc + Number(adj.amount),
    0
  );
  const maxRefundable = Number(payment.amount) - totalAlreadyRefunded;

  if (refundAmount > maxRefundable) {
    throw new RefundExceededError(
      `Cannot refund ${refundAmount}. Maximum refundable balance is ${maxRefundable}.`
    );
  }

  return await db.$transaction(async (tx) => {
    // 1. Persist Adjustment/Refund record
    const adjustment = await tx.adjustmentOrRefund.create({
      data: {
        gymId: ctx.gymId,
        paymentId: payment.id,
        invoiceId: input.invoiceId || payment.allocations[0]?.invoiceId || null,
        type: AdjustmentType.REFUND,
        amount: refundAmount,
        reason: input.reason,
        approvedByUserId: ctx.userId,
      },
    });

    // 2. Mark payment fully refunded if cumulative refunds equal total amount
    if (totalAlreadyRefunded + refundAmount >= Number(payment.amount)) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
    }

    // 3. Rebalance invoice if an invoice was attached to this payment
    const targetInvoiceId =
      input.invoiceId || payment.allocations[0]?.invoiceId;
    if (targetInvoiceId) {
      const inv = await tx.invoice.findUnique({
        where: { id: targetInvoiceId },
      });

      if (inv) {
        const newPaid = Math.max(0, Number(inv.paidAmount) - refundAmount);
        const newDue = Math.min(
          Number(inv.totalAmount),
          Number(inv.dueAmount) + refundAmount
        );
        const newStatus =
          newPaid <= 0 ? InvoiceStatus.ISSUED : InvoiceStatus.PARTIALLY_PAID;

        await tx.invoice.update({
          where: { id: targetInvoiceId },
          data: {
            paidAmount: newPaid,
            dueAmount: newDue,
            status: newStatus,
          },
        });
      }
    }

    return adjustment;
  });
}

// ==============================================================================
// 5. ADJUSTMENTS (DISCOUNT, CREDIT NOTE, WRITE-OFF)
// ==============================================================================

/**
 * Applies a financial adjustment (Credit Note, Discount, or Write-Off) to an invoice.
 */
export async function processAdjustment(
  ctx: TenantContext,
  input: AdjustmentCreateInput
): Promise<AdjustmentOrRefund> {
  assertPermission(ctx, "REFUND_PROCESS");

  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
  });

  if (!invoice) {
    throw new InvoiceNotFoundError(input.invoiceId);
  }
  assertTenantOwnership(ctx, invoice.gymId);

  const adjAmount = Number(input.amount);
  const invDue = Number(invoice.dueAmount);

  if (adjAmount > invDue) {
    throw new ExcessiveAllocationError(
      `Adjustment amount (${adjAmount}) exceeds invoice due amount (${invDue}).`
    );
  }

  return await db.$transaction(async (tx) => {
    const adjustment = await tx.adjustmentOrRefund.create({
      data: {
        gymId: ctx.gymId,
        invoiceId: invoice.id,
        type: input.type,
        amount: adjAmount,
        reason: input.reason,
        approvedByUserId: ctx.userId,
      },
    });

    const newDue = Math.max(0, invDue - adjAmount);
    let newStatus = invoice.status;

    if (newDue <= 0) {
      if (Number(invoice.paidAmount) > 0) {
        newStatus = InvoiceStatus.PAID;
      } else if (input.type === AdjustmentType.WRITE_OFF) {
        newStatus = InvoiceStatus.VOID;
      } else {
        newStatus = InvoiceStatus.PAID;
      }
    }

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        dueAmount: newDue,
        status: newStatus,
      },
    });

    return adjustment;
  });
}

// ==============================================================================
// 6. VOID INVOICE
// ==============================================================================

/**
 * Voids an unpaid invoice with reason audit.
 * Enforces that invoices with allocated payments cannot be silently voided.
 */
export async function voidInvoice(
  ctx: TenantContext,
  inputOrId: InvoiceVoidInput | string,
  maybeReason?: string
): Promise<Invoice> {
  assertPermission(ctx, "INVOICE_VOID");

  const invoiceId = typeof inputOrId === "string" ? inputOrId : inputOrId.invoiceId;
  const reason = typeof inputOrId === "string" ? maybeReason || "" : inputOrId.reason;

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new InvoiceNotFoundError(invoiceId);
  }
  assertTenantOwnership(ctx, invoice.gymId);

  if (Number(invoice.paidAmount) > 0) {
    throw new InvalidFinancialStateError(
      `Cannot void invoice "${invoice.invoiceNumber}" because it has ${invoice.paidAmount} in allocated payments. Reverse payments first.`
    );
  }

  return await db.$transaction(async (tx) => {
    await tx.adjustmentOrRefund.create({
      data: {
        gymId: ctx.gymId,
        invoiceId: invoice.id,
        type: AdjustmentType.WRITE_OFF,
        amount: Number(invoice.dueAmount),
        reason: `Invoice Voided: ${reason}`,
        approvedByUserId: ctx.userId,
      },
    });

    return await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.VOID,
        dueAmount: 0,
      },
    });
  });
}

// ==============================================================================
// 7. FINANCIAL REPORTING & AGGREGATE LEDGER
// ==============================================================================

export interface FinancialOverviewMetrics {
  totalInvoiced: number;
  grossPayments: number;
  totalRefunds: number;
  netRevenue: number;
  outstandingDues: number;
  totalOutstandingDues: number;
  overdueInvoicesCount: number;
  paymentMethodBreakdown: Record<string, number>;
  methodBreakdown: {
    cash: number;
    upi: number;
    card: number;
    bankTransfer: number;
    other: number;
  };
}

export type FinancialOverview = FinancialOverviewMetrics;

/**
 * Aggregates complete double-entry-style financial metrics for the tenant gym.
 */
export async function getFinancialOverview(
  ctx: TenantContext
): Promise<FinancialOverviewMetrics> {
  assertPermission(ctx, "PAYMENT_READ");

  const gymId = ctx.gymId;
  const now = new Date();

  const [
    invoicesAgg,
    duesAgg,
    overdueCount,
    paymentsAgg,
    refundsAgg,
    methodsData,
  ] = await Promise.all([
    // Total invoiced
    db.invoice.aggregate({
      where: { gymId, status: { not: InvoiceStatus.VOID } },
      _sum: { totalAmount: true },
    }),
    // Outstanding dues
    db.invoice.aggregate({
      where: {
        gymId,
        status: {
          in: [
            InvoiceStatus.ISSUED,
            InvoiceStatus.PARTIALLY_PAID,
            InvoiceStatus.OVERDUE,
          ],
        },
      },
      _sum: { dueAmount: true },
    }),
    // Overdue count
    db.invoice.count({
      where: {
        gymId,
        dueDate: { lt: now },
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
      },
    }),
    // Gross payments
    db.payment.aggregate({
      where: { gymId, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),
    // Total refunds
    db.adjustmentOrRefund.aggregate({
      where: { gymId, type: AdjustmentType.REFUND },
      _sum: { amount: true },
    }),
    // Method breakdown
    db.payment.groupBy({
      by: ["method"],
      where: { gymId, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),
  ]);

  const totalInvoiced = Number(invoicesAgg._sum.totalAmount || 0);
  const grossPayments = Number(paymentsAgg._sum.amount || 0);
  const totalRefunds = Number(refundsAgg._sum.amount || 0);
  const netRevenue = grossPayments - totalRefunds;
  const totalOutstandingDues = Number(duesAgg._sum.dueAmount || 0);

  const methodBreakdown = {
    cash: 0,
    upi: 0,
    card: 0,
    bankTransfer: 0,
    other: 0,
  };

  const paymentMethodBreakdown: Record<string, number> = {
    UPI: 0,
    CASH: 0,
    CARD: 0,
    BANK_TRANSFER: 0,
    CHEQUE: 0,
  };

  methodsData.forEach((m) => {
    const amt = Number(m._sum.amount || 0);
    paymentMethodBreakdown[m.method] = (paymentMethodBreakdown[m.method] || 0) + amt;
    if (m.method === "CASH") methodBreakdown.cash = amt;
    else if (m.method === "UPI") methodBreakdown.upi = amt;
    else if (m.method === "CARD") methodBreakdown.card = amt;
    else if (m.method === "BANK_TRANSFER") methodBreakdown.bankTransfer = amt;
    else methodBreakdown.other += amt;
  });

  return {
    totalInvoiced,
    grossPayments,
    totalRefunds,
    netRevenue,
    outstandingDues: totalOutstandingDues,
    totalOutstandingDues,
    overdueInvoicesCount: overdueCount,
    paymentMethodBreakdown,
    methodBreakdown,
  };
}

/**
 * Returns filtered, paginated invoices list.
 */
export async function getInvoicesList(
  ctx: TenantContext,
  params: Partial<InvoiceFilterParams> = {}
) {
  assertPermission(ctx, "INVOICE_READ");

  const { status, memberId, search, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const where: any = { gymId: ctx.gymId };

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (memberId) {
    where.memberId = memberId;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { member: { firstName: { contains: q, mode: "insensitive" } } },
      { member: { lastName: { contains: q, mode: "insensitive" } } },
      { member: { memberCode: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      orderBy: { issueDate: "desc" },
      take: limit,
      skip: offset,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberCode: true,
            phone: true,
            email: true,
          },
        },
        membership: {
          select: {
            id: true,
            planNameSnapshot: true,
            plan: { select: { name: true } },
          },
        },
      },
    }),
    db.invoice.count({ where }),
  ]);

  return {
    invoices,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    limit,
  };
}

/**
 * Returns filtered, paginated payments list.
 */
export async function getPaymentsList(
  ctx: TenantContext,
  params: Partial<PaymentFilterParams> = {}
) {
  assertPermission(ctx, "PAYMENT_READ");

  const { method, memberId, search, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const where: any = { gymId: ctx.gymId };

  if (method && method !== "ALL") {
    where.method = method;
  }

  if (memberId) {
    where.memberId = memberId;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { paymentNumber: { contains: q, mode: "insensitive" } },
      { gatewayRef: { contains: q, mode: "insensitive" } },
      { member: { firstName: { contains: q, mode: "insensitive" } } },
      { member: { lastName: { contains: q, mode: "insensitive" } } },
      { member: { memberCode: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberCode: true,
            phone: true,
            email: true,
          },
        },
        recordedByStaff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        allocations: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                totalAmount: true,
              },
            },
          },
        },
      },
    }),
    db.payment.count({ where }),
  ]);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    limit,
  };
}

/**
 * Retrieves full printable invoice details including allocations and adjustments.
 */
export async function getInvoiceById(ctx: TenantContext, id: string) {
  assertPermission(ctx, "INVOICE_READ");

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      gym: true,
      member: true,
      membership: {
        include: { plan: true },
      },
      allocations: {
        include: { payment: true },
      },
      adjustments: {
        include: { approvedByUser: { select: { name: true, email: true } } },
      },
    },
  });

  if (!invoice || invoice.gymId !== ctx.gymId) {
    throw new InvoiceNotFoundError(id);
  }

  return invoice;
}

/**
 * Retrieves full printable payment receipt details.
 */
export async function getPaymentById(ctx: TenantContext, id: string) {
  assertPermission(ctx, "PAYMENT_READ");

  const payment = await db.payment.findUnique({
    where: { id },
    include: {
      gym: true,
      member: true,
      recordedByStaff: { select: { name: true, email: true } },
      allocations: {
        include: { invoice: true },
      },
      adjustments: true,
    },
  });

  if (!payment || payment.gymId !== ctx.gymId) {
    throw new PaymentNotFoundError(id);
  }

  return payment;
}
