import { db } from "@/lib/db";
import {
  TenantContext,
  assertTenantOwnership,
  assertPermission,
  TenantAccessViolationError,
} from "@/lib/tenant/context";
import { Invoice, InvoiceStatus, Prisma } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Tenant-Scoped Invoice Repository
// ==============================================================================
// Enforces tenant isolation and member boundary access controls.
// ==============================================================================

export interface CreateInvoiceData {
  memberId: string;
  membershipId?: string;
  invoiceNumber: string;
  issueDate?: Date;
  dueDate: Date;
  subtotal: number | Prisma.Decimal;
  taxAmount?: number | Prisma.Decimal;
  totalAmount: number | Prisma.Decimal;
  notes?: string;
}

export const invoiceRepository = {
  /**
   * Retrieves an invoice by ID.
   * Enforces gym tenant scoping AND member boundary protection.
   */
  async findById(ctx: TenantContext, id: string): Promise<Invoice | null> {
    assertPermission(ctx, "INVOICE_READ");

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });

    if (!invoice) {
      return null;
    }

    // 1. Enforce Gym tenant ownership
    assertTenantOwnership(ctx, invoice.gymId);

    // 2. Enforce Member Boundary: Members can only access their own invoices
    if (ctx.role === "MEMBER") {
      if (invoice.member.userId !== ctx.userId) {
        throw new TenantAccessViolationError(
          `member-invoice:${invoice.memberId}`,
          `user-member:${ctx.userId}`
        );
      }
    }

    return invoice;
  },

  /**
   * Lists invoices within the authorized tenant.
   */
  async findMany(
    ctx: TenantContext,
    options: {
      memberId?: string;
      status?: InvoiceStatus;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Invoice[]> {
    assertPermission(ctx, "INVOICE_READ");

    const { memberId, status, limit = 50, offset = 0 } = options;

    // If role is MEMBER, force memberId to their linked record
    let effectiveMemberId = memberId;
    if (ctx.role === "MEMBER") {
      const linkedMember = await db.member.findFirst({
        where: { gymId: ctx.gymId, userId: ctx.userId },
      });
      effectiveMemberId = linkedMember ? linkedMember.id : "NO_MEMBER_RECORD";
    }

    return db.invoice.findMany({
      where: {
        gymId: ctx.gymId,
        ...(effectiveMemberId ? { memberId: effectiveMemberId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { issueDate: "desc" },
      take: limit,
      skip: offset,
    });
  },

  /**
   * Creates an invoice strictly within the authorized tenant.
   */
  async create(ctx: TenantContext, data: CreateInvoiceData): Promise<Invoice> {
    assertPermission(ctx, "INVOICE_CREATE");

    // Verify member belongs to this gym
    const member = await db.member.findUnique({
      where: { id: data.memberId },
    });
    if (!member) {
      throw new Error(`Member with ID "${data.memberId}" does not exist.`);
    }
    assertTenantOwnership(ctx, member.gymId);

    const subtotal = new Prisma.Decimal(data.subtotal.toString());
    const taxAmount = new Prisma.Decimal((data.taxAmount || 0).toString());
    const totalAmount = new Prisma.Decimal(data.totalAmount.toString());

    return db.invoice.create({
      data: {
        gymId: ctx.gymId,
        memberId: data.memberId,
        membershipId: data.membershipId,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        subtotal,
        taxAmount,
        totalAmount,
        dueAmount: totalAmount,
        status: InvoiceStatus.ISSUED,
        notes: data.notes,
      },
    });
  },
};

