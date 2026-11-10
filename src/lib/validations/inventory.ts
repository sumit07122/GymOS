import { z } from "zod";
import { StockMovementType } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Inventory & Stock Management Validation Schemas
// ==============================================================================

export const INVENTORY_DEFAULT_CATEGORIES = [
  "Protein Products",
  "Supplements",
  "Gym Merchandise",
  "Accessories",
  "Cleaning Supplies",
  "Other",
] as const;

export const itemCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(100, "Item name cannot exceed 100 characters"),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU cannot exceed 50 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "SKU must contain only letters, numbers, hyphens and underscores"),
  category: z.string().trim().max(50).optional().or(z.literal("")),
  costPrice: z.coerce
    .number()
    .nonnegative("Cost price cannot be negative")
    .max(9999999, "Cost price too large")
    .default(0),
  retailPrice: z.coerce
    .number()
    .nonnegative("Retail price cannot be negative")
    .max(9999999, "Retail price too large")
    .default(0),
  initialStock: z.coerce
    .number()
    .int("Stock must be an integer")
    .nonnegative("Initial stock cannot be negative")
    .max(999999, "Stock too large")
    .default(0),
  reorderPoint: z.coerce
    .number()
    .int("Reorder point must be an integer")
    .nonnegative("Reorder point cannot be negative")
    .max(99999, "Reorder point too large")
    .default(5),
});

export const itemUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().max(50).optional().or(z.literal("")),
  costPrice: z.coerce.number().nonnegative().max(9999999).optional(),
  retailPrice: z.coerce.number().nonnegative().max(9999999).optional(),
  reorderPoint: z.coerce.number().int().nonnegative().max(99999).optional(),
  isActive: z.boolean().optional(),
});

export const stockMovementCreateSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  type: z.nativeEnum(StockMovementType),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),
  referenceNumber: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const inventoryFilterSchema = z.object({
  category: z.string().optional(),
  lowStockOnly: z.boolean().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type ItemCreateInput = z.input<typeof itemCreateSchema>;
export type ItemUpdateInput = z.input<typeof itemUpdateSchema>;
export type StockMovementCreateInput = z.input<typeof stockMovementCreateSchema>;
export type InventoryFilterParams = z.input<typeof inventoryFilterSchema>;

