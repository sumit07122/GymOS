/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createInventoryItem,
  updateInventoryItem,
  getItemById,
  listInventoryItems,
  recordStockMovement,
  getInventoryOverview,
  ItemNotFoundError,
  DuplicateSkuError,
  InsufficientStockError,
} from "@/lib/services/inventory.service";
import { createTenantContext } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import { GymRole, StockMovementType } from "@prisma/client";

describe("Milestone M13: Inventory Management", () => {
  const gymAId = "gym-alpha-inventory";
  const gymBId = "gym-beta-inventory";

  const ownerAContext = createTenantContext({
    gymId: gymAId,
    userId: "owner-alpha",
    userEmail: "owner@alpha.com",
    role: GymRole.OWNER,
  });

  const memberAContext = createTenantContext({
    gymId: gymAId,
    userId: "member-alpha",
    userEmail: "member@alpha.com",
    role: GymRole.MEMBER,
  });

  const ownerBContext = createTenantContext({
    gymId: gymBId,
    userId: "owner-beta",
    userEmail: "owner@beta.com",
    role: GymRole.OWNER,
  });

  const mockItem = {
    id: "item-001",
    gymId: gymAId,
    sku: "WHEY-CHO-1KG",
    name: "Whey Protein Chocolate 1kg",
    category: "Protein Products",
    costPrice: { toString: () => "2000" } as any,
    retailPrice: { toString: () => "2800" } as any,
    currentStock: 15,
    reorderPoint: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. ITEM CRUD
  // ============================================================================
  describe("Inventory Items CRUD", () => {
    it("creates an inventory item without initial stock", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(null);

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          inventoryItem: {
            create: vi.fn().mockResolvedValue({ ...mockItem, currentStock: 0 }),
          },
          stockMovement: {
            create: vi.fn(),
          },
        };
        return cb(tx);
      });

      const item = await createInventoryItem(ownerAContext, {
        name: "Whey Protein Chocolate 1kg",
        sku: "WHEY-CHO-1KG",
        category: "Protein Products",
        costPrice: 2000,
        retailPrice: 2800,
        initialStock: 0,
        reorderPoint: 5,
      });

      expect(item.sku).toBe("WHEY-CHO-1KG");
    });

    it("creates initial stock movement when initialStock > 0", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(null);
      const stockMovementCreateMock = vi.fn().mockResolvedValue({});

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          inventoryItem: {
            create: vi.fn().mockResolvedValue({ ...mockItem, currentStock: 10 }),
          },
          stockMovement: {
            create: stockMovementCreateMock,
          },
        };
        return cb(tx);
      });

      await createInventoryItem(ownerAContext, {
        name: "Creatine 300g",
        sku: "CREA-300G",
        initialStock: 10,
      });

      expect(stockMovementCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: StockMovementType.PURCHASE_RECEIPT,
            quantity: 10,
            referenceNumber: "INITIAL-STOCK",
          }),
        })
      );
    });

    it("rejects duplicate SKU within the same gym", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(mockItem);

      await expect(
        createInventoryItem(ownerAContext, {
          name: "Duplicate Item",
          sku: "WHEY-CHO-1KG",
        })
      ).rejects.toBeInstanceOf(DuplicateSkuError);
    });

    it("rejects inventory creation for unauthorized member role", async () => {
      await expect(
        createInventoryItem(memberAContext, {
          name: "Member Tried Item",
          sku: "TEST-SKU",
        })
      ).rejects.toBeInstanceOf(InsufficientPermissionError);
    });

    it("updates item pricing and details", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(mockItem);
      vi.spyOn(db.inventoryItem, "update").mockResolvedValue({
        ...mockItem,
        retailPrice: 2999 as any,
      });

      const updated = await updateInventoryItem(ownerAContext, "item-001", {
        retailPrice: 2999,
      });

      expect(updated.retailPrice).toBe(2999);
    });
  });

  // ============================================================================
  // 2. STOCK MOVEMENTS
  // ============================================================================
  describe("Stock Movements and Ledger", () => {
    it("adds stock on PURCHASE_RECEIPT and updates current stock", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(mockItem);

      const mockMovement = {
        id: "mov-001",
        gymId: gymAId,
        itemId: "item-001",
        type: StockMovementType.PURCHASE_RECEIPT,
        quantity: 10,
        previousStock: 15,
        newStock: 25,
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          stockMovement: { create: vi.fn().mockResolvedValue(mockMovement) },
          inventoryItem: { update: vi.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const movement = await recordStockMovement(ownerAContext, {
        itemId: "item-001",
        type: StockMovementType.PURCHASE_RECEIPT,
        quantity: 10,
        referenceNumber: "PO-1001",
      });

      expect(movement.quantity).toBe(10);
      expect(movement.newStock).toBe(25);
    });

    it("reduces stock on SALE and decrements current stock", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(mockItem);

      const mockMovement = {
        id: "mov-002",
        gymId: gymAId,
        itemId: "item-001",
        type: StockMovementType.SALE,
        quantity: -2,
        previousStock: 15,
        newStock: 13,
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          stockMovement: { create: vi.fn().mockResolvedValue(mockMovement) },
          inventoryItem: { update: vi.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const movement = await recordStockMovement(ownerAContext, {
        itemId: "item-001",
        type: StockMovementType.SALE,
        quantity: 2,
        referenceNumber: "INV-999",
      });

      expect(movement.quantity).toBe(-2);
      expect(movement.newStock).toBe(13);
    });

    it("prevents negative stock and throws InsufficientStockError", async () => {
      // Current stock is 15; trying to sell 20 units
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(mockItem);

      await expect(
        recordStockMovement(ownerAContext, {
          itemId: "item-001",
          type: StockMovementType.SALE,
          quantity: 20,
        })
      ).rejects.toBeInstanceOf(InsufficientStockError);
    });

    it("records adjustment loss with negative quantity", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(mockItem);

      const mockMovement = {
        id: "mov-003",
        gymId: gymAId,
        itemId: "item-001",
        type: StockMovementType.ADJUSTMENT_LOSS,
        quantity: -1,
        previousStock: 15,
        newStock: 14,
      };

      vi.spyOn(db, "$transaction").mockImplementation(async (cb: any) => {
        const tx = {
          stockMovement: { create: vi.fn().mockResolvedValue(mockMovement) },
          inventoryItem: { update: vi.fn().mockResolvedValue({}) },
        };
        return cb(tx);
      });

      const movement = await recordStockMovement(ownerAContext, {
        itemId: "item-001",
        type: StockMovementType.ADJUSTMENT_LOSS,
        quantity: 1,
        notes: "Damaged container during shelf restocking",
      });

      expect(movement.quantity).toBe(-1);
      expect(movement.newStock).toBe(14);
    });
  });

  // ============================================================================
  // 3. OVERVIEW & VALUATION METRICS
  // ============================================================================
  describe("Inventory Overview and Valuation", () => {
    it("computes cost valuation, retail valuation, and low stock count", async () => {
      const items = [
        {
          category: "Supplements",
          currentStock: 10,
          reorderPoint: 5,
          costPrice: 100 as any,
          retailPrice: 150 as any,
        },
        {
          category: "Merchandise",
          currentStock: 2, // Low stock (min: 5)
          reorderPoint: 5,
          costPrice: 200 as any,
          retailPrice: 400 as any,
        },
      ];
      vi.spyOn(db.inventoryItem, "findMany").mockResolvedValue(items as any);

      const overview = await getInventoryOverview(ownerAContext);

      expect(overview.totalItems).toBe(2);
      expect(overview.totalUnitsInStock).toBe(12);
      expect(overview.lowStockCount).toBe(1);
      // Cost: (10*100) + (2*200) = 1400
      expect(overview.totalCostValuation).toBe(1400);
      // Retail: (10*150) + (2*400) = 2300
      expect(overview.totalRetailValuation).toBe(2300);
    });

    it("filters inventory list by low stock items", async () => {
      const normalItem = { ...mockItem, id: "item-1", currentStock: 20, reorderPoint: 5 };
      const lowStockItem = { ...mockItem, id: "item-2", currentStock: 2, reorderPoint: 5 };

      vi.spyOn(db, "$transaction").mockResolvedValue([[normalItem, lowStockItem], 2] as any);

      const result = await listInventoryItems(ownerAContext, { lowStockOnly: true });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("item-2");
    });
  });

  // ============================================================================
  // 4. TENANT ISOLATION
  // ============================================================================
  describe("Tenant Isolation", () => {
    it("gym B cannot adjust stock of gym A items", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(null);

      await expect(
        recordStockMovement(ownerBContext, {
          itemId: "item-001",
          type: StockMovementType.SALE,
          quantity: 1,
        })
      ).rejects.toBeInstanceOf(ItemNotFoundError);
    });

    it("gym B cannot read gym A item details", async () => {
      vi.spyOn(db.inventoryItem, "findFirst").mockResolvedValue(null);

      await expect(getItemById(ownerBContext, "item-001")).rejects.toBeInstanceOf(
        ItemNotFoundError
      );
    });

    it("listInventoryItems always scopes queries to current gymId", async () => {
      const findManySpy = vi.spyOn(db.inventoryItem, "findMany");
      vi.spyOn(db, "$transaction").mockResolvedValue([[mockItem], 1] as any);

      await listInventoryItems(ownerAContext, {});

      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ gymId: gymAId }),
        })
      );
    });
  });
});

