import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Expense Management Validation Schemas
// ==============================================================================

export const expenseCategoryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(80, "Category name cannot exceed 80 characters"),
});

export const expenseCreateSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  title: z
    .string()
    .trim()
    .min(1, "Expense title is required")
    .max(120, "Title cannot exceed 120 characters"),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .max(99_999_999, "Amount too large"),
  expenseDate: z
    .string()
    .min(1, "Expense date is required")
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Expense date must be a valid date"),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  vendorName: z
    .string()
    .trim()
    .max(120, "Vendor name cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  receiptUrl: z
    .string()
    .trim()
    .max(500, "Receipt URL is too long")
    .optional()
    .or(z.literal("")),
});

export const expenseUpdateSchema = z.object({
  categoryId: z.string().min(1, "Category is required").optional(),
  title: z
    .string()
    .trim()
    .min(1, "Expense title is required")
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .max(99_999_999, "Amount too large")
    .optional(),
  expenseDate: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Expense date must be a valid date")
    .optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  vendorName: z
    .string()
    .trim()
    .max(120, "Vendor name cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  receiptUrl: z
    .string()
    .trim()
    .max(500, "Receipt URL is too long")
    .optional()
    .or(z.literal("")),
  reason: z
    .string()
    .trim()
    .max(500, "Edit reason cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const expenseFilterSchema = z.object({
  categoryId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type ExpenseCategoryCreateInput = z.infer<typeof expenseCategoryCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
export type ExpenseFilterParams = z.infer<typeof expenseFilterSchema>;

