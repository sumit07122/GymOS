/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateUniqueInvoiceNumber,
  generateUniquePaymentNumber,
  createInvoice,
  recordPayment,
  processRefund,
  processAdjustment,
  voidInvoice,
  getFinancialOverview,
  DuplicatePaymentError,
  RefundExceededError,
  InvalidFinancialStateError,
} from "@/lib/services/payment.service";
import { createTenantContext, TenantAccessViolationError } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import {
  GymRole,
  PaymentMethod,
  InvoiceStatus,
  PaymentStatus,
  AdjustmentType,
} from "@prisma/client";

describe("Milestone M09: Financial Management, Invoices, Payments & Dues", () => {
  const gymAId = "gym-alpha-111";
  const gymBId = "gym-beta-222";

  const ownerAContext = createTenantContext({
    gymId: gymAId,
    userId: "owner-alpha",
    role: GymRole.OWNER,
  });

  const staffAContext = createTenantContext({
    gymId: gymAId,
    userId: "staff-alpha",
    role: GymRole.STAFF,
  });

  const trainerAContext = createTenantContext({
    gymId: gymAId,
    userId: "trainer-alpha",
    role: GymRole.TRAINER,
  });

  const memberAContext = createTenantContext({
    gymId: gymAId,
    userId: "member-alpha",
    role: GymRole.MEMBER,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. UNIQUE IDENTIFIERS & SEQUENCING
  // ============================================================================
  describe("Unique Identifier Sequencing", () => {
    it("generates collision-resistant invoice numbers in INV-YYYY-XXXX format", async () => {
      vi.spyOn(db.invoice, "count").mockResolvedValue(42);
      vi.spyOn(db.invoice, "findUnique").mockResolvedValue(null);

      const year = new Date().getFullYear();
      const invoiceNumber = await generateUniqueInvoiceNumber(gymAId);

      expect(invoiceNumber).toBe(`INV-${year}-0043`);
    });

    it("increments sequential counter when collision occurs", async () => {
      vi.spyOn(db.invoice, "count").mockResolvedValue(10);
      vi.spyOn(db.invoice, "findUnique")
        .mockResolvedValueOnce({ id: "existing-inv" } as any)
        .mockResolvedValueOnce(null);

      const year = new Date().getFullYear();
      const invoiceNumber = await generateUniqueInvoiceNumber(gymAId);

      expect(invoiceNumber).toBe(`INV-${year}-0012`);
    });

    it("generates collision-resistant payment receipt numbers in PAY-YYYY-XXXX format", async () => {
      vi.spyOn(db.payment, "count").mockResolvedValue(5);
      vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);

      const year = new Date().getFullYear();
      const paymentNumber = await generateUniquePaymentNumber(gymAId);

      expect(paymentNumber).toBe(`PAY-${year}-0006`);
    });
  });

  // ============================================================================
  // 2. INVOICE CREATION & SEPARATE ENTITY INTEGRITY
  // ============================================================================
  describe("Invoice Creation & Ledger Integrity", () => {
    it("creates an invoice with subtotal, tax and initial due balance equal to total", async () => {
      const mockMember = { id: "mem-101", gymId: gymAId };
      vi.spyOn(db.member, "findUnique").mockResolvedValue(mockMember as any);
      vi.spyOn(db.invoice, "count").mockResolvedValue(0);
      vi.spyOn(db.invoice, "findUnique").mockResolvedValue(null);

      let createdInvoiceRecord: any = null;
      vi.spyOn(db.invoice as any, "create").mockImplementation((args: any) => {
        createdInvoiceRecord = {
          id: "inv-test-1",
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return Promise.resolve(createdInvoiceRecord);
      });

      const invoice = await createInvoice(staffAContext, {
        memberId: "mem-101",
        subtotal: 5000,
        taxAmount: 900,
        dueDate: "2026-12-01",
        notes: "Quarterly Pro Tier Membership",
      });

      expect(invoice.totalAmount).toBe(5900);
      expect(invoice.dueAmount).toBe(5900);
      expect(invoice.paidAmount).toBe(0);
      expect(invoice.status).toBe(InvoiceStatus.ISSUED);
      expect(invoice.gymId).toBe(gymAId);
      expect(createdInvoiceRecord.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    });

    it("strictly prevents creating invoice for a member belonging to another gym", async () => {
      // Member belongs to gymBId, but request context is gymAId
      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-foreign",
        gymId: gymBId,
      } as any);

      await expect(
        createInvoice(staffAContext, {
          memberId: "mem-foreign",
          subtotal: 1000,
          taxAmount: 0,
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });
  });

  // ============================================================================
  // 3. PAYMENT RECORDING & ALLOCATION WORKFLOWS
  // ============================================================================
  describe("Payment Recording & Allocations", () => {
    it("settles an invoice in full and sets status to PAID with dueAmount = 0", async () => {
      const mockMember = { id: "mem-101", gymId: gymAId };
      vi.spyOn(db.member, "findUnique").mockResolvedValue(mockMember as any);
      vi.spyOn(db.payment, "findFirst").mockResolvedValue(null); // No duplicate
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);

      const targetInvoice = {
        id: "inv-100",
        gymId: gymAId,
        memberId: "mem-101",
        invoiceNumber: "INV-2026-0001",
        totalAmount: 3000,
        paidAmount: 0,
        dueAmount: 3000,
        status: InvoiceStatus.ISSUED,
      };

      let createdPayment: any = null;
      let createdAllocation: any = null;
      let updatedInvoice: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          payment: {
            create: vi.fn().mockImplementation((args: any) => {
              createdPayment = {
                id: "pay-100",
                ...args.data,
                receivedAt: new Date(),
                allocations: [],
              };
              return Promise.resolve(createdPayment);
            }),
          },
          invoice: {
            findUnique: vi.fn().mockResolvedValue(targetInvoice),
            update: vi.fn().mockImplementation((args: any) => {
              updatedInvoice = { ...targetInvoice, ...args.data };
              return Promise.resolve(updatedInvoice);
            }),
          },
          paymentAllocation: {
            create: vi.fn().mockImplementation((args: any) => {
              createdAllocation = { id: "alloc-1", ...args.data };
              return Promise.resolve(createdAllocation);
            }),
          },
        };
        return callback(txMock);
      });

      const payment = await recordPayment(staffAContext, {
        memberId: "mem-101",
        amount: 3000,
        method: PaymentMethod.UPI,
        gatewayRef: "UPI-TXN-987654",
        invoiceId: "inv-100",
      });

      expect(payment.amount).toBe(3000);
      expect(payment.isGatewayVerified).toBe(false); // Manual entry invariant
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
      expect(createdAllocation.allocatedAmount).toBe(3000);
      expect(updatedInvoice.paidAmount).toBe(3000);
      expect(updatedInvoice.dueAmount).toBe(0);
      expect(updatedInvoice.status).toBe(InvoiceStatus.PAID);
    });

    it("processes partial payment and transitions invoice to PARTIALLY_PAID", async () => {
      const mockMember = { id: "mem-101", gymId: gymAId };
      vi.spyOn(db.member, "findUnique").mockResolvedValue(mockMember as any);
      vi.spyOn(db.payment, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);

      const targetInvoice = {
        id: "inv-200",
        gymId: gymAId,
        memberId: "mem-101",
        totalAmount: 10000,
        paidAmount: 0,
        dueAmount: 10000,
        status: InvoiceStatus.ISSUED,
      };

      let updatedInvoice: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          payment: {
            create: vi.fn().mockResolvedValue({
              id: "pay-200",
              amount: 4000,
              gymId: gymAId,
              memberId: "mem-101",
              method: PaymentMethod.CASH,
              status: PaymentStatus.COMPLETED,
              isGatewayVerified: false,
              receivedAt: new Date(),
              allocations: [],
            }),
          },
          invoice: {
            findUnique: vi.fn().mockResolvedValue(targetInvoice),
            update: vi.fn().mockImplementation((args: any) => {
              updatedInvoice = { ...targetInvoice, ...args.data };
              return Promise.resolve(updatedInvoice);
            }),
          },
          paymentAllocation: {
            create: vi.fn().mockResolvedValue({ id: "alloc-2", amount: 4000 }),
          },
        };
        return callback(txMock);
      });

      await recordPayment(staffAContext, {
        memberId: "mem-101",
        amount: 4000,
        method: PaymentMethod.CASH,
        invoiceId: "inv-200",
      });

      expect(updatedInvoice.paidAmount).toBe(4000);
      expect(updatedInvoice.dueAmount).toBe(6000);
      expect(updatedInvoice.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    });

    it("auto-allocates funds across multiple open invoices FIFO", async () => {
      const mockMember = { id: "mem-101", gymId: gymAId };
      vi.spyOn(db.member, "findUnique").mockResolvedValue(mockMember as any);
      vi.spyOn(db.payment, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);

      const openInvoices = [
        {
          id: "inv-oldest",
          gymId: gymAId,
          memberId: "mem-101",
          totalAmount: 2000,
          paidAmount: 0,
          dueAmount: 2000,
          issueDate: new Date("2026-01-01"),
          status: InvoiceStatus.ISSUED,
        },
        {
          id: "inv-newer",
          gymId: gymAId,
          memberId: "mem-101",
          totalAmount: 3000,
          paidAmount: 0,
          dueAmount: 3000,
          issueDate: new Date("2026-02-01"),
          status: InvoiceStatus.ISSUED,
        },
      ];

      const allocationsCreated: any[] = [];
      const invoicesUpdated: any[] = [];

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          payment: {
            create: vi.fn().mockResolvedValue({
              id: "pay-multi",
              amount: 3500,
              gymId: gymAId,
              memberId: "mem-101",
              method: PaymentMethod.BANK_TRANSFER,
              status: PaymentStatus.COMPLETED,
              isGatewayVerified: false,
              receivedAt: new Date(),
              allocations: [],
            }),
          },
          invoice: {
            findMany: vi.fn().mockResolvedValue(openInvoices),
            update: vi.fn().mockImplementation((args: any) => {
              invoicesUpdated.push(args);
              return Promise.resolve(args);
            }),
          },
          paymentAllocation: {
            create: vi.fn().mockImplementation((args: any) => {
              allocationsCreated.push(args.data);
              return Promise.resolve({ id: `alloc-${allocationsCreated.length}`, ...args.data });
            }),
          },
        };
        return callback(txMock);
      });

      // Member pays 3500 without specifying invoice -> FIFO applies
      await recordPayment(staffAContext, {
        memberId: "mem-101",
        amount: 3500,
        method: PaymentMethod.BANK_TRANSFER,
        autoAllocate: true,
      });

      expect(allocationsCreated).toHaveLength(2);
      // First invoice should receive 2000 (cleared in full)
      expect(allocationsCreated[0].invoiceId).toBe("inv-oldest");
      expect(allocationsCreated[0].allocatedAmount).toBe(2000);
      // Second invoice should receive remaining 1500
      expect(allocationsCreated[1].invoiceId).toBe("inv-newer");
      expect(allocationsCreated[1].allocatedAmount).toBe(1500);

      // Verify status transitions
      expect(invoicesUpdated[0].data.status).toBe(InvoiceStatus.PAID);
      expect(invoicesUpdated[0].data.dueAmount).toBe(0);

      expect(invoicesUpdated[1].data.status).toBe(InvoiceStatus.PARTIALLY_PAID);
      expect(invoicesUpdated[1].data.dueAmount).toBe(1500);
    });

    it("rejects duplicate payment submission within 5-minute window", async () => {
      const mockMember = { id: "mem-101", gymId: gymAId };
      vi.spyOn(db.member, "findUnique").mockResolvedValue(mockMember as any);

      // Simulate identical recent payment in DB
      vi.spyOn(db.payment, "findFirst").mockResolvedValue({
        id: "pay-existing",
        paymentNumber: "PAY-2026-0001",
        createdAt: new Date(),
      } as any);

      await expect(
        recordPayment(staffAContext, {
          memberId: "mem-101",
          amount: 2500,
          method: PaymentMethod.UPI,
          gatewayRef: "DUPLICATE-REF-123",
        })
      ).rejects.toThrow(DuplicatePaymentError);
    });
  });

  // ============================================================================
  // 4. AUDITED REFUNDS & REVERSALS
  // ============================================================================
  describe("Refund Workflow & Reversals", () => {
    it("processes partial refund, creates audit record, and recalculates invoice dues", async () => {
      const existingPayment = {
        id: "pay-100",
        gymId: gymAId,
        memberId: "mem-101",
        paymentNumber: "PAY-2026-0010",
        amount: 5000,
        status: PaymentStatus.COMPLETED,
        adjustments: [], // No prior refunds
        allocations: [
          {
            id: "alloc-1",
            amount: 5000,
            invoiceId: "inv-100",
            invoice: {
              id: "inv-100",
              totalAmount: 5000,
              paidAmount: 5000,
              dueAmount: 0,
              status: InvoiceStatus.PAID,
            },
          },
        ],
      };

      vi.spyOn(db.payment, "findUnique").mockResolvedValue(existingPayment as any);

      let createdRefundRecord: any = null;
      let updatedInvoiceRecord: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          adjustmentOrRefund: {
            create: vi.fn().mockImplementation((args: any) => {
              createdRefundRecord = { id: "adj-1", ...args.data };
              return Promise.resolve(createdRefundRecord);
            }),
          },
          payment: {
            update: vi.fn().mockResolvedValue({}),
          },
          paymentAllocation: {
            update: vi.fn().mockResolvedValue({}),
          },
          invoice: {
            findUnique: vi.fn().mockResolvedValue(existingPayment.allocations[0].invoice),
            update: vi.fn().mockImplementation((args: any) => {
              updatedInvoiceRecord = args;
              return Promise.resolve(args);
            }),
          },
        };
        return callback(txMock);
      });

      const refund = await processRefund(ownerAContext, {
        paymentId: "pay-100",
        amount: 2000,
        reason: "Member withdrew from elite program",
        invoiceId: "inv-100",
      });

      expect(refund.amount).toBe(2000);
      expect(refund.type).toBe(AdjustmentType.REFUND);
      // Invoice was reversed by 2000 -> balance due increases from 0 to 2000, status becomes PARTIALLY_PAID
      expect(updatedInvoiceRecord.data.paidAmount).toBe(3000);
      expect(updatedInvoiceRecord.data.dueAmount).toBe(2000);
      expect(updatedInvoiceRecord.data.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    });

    it("marks payment as REFUNDED when full balance is reimbursed", async () => {
      const existingPayment = {
        id: "pay-full-ref",
        gymId: gymAId,
        paymentNumber: "PAY-2026-0020",
        amount: 3000,
        status: PaymentStatus.COMPLETED,
        adjustments: [],
        allocations: [],
      };

      vi.spyOn(db.payment, "findUnique").mockResolvedValue(existingPayment as any);

      let updatedPaymentStatus: PaymentStatus | null = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          adjustmentOrRefund: {
            create: vi.fn().mockResolvedValue({ id: "adj-2", amount: 3000 }),
          },
          payment: {
            update: vi.fn().mockImplementation((args: any) => {
              updatedPaymentStatus = args.data.status;
              return Promise.resolve(args);
            }),
          },
        };
        return callback(txMock);
      });

      await processRefund(ownerAContext, {
        paymentId: "pay-full-ref",
        amount: 3000,
        reason: "Full accidental swipe reversal",
      });

      expect(updatedPaymentStatus).toBe(PaymentStatus.REFUNDED);
    });

    it("prevents refunding an amount exceeding the refundable payment balance", async () => {
      const existingPayment = {
        id: "pay-limited",
        gymId: gymAId,
        amount: 1000,
        status: PaymentStatus.COMPLETED,
        adjustments: [{ amount: 800 }], // 800 already refunded, only 200 remains
        allocations: [],
      };

      vi.spyOn(db.payment, "findUnique").mockResolvedValue(existingPayment as any);

      await expect(
        processRefund(ownerAContext, {
          paymentId: "pay-limited",
          amount: 500, // 500 > 200
          reason: "Excessive refund attempt",
        })
      ).rejects.toThrow(RefundExceededError);
    });
  });

  // ============================================================================
  // 5. ADJUSTMENTS & WRITE-OFFS
  // ============================================================================
  describe("Adjustments & Bad-Debt Write-Offs", () => {
    it("applies a promotional credit note adjustment to reduce invoice due amount", async () => {
      const targetInvoice = {
        id: "inv-adj-1",
        gymId: gymAId,
        invoiceNumber: "INV-2026-0030",
        totalAmount: 4000,
        paidAmount: 2000,
        dueAmount: 2000,
        status: InvoiceStatus.PARTIALLY_PAID,
      };

      vi.spyOn(db.invoice, "findUnique").mockResolvedValue(targetInvoice as any);

      let updatedInvoiceRecord: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          adjustmentOrRefund: {
            create: vi.fn().mockResolvedValue({
              id: "adj-cred",
              type: AdjustmentType.CREDIT_NOTE,
              amount: 500,
            }),
          },
          invoice: {
            update: vi.fn().mockImplementation((args: any) => {
              updatedInvoiceRecord = args;
              return Promise.resolve(args);
            }),
          },
        };
        return callback(txMock);
      });

      const adjustment = await processAdjustment(ownerAContext, {
        invoiceId: "inv-adj-1",
        type: AdjustmentType.CREDIT_NOTE,
        amount: 500,
        reason: "Loyalty anniversary discount concession",
      });

      expect(adjustment.amount).toBe(500);
      expect(updatedInvoiceRecord.data.dueAmount).toBe(1500);
      expect(updatedInvoiceRecord.data.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    });

    it("settles invoice to PAID when adjustment fully covers remaining due balance", async () => {
      const targetInvoice = {
        id: "inv-writeoff",
        gymId: gymAId,
        invoiceNumber: "INV-2026-0031",
        totalAmount: 1000,
        paidAmount: 500,
        dueAmount: 500,
        status: InvoiceStatus.PARTIALLY_PAID,
      };

      vi.spyOn(db.invoice, "findUnique").mockResolvedValue(targetInvoice as any);

      let updatedStatus: InvoiceStatus | null = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          adjustmentOrRefund: {
            create: vi.fn().mockResolvedValue({ id: "adj-wo", amount: 500 }),
          },
          invoice: {
            update: vi.fn().mockImplementation((args: any) => {
              updatedStatus = args.data.status;
              return Promise.resolve(args);
            }),
          },
        };
        return callback(txMock);
      });

      await processAdjustment(ownerAContext, {
        invoiceId: "inv-writeoff",
        type: AdjustmentType.WRITE_OFF,
        amount: 500,
        reason: "Disputed late fee waived by gym owner",
      });

      expect(updatedStatus).toBe(InvoiceStatus.PAID);
    });
  });

  // ============================================================================
  // 6. INVOICE VOID WORKFLOW & FINANCIAL SAFETY
  // ============================================================================
  describe("Invoice Void Workflow", () => {
    it("allows voiding an unpaid invoice and zeroes out dueAmount", async () => {
      const unpaidInvoice = {
        id: "inv-voidable",
        gymId: gymAId,
        invoiceNumber: "INV-2026-0040",
        paidAmount: 0,
        dueAmount: 2500,
        status: InvoiceStatus.ISSUED,
      };

      vi.spyOn(db.invoice, "findUnique").mockResolvedValue(unpaidInvoice as any);

      let updatedInvoice: any = null;

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          adjustmentOrRefund: {
            create: vi.fn().mockResolvedValue({ id: "adj-void" }),
          },
          invoice: {
            update: vi.fn().mockImplementation((args: any) => {
              updatedInvoice = args.data;
              return Promise.resolve({ ...unpaidInvoice, ...args.data });
            }),
          },
        };
        return callback(txMock);
      });

      const voided = await voidInvoice(ownerAContext, {
        invoiceId: "inv-voidable",
        reason: "Entered wrong duration before payment was collected",
      });

      expect(voided.status).toBe(InvoiceStatus.VOID);
      expect(updatedInvoice.status).toBe(InvoiceStatus.VOID);
      expect(updatedInvoice.dueAmount).toBe(0);
    });

    it("strictly blocks voiding an invoice with allocated payments", async () => {
      const partiallyPaidInvoice = {
        id: "inv-partially-paid",
        gymId: gymAId,
        invoiceNumber: "INV-2026-0041",
        paidAmount: 1500,
        dueAmount: 1500,
        status: InvoiceStatus.PARTIALLY_PAID,
      };

      vi.spyOn(db.invoice, "findUnique").mockResolvedValue(partiallyPaidInvoice as any);

      await expect(
        voidInvoice(ownerAContext, {
          invoiceId: "inv-partially-paid",
          reason: "Attempting to void paid ledger",
        })
      ).rejects.toThrow(InvalidFinancialStateError);
    });
  });

  // ============================================================================
  // 7. MULTI-TENANT ISOLATION & RBAC AUTHORIZATION
  // ============================================================================
  describe("Multi-Tenant Isolation & Role Authorization", () => {
    it("rejects attempt by Gym B staff to access Gym A invoice", async () => {
      const gymBStaffContext = createTenantContext({
        gymId: gymBId,
        userId: "staff-beta",
        role: GymRole.STAFF,
      });

      vi.spyOn(db.member, "findUnique").mockResolvedValue({
        id: "mem-101",
        gymId: gymBId,
      } as any);

      vi.spyOn(db.payment, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.payment, "count").mockResolvedValue(0);
      vi.spyOn(db.payment, "findUnique").mockResolvedValue(null);

      vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
        const txMock = {
          payment: {
            create: vi.fn().mockResolvedValue({ id: "pay-1" }),
          },
          invoice: {
            findUnique: vi.fn().mockResolvedValue({
              id: "inv-gym-a",
              gymId: gymAId, // Cross-tenant!
              invoiceNumber: "INV-2026-0001",
            }),
          },
        };
        return callback(txMock);
      });

      await expect(
        recordPayment(gymBStaffContext, {
          memberId: "mem-101",
          amount: 1000,
          method: PaymentMethod.CASH,
          invoiceId: "inv-gym-a",
        })
      ).rejects.toThrow(TenantAccessViolationError);
    });

    it("blocks non-financial roles (TRAINER, MEMBER) from creating invoices or logging payments", async () => {
      await expect(
        createInvoice(trainerAContext, {
          memberId: "mem-101",
          subtotal: 2000,
          taxAmount: 0,
        })
      ).rejects.toThrow(InsufficientPermissionError);

      await expect(
        recordPayment(memberAContext, {
          memberId: "mem-101",
          amount: 2000,
          method: PaymentMethod.UPI,
        })
      ).rejects.toThrow(InsufficientPermissionError);
    });

    it("blocks STAFF from processing refunds or voiding invoices (strictly Owner/Admin)", async () => {
      await expect(
        processRefund(staffAContext, {
          paymentId: "pay-100",
          amount: 500,
          reason: "Unauthorized staff refund",
        })
      ).rejects.toThrow(InsufficientPermissionError);

      await expect(
        voidInvoice(staffAContext, {
          invoiceId: "inv-100",
          reason: "Unauthorized staff void",
        })
      ).rejects.toThrow(InsufficientPermissionError);
    });
  });

  // ============================================================================
  // 8. DOUBLE-ENTRY METRICS & FINANCIAL OVERVIEW
  // ============================================================================
  describe("Double-Entry Metrics Calculation", () => {
    it("accurately computes net revenue, uncollected dues, and payment breakdowns", async () => {
      vi.spyOn(db.invoice, "aggregate")
        .mockResolvedValueOnce({ _sum: { totalAmount: 50000 } } as any)
        .mockResolvedValueOnce({ _sum: { dueAmount: 12000 } } as any);

      vi.spyOn(db.invoice, "count").mockResolvedValue(3); // 3 overdue

      vi.spyOn(db.payment, "aggregate").mockResolvedValue({
        _sum: { amount: 38000 },
      } as any);

      vi.spyOn(db.adjustmentOrRefund, "aggregate").mockResolvedValue({
        _sum: { amount: 2000 },
      } as any);

      vi.spyOn(db.payment, "groupBy").mockResolvedValue([
        { method: PaymentMethod.UPI, _sum: { amount: 25000 } },
        { method: PaymentMethod.CASH, _sum: { amount: 10000 } },
        { method: PaymentMethod.CARD, _sum: { amount: 3000 } },
      ] as any);

      const overview = await getFinancialOverview(ownerAContext);

      expect(overview.totalInvoiced).toBe(50000);
      expect(overview.grossPayments).toBe(38000);
      expect(overview.totalRefunds).toBe(2000);
      expect(overview.netRevenue).toBe(36000); // 38000 - 2000
      expect(overview.outstandingDues).toBe(12000);
      expect(overview.overdueInvoicesCount).toBe(3);
      expect(overview.paymentMethodBreakdown["UPI"]).toBe(25000);
      expect(overview.paymentMethodBreakdown["CASH"]).toBe(10000);
      expect(overview.paymentMethodBreakdown["CARD"]).toBe(3000);
    });
  });
});
