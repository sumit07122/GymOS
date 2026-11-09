import { z } from "zod";
import { PaymentMethod, InvoiceStatus, AdjustmentType } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Financial Validation Schemas (Invoices, Payments, Dues)
// ==============================================================================

export const invoiceCreateSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  membershipId: z.string().optional().or(z.literal("")),
  subtotal: z.coerce
    .number()
    .positive("Subtotal must be greater than zero")
    .max(1000000, "Subtotal cannot exceed 1,000,000"),
  taxAmount: z.coerce
    .number()
    .min(0, "Tax cannot be negative")
    .max(100000, "Tax cannot exceed 100,000")
    .default(0),
  dueDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Due date must be a valid date"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const paymentRecordSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.coerce
    .number()
    .positive("Payment amount must be greater than zero")
    .max(1000000, "Amount cannot exceed 1,000,000"),
  method: z.nativeEnum(PaymentMethod),
  gatewayRef: z
    .string()
    .trim()
    .max(100, "Payment reference cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  receivedAt: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Received date must be a valid date"),
  // Optional specific invoice allocation
  invoiceId: z.string().optional().or(z.literal("")),
  autoAllocate: z.boolean().optional().default(true),
});

export const refundCreateSchema = z.object({
  paymentId: z.string().min(1, "Payment identifier is required"),
  amount: z.coerce
    .number()
    .positive("Refund amount must be greater than zero"),
  reason: z
    .string()
    .trim()
    .min(3, "Audit reason must be at least 3 characters")
    .max(255, "Audit reason cannot exceed 255 characters"),
  invoiceId: z.string().optional().or(z.literal("")),
});

export const adjustmentCreateSchema = z.object({
  invoiceId: z.string().min(1, "Invoice identifier is required"),
  type: z.nativeEnum(AdjustmentType),
  amount: z.coerce
    .number()
    .positive("Adjustment amount must be greater than zero"),
  reason: z
    .string()
    .trim()
    .min(3, "Audit reason must be at least 3 characters")
    .max(255, "Audit reason cannot exceed 255 characters"),
});

export const invoiceVoidSchema = z.object({
  invoiceId: z.string().min(1, "Invoice identifier is required"),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(255, "Reason cannot exceed 255 characters"),
});

export const invoiceFilterSchema = z.object({
  status: z.nativeEnum(InvoiceStatus).or(z.literal("ALL")).optional(),
  memberId: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const paymentFilterSchema = z.object({
  method: z.nativeEnum(PaymentMethod).or(z.literal("ALL")).optional(),
  memberId: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type InvoiceCreateInput = z.input<typeof invoiceCreateSchema>;
export type PaymentRecordInput = z.input<typeof paymentRecordSchema>;
export type RefundCreateInput = z.infer<typeof refundCreateSchema>;
export type AdjustmentCreateInput = z.infer<typeof adjustmentCreateSchema>;
export type InvoiceVoidInput = z.infer<typeof invoiceVoidSchema>;
export type InvoiceFilterParams = z.infer<typeof invoiceFilterSchema>;
export type PaymentFilterParams = z.infer<typeof paymentFilterSchema>;
