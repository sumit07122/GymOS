/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import {
  TenantContext,
  assertPermission,
  assertTenantOwnership,
} from "@/lib/tenant/context";
import { InventoryItem, StockMovement, StockMovementType } from "@prisma/client";
import {
  ItemCreateInput,
  ItemUpdateInput,
  StockMovementCreateInput,
  InventoryFilterParams,
} from "@/lib/validations/inventory";

// ==============================================================================
// FIXIA GymOS — Inventory Domain Errors
// ==============================================================================

export class ItemNotFoundError extends Error {
  constructor(id: string) {
    super(`Inventory item "${id}" not found or does not belong to this gym.`);
    this.name = "ItemNotFoundError";
  }
}

export class DuplicateSkuError extends Error {
  constructor(sku: string) {
    super(`An inventory item with SKU "${sku}" already exists in this gym.`);
    this.name = "DuplicateSkuError";
  }
}

export class InsufficientStockError extends Error {
  constructor(available: number, requested: number) {
    super(
      `Insufficient stock. Available: ${available}, requested reduction: ${requested}. Negative stock is prevented.`
    );
    this.name = "InsufficientStockError";
  }
}

// ==============================================================================
// Types
// ==============================================================================

export type ItemWithMovements = InventoryItem & {
  movements?: Array<
    StockMovement & {
      recordedByUser: { id: string; name: string | null };
    }
  >;
};

export type InventoryOverview = {
  totalItems: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  categories: Array<{ name: string; count: number }>;
};

// ==============================================================================
// 1. INVENTORY ITEMS (CRUD)
// ==============================================================================

export async function createInventoryItem(
  ctx: TenantContext,
  input: ItemCreateInput
): Promise<InventoryItem> {
  assertPermission(ctx, "INVENTORY_MANAGE");

  const existing = await db.inventoryItem.findFirst({
    where: { gymId: ctx.gymId, sku: input.sku.trim() },
  });
  if (existing) {
    throw new DuplicateSkuError(input.sku.trim());
  }

  const initialStock = Number(input.initialStock ?? 0);

  return db.$transaction(async (tx: any) => {
    const item = await tx.inventoryItem.create({
      data: {
        gymId: ctx.gymId,
        sku: input.sku.trim().toUpperCase(),
        name: input.name.trim(),
        category: input.category?.trim() || null,
        costPrice: Number(input.costPrice ?? 0),
        retailPrice: Number(input.retailPrice ?? 0),
        currentStock: initialStock,
        reorderPoint: Number(input.reorderPoint ?? 5),
        isActive: true,
      },
    });

    if (initialStock > 0) {
      await tx.stockMovement.create({
        data: {
          gymId: ctx.gymId,
          itemId: item.id,
          type: StockMovementType.PURCHASE_RECEIPT,
          quantity: initialStock,
          previousStock: 0,
          newStock: initialStock,
          referenceNumber: "INITIAL-STOCK",
          recordedByUserId: ctx.userId,
          notes: "Initial inventory setup balance",
        },
      });
    }

    return item;
  });
}

export async function updateInventoryItem(
  ctx: TenantContext,
  itemId: string,
  input: ItemUpdateInput
): Promise<InventoryItem> {
  assertPermission(ctx, "INVENTORY_MANAGE");

  const existing = await db.inventoryItem.findFirst({
    where: { id: itemId, gymId: ctx.gymId },
  });
  if (!existing) throw new ItemNotFoundError(itemId);
  assertTenantOwnership(ctx, existing.gymId);

  return db.inventoryItem.update({
    where: { id: itemId },
    data: {
      name: input.name !== undefined ? input.name.trim() : undefined,
      category: input.category !== undefined ? (input.category.trim() || null) : undefined,
      costPrice: input.costPrice !== undefined ? Number(input.costPrice) : undefined,
      retailPrice: input.retailPrice !== undefined ? Number(input.retailPrice) : undefined,
      reorderPoint: input.reorderPoint !== undefined ? Number(input.reorderPoint) : undefined,
      isActive: input.isActive,
    },
  });
}

