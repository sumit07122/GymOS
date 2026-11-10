"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Plus, Receipt, BarChart3, Settings } from "lucide-react";
import { ExpenseOverviewCards } from "./expense-overview-cards";
import { ExpenseCategoryBreakdown } from "./expense-category-breakdown";
import { ExpenseListTable } from "./expense-list-table";
import { ExpenseFormModal } from "./expense-form-modal";
import { AddCategoryModal, CategoryManagementPanel } from "./expense-category-modal";
import { ExpenseWithDetails, ExpenseOverview } from "@/lib/services/expense.service";
import { deleteExpenseAction, seedDefaultCategoriesAction, ExpenseActionState } from "@/lib/actions/expense";
import { ExpenseCategory } from "@prisma/client";
import { PageHeader } from "@/components/design-system/page-header";

interface ExpensesHubProps {
  expenses: ExpenseWithDetails[];
  categories: ExpenseCategory[];
  overview: ExpenseOverview;
  gymId: string;
  gymSlug: string;
  isOwner: boolean;
  currency?: string;
}

// ==============================================================================
// Delete Confirm Dialog
// ==============================================================================
interface DeleteDialogProps {
  expense: ExpenseWithDetails | null;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function DeleteExpenseDialog({ expense, gymId, gymSlug, onClose }: DeleteDialogProps) {
  const [state, formAction, isPending] = useActionState<ExpenseActionState | null, FormData>(
    deleteExpenseAction,
    null
  );

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <Dialog open={!!expense} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm bg-white border border-line shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">Remove Expense?</DialogTitle>
          <DialogDescription className="text-xs text-muted">
            The expense record will be soft-deleted and preserved in the audit history.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="expenseId" value={expense?.id ?? ""} />
          {state?.error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="del-reason" className="text-xs font-semibold text-ink">Reason for removal</Label>
            <Input id="del-reason" name="reason" placeholder="e.g. Entered in error" className="text-xs bg-canvas border-line rounded-lg" />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8 border-line">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} variant="destructive" className="text-xs h-8 bg-rose-600 hover:bg-rose-700">
              {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Remove Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================================================
// Seed Default Categories Button
// ==============================================================================
function SeedCategoriesButton({ gymId, gymSlug }: { gymId: string; gymSlug: string }) {
  const [state, formAction, isPending] = useActionState<ExpenseActionState | null, FormData>(
    seedDefaultCategoriesAction,
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={isPending}
        className="text-xs h-8 text-pine border-pine/30 hover:bg-pine-soft rounded-lg"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <Settings className="h-3.5 w-3.5 mr-1.5" />
        )}
        Seed Standard Categories
      </Button>
      {state?.error && (
        <span className="text-xs text-rose-600 ml-2">{state.error}</span>
      )}
    </form>
  );
}

export function ExpensesHub({
  expenses,
  categories,
  overview,
  gymId,
  gymSlug,
  isOwner,
  currency = "INR",
}: ExpensesHubProps) {
  const [activeTab, setActiveTab] = useState<"expenses" | "reports" | "categories">("expenses");
  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseWithDetails | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const handleEdit = (expense: ExpenseWithDetails) => {
    setEditExpense(expense);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditExpense(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Operating Expenses"
        description="Track overhead, rent, equipment maintenance, and facility operating costs."
        actions={
          <Button
            className="text-xs h-9 bg-pine hover:bg-pine/90 text-white rounded-lg shadow-xs transition"
            onClick={() => { setEditExpense(null); setFormOpen(true); }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span>Add Expense</span>
          </Button>
        }
      />

      {/* Overview cards */}
      <ExpenseOverviewCards overview={overview} currency={currency} />

      {/* Tabs navigation */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "expenses"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>All Expenses ({expenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "reports"
              ? "border-pine text-pine font-bold"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Category Breakdown</span>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "categories"
                ? "border-pine text-pine font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Cost Centers ({categories.length})</span>
          </button>
        )}
      </div>

      {activeTab === "expenses" && (
        <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-line">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Expense Records</h3>
          </div>
          <div className="p-0">
            <ExpenseListTable
              expenses={expenses}
              categories={categories}
              currency={currency}
              onEdit={handleEdit}
              onDelete={(exp) => setDeleteTarget(exp)}
            />
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <ExpenseCategoryBreakdown
          overview={overview}
          currency={currency}
        />
      )}

      {activeTab === "categories" && isOwner && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              onClick={() => setAddCategoryOpen(true)}
              className="text-xs h-9 bg-pine hover:bg-pine/90 text-white rounded-lg shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Category
            </Button>
            {categories.length === 0 && (
              <SeedCategoriesButton gymId={gymId} gymSlug={gymSlug} />
            )}
          </div>
          <CategoryManagementPanel
            categories={categories}
            gymId={gymId}
            gymSlug={gymSlug}
            onAddClick={() => setAddCategoryOpen(true)}
          />
        </div>
      )}

      {/* Expense Form Modal (Add / Edit) */}
      <ExpenseFormModal
        open={formOpen}
        onClose={handleCloseForm}
        categories={categories}
        expense={editExpense}
        gymId={gymId}
        gymSlug={gymSlug}
      />

      {/* Delete confirmation dialog */}
      <DeleteExpenseDialog
        expense={deleteTarget}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Add category modal */}
      <AddCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        gymId={gymId}
        gymSlug={gymSlug}
      />
    </div>
  );
}
