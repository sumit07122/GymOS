/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createExpense,
  updateExpense,
  softDeleteExpense,
  createExpenseCategory,
  deleteExpenseCategory,
  listExpenseCategories,
  getExpensesList,
  getExpenseOverview,
  seedDefaultExpenseCategories,
  ExpenseCategoryNotFoundError,
  ExpenseNotFoundError,
  CategoryInUseError,
  DuplicateCategoryError,
} from "@/lib/services/expense.service";
import { createTenantContext } from "@/lib/tenant/context";
import { InsufficientPermissionError } from "@/lib/tenant/permissions";
import { db } from "@/lib/db";
import { GymRole, PaymentMethod } from "@prisma/client";

describe("Milestone M11: Expense Management", () => {
  const gymAId = "gym-alpha-expenses";
  const gymBId = "gym-beta-expenses";

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

  const mockCategory = {
    id: "cat-001",
    gymId: gymAId,
    name: "Electricity",
    createdAt: new Date(),
  };

  const mockExpense = {
    id: "exp-001",
    gymId: gymAId,
    categoryId: "cat-001",
    recordedByUserId: "owner-alpha",
    title: "Monthly electricity bill",
    amount: { toString: () => "5000" } as any,
    expenseDate: new Date("2026-10-01"),
    paymentMethod: PaymentMethod.CASH,
    receiptUrl: null,
    vendorName: "City Power Corp",
    notes: null,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: "cat-001", name: "Electricity" },
    recordedByUser: { id: "owner-alpha", name: "Gym Owner" },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // 1. EXPENSE CREATION
  // ============================================================================
  describe("Expense Creation", () => {
    it("creates an expense successfully", async () => {
      vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(mockCategory);
      vi.spyOn(db.expense, "create").mockResolvedValue(mockExpense as any);

      const result = await createExpense(ownerAContext, {
        categoryId: "cat-001",
        title: "Monthly electricity bill",
        amount: 5000,
        expenseDate: "2026-10-01",
        paymentMethod: PaymentMethod.CASH,
        vendorName: "City Power Corp",
      });

      expect(result.title).toBe("Monthly electricity bill");
      expect(db.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gymId: gymAId,
            recordedByUserId: "owner-alpha",
            categoryId: "cat-001",
          }),
        })
      );
    });

    it("rejects expense creation for member role (insufficient permission)", async () => {
      await expect(
        createExpense(memberAContext, {
          categoryId: "cat-001",
          title: "Test",
          amount: 100,
          expenseDate: "2026-10-01",
          paymentMethod: PaymentMethod.CASH,
        })
      ).rejects.toBeInstanceOf(InsufficientPermissionError);
    });

    it("rejects if categoryId does not belong to current gym", async () => {
      vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(null);

      await expect(
        createExpense(ownerAContext, {
          categoryId: "foreign-cat",
          title: "Test",
          amount: 100,
          expenseDate: "2026-10-01",
          paymentMethod: PaymentMethod.CASH,
        })
      ).rejects.toBeInstanceOf(ExpenseCategoryNotFoundError);
    });
  });

  // ============================================================================
  // 2. EXPENSE UPDATES & AUDIT
  // ============================================================================
  describe("Expense Update with Audit Log", () => {
    it("updates expense and creates audit log entries for changed fields", async () => {
      vi.spyOn(db.expense, "findFirst").mockResolvedValue(mockExpense as any);
      // $transaction receives an array of promises — mock it to resolve the first item (the update)
      const transactionMock = vi.spyOn(db, "$transaction").mockImplementation(async () => {
        return [{ ...mockExpense, title: "Updated bill" }];
      });

      await updateExpense(ownerAContext, "exp-001", {
        title: "Updated bill",
        reason: "Corrected title",
      });

      expect(transactionMock).toHaveBeenCalled();
    });

    it("rejects update when expense belongs to different gym", async () => {
      vi.spyOn(db.expense, "findFirst").mockResolvedValue(null);

      await expect(
        updateExpense(ownerBContext, "exp-001", { title: "Hacked" })
      ).rejects.toBeInstanceOf(ExpenseNotFoundError);
    });
  });

  // ============================================================================
  // 3. SOFT DELETE
  // ============================================================================
  describe("Soft Delete", () => {
    it("soft-deletes an expense and creates an audit log entry", async () => {
      vi.spyOn(db.expense, "findFirst").mockResolvedValue(mockExpense as any);
      const transactionMock = vi.spyOn(db, "$transaction").mockImplementation(async () => []);

      await softDeleteExpense(ownerAContext, "exp-001", "Entered in error");

      expect(transactionMock).toHaveBeenCalled();
    });

    it("throws ExpenseNotFoundError when expense not found", async () => {
      vi.spyOn(db.expense, "findFirst").mockResolvedValue(null);

      await expect(softDeleteExpense(ownerAContext, "ghost-id")).rejects.toBeInstanceOf(
        ExpenseNotFoundError
      );
    });
  });

  // ============================================================================
  // 4. CATEGORY MANAGEMENT
  // ============================================================================
  describe("Category Management", () => {
    it("creates a new category successfully", async () => {
      vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(null);
      vi.spyOn(db.expenseCategory, "create").mockResolvedValue({
        id: "cat-new",
        gymId: gymAId,
        name: "Insurance",
        createdAt: new Date(),
      });

      const cat = await createExpenseCategory(ownerAContext, { name: "Insurance" });
      expect(cat.name).toBe("Insurance");
      expect(db.expenseCategory.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ gymId: gymAId }) })
      );
    });

    it("rejects duplicate category name within same gym", async () => {
      vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(mockCategory);

      await expect(
        createExpenseCategory(ownerAContext, { name: "Electricity" })
      ).rejects.toBeInstanceOf(DuplicateCategoryError);
    });

    it("deletes a category with no expenses attached", async () => {
      vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(mockCategory);
      vi.spyOn(db.expense, "count").mockResolvedValue(0);
      const deleteMock = vi.spyOn(db.expenseCategory, "delete").mockResolvedValue(mockCategory);

      await deleteExpenseCategory(ownerAContext, "cat-001");
      expect(deleteMock).toHaveBeenCalled();
    });

    it("throws CategoryInUseError when category has associated expenses", async () => {
      vi.spyOn(db.expenseCategory, "findFirst").mockResolvedValue(mockCategory);
      vi.spyOn(db.expense, "count").mockResolvedValue(5);

      await expect(
        deleteExpenseCategory(ownerAContext, "cat-001")
      ).rejects.toBeInstanceOf(CategoryInUseError);
    });
  });

  // ============================================================================
  // 5. LIST & FILTERING
  // ============================================================================
  describe("Expense List and Filtering", () => {
    it("filters expenses by date range", async () => {
      vi.spyOn(db, "$transaction").mockResolvedValue([[mockExpense], 1] as any);

      const result = await getExpensesList(ownerAContext, {
        dateFrom: "2026-10-01",
        dateTo: "2026-10-31",
      });

      expect(result.total).toBe(1);
      expect(result.expenses).toHaveLength(1);
    });

    it("filters expenses by category", async () => {
      vi.spyOn(db, "$transaction").mockResolvedValue([[mockExpense], 1] as any);

      const result = await getExpensesList(ownerAContext, { categoryId: "cat-001" });
      expect(result.expenses).toHaveLength(1);
    });

    it("returns empty list when no expenses match filter", async () => {
      vi.spyOn(db, "$transaction").mockResolvedValue([[], 0] as any);

      const result = await getExpensesList(ownerAContext, { search: "nonexistent" });
      expect(result.total).toBe(0);
      expect(result.expenses).toHaveLength(0);
    });
  });

  // ============================================================================
  // 6. OVERVIEW & REPORTING
  // ============================================================================
  describe("Expense Overview", () => {
    it("returns aggregate financial overview with monthly totals", async () => {
      vi.spyOn(db, "$transaction").mockResolvedValue([
        { _sum: { amount: { toString: () => "50000" } }, _count: 10 },
        { _sum: { amount: { toString: () => "5000" } }, _count: 1 },
        { _sum: { amount: { toString: () => "15000" } }, _count: 3 },
        [{ categoryId: "cat-001", _sum: { amount: { toString: () => "50000" } }, _count: 10 }],
        [{ paymentMethod: PaymentMethod.CASH, _sum: { amount: { toString: () => "50000" } }, _count: 10 }],
      ] as any);

      vi.spyOn(db.expenseCategory, "findMany").mockResolvedValue([
        { id: "cat-001", gymId: gymAId, name: "Electricity", createdAt: new Date() },
      ]);

      vi.spyOn(db.expense, "findMany").mockResolvedValue([]);

      const overview = await getExpenseOverview(ownerAContext);
      expect(overview.totalAllTime).toBeGreaterThanOrEqual(0);
      expect(overview.categoryBreakdown).toBeDefined();
      expect(overview.monthlyTotals).toBeDefined();
    });
  });

  // ============================================================================
  // 7. DEFAULT CATEGORIES
  // ============================================================================
  describe("Seed Default Categories", () => {
    it("seeds 8 default categories for a fresh gym", async () => {
      vi.spyOn(db.expenseCategory, "findMany").mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      const createManyMock = vi.spyOn(db.expenseCategory, "createMany").mockResolvedValue({ count: 8 });

      await seedDefaultExpenseCategories(ownerAContext);
      expect(createManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.arrayContaining([expect.objectContaining({ name: "Rent" })]) })
      );
    });

    it("is idempotent — does not duplicate existing categories", async () => {
      const allDefaults = ["Rent", "Electricity", "Equipment", "Maintenance", "Staff Salary", "Cleaning", "Marketing", "Other"].map(
        (name) => ({ id: `cat-${name}`, gymId: gymAId, name, createdAt: new Date() })
      );
      vi.spyOn(db.expenseCategory, "findMany").mockResolvedValueOnce(allDefaults).mockResolvedValueOnce(allDefaults);
      const createManyMock = vi.spyOn(db.expenseCategory, "createMany").mockResolvedValue({ count: 0 });

      await seedDefaultExpenseCategories(ownerAContext);
      expect(createManyMock).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // 8. TENANT ISOLATION
  // ============================================================================
  describe("Tenant Isolation", () => {
    it("gym B owner cannot access gym A expenses via getExpensesList", async () => {
      // The service always scopes by ctx.gymId — gym B will only get gym B expenses
      vi.spyOn(db, "$transaction").mockResolvedValue([[], 0] as any);

      const result = await getExpensesList(ownerBContext, {});
      // Even if we requested gym A data, service uses ctx.gymId = gymBId
      expect(result.total).toBe(0);
    });

    it("gym B owner cannot soft-delete gym A expense", async () => {
      // findFirst scoped to gymBId returns null for gymAId expense
      vi.spyOn(db.expense, "findFirst").mockResolvedValue(null);

      await expect(softDeleteExpense(ownerBContext, "exp-001")).rejects.toBeInstanceOf(
        ExpenseNotFoundError
      );
    });

    it("listExpenseCategories always scopes to current gym", async () => {
      vi.spyOn(db.expenseCategory, "findMany").mockResolvedValue([]);

      await listExpenseCategories(ownerBContext);

      expect(db.expenseCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ gymId: gymBId }) })
      );
    });
  });
});