export async function getItemById(
  ctx: TenantContext,
  itemId: string
): Promise<ItemWithMovements> {
  assertPermission(ctx, "INVENTORY_READ");

  const item = await db.inventoryItem.findFirst({
    where: { id: itemId, gymId: ctx.gymId },
    include: {
      movements: {
        include: {
          recordedByUser: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!item) throw new ItemNotFoundError(itemId);
  assertTenantOwnership(ctx, item.gymId);

  return item as ItemWithMovements;
}

export async function listInventoryItems(
  ctx: TenantContext,
  params: Partial<InventoryFilterParams> = {}
): Promise<{ items: InventoryItem[]; total: number }> {
  assertPermission(ctx, "INVENTORY_READ");

  const pageNum = Number(params.page || 1);
  const limitNum = Number(params.limit || 50);
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, any> = { gymId: ctx.gymId, isActive: true };

  if (params.category && params.category !== "ALL") {
    where.category = params.category;
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { sku: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await db.$transaction([
    db.inventoryItem.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limitNum,
    }),
    db.inventoryItem.count({ where }),
  ]);

  // If lowStockOnly, filter items where currentStock <= reorderPoint
  const finalItems = params.lowStockOnly
    ? items.filter((i) => i.currentStock <= i.reorderPoint)
    : items;

  return { items: finalItems, total: params.lowStockOnly ? finalItems.length : total };
}

// ==============================================================================
// 2. STOCK MOVEMENTS (LEDGER & ADJUSTMENTS)
// ==============================================================================

export async function recordStockMovement(
  ctx: TenantContext,
  input: StockMovementCreateInput
): Promise<StockMovement> {
  assertPermission(ctx, "INVENTORY_MANAGE");

  const item = await db.inventoryItem.findFirst({
    where: { id: input.itemId, gymId: ctx.gymId, isActive: true },
  });
  if (!item) throw new ItemNotFoundError(input.itemId);
  assertTenantOwnership(ctx, item.gymId);

  const qty = Number(input.quantity);
  const isAddition =
    input.type === StockMovementType.PURCHASE_RECEIPT ||
    input.type === StockMovementType.ADJUSTMENT_FOUND ||
    input.type === StockMovementType.RETURN;

  const signedQuantity = isAddition ? qty : -qty;
  const previousStock = item.currentStock;
  const newStock = previousStock + signedQuantity;

  // Prevent negative stock
  if (newStock < 0) {
    throw new InsufficientStockError(previousStock, qty);
  }

  return db.$transaction(async (tx: any) => {
    const movement = await tx.stockMovement.create({
      data: {
        gymId: ctx.gymId,
        itemId: input.itemId,
        type: input.type,
        quantity: signedQuantity,
        previousStock,
        newStock,
        referenceNumber: input.referenceNumber?.trim() || null,
        recordedByUserId: ctx.userId,
        notes: input.notes?.trim() || null,
      },
    });

    await tx.inventoryItem.update({
      where: { id: input.itemId },
      data: { currentStock: newStock },
    });

    return movement;
  });
}

// ==============================================================================
// 3. INVENTORY OVERVIEW & VALUATION METRICS
// ==============================================================================

export async function getInventoryOverview(
  ctx: TenantContext
): Promise<InventoryOverview> {
  assertPermission(ctx, "INVENTORY_READ");

  const items = await db.inventoryItem.findMany({
    where: { gymId: ctx.gymId, isActive: true },
    select: {
      category: true,
      currentStock: true,
      reorderPoint: true,
      costPrice: true,
      retailPrice: true,
    },
  });

  let totalUnitsInStock = 0;
  let lowStockCount = 0;
  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  const categoryMap = new Map<string, number>();

  for (const item of items) {
    const stock = item.currentStock;
    totalUnitsInStock += stock;
    if (stock <= item.reorderPoint) {
      lowStockCount++;
    }
    totalCostValuation += stock * Number(item.costPrice);
    totalRetailValuation += stock * Number(item.retailPrice);

    const cat = item.category || "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalItems: items.length,
    totalUnitsInStock,
    lowStockCount,
    totalCostValuation: Math.round(totalCostValuation),
    totalRetailValuation: Math.round(totalRetailValuation),
    categories,
  };
}
