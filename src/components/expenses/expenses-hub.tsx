"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Remove Expense?</DialogTitle>
          <DialogDescription className="text-xs">
            The expense record will be soft-deleted and preserved in the audit history. This action cannot remove the financial record.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="expenseId" value={expense?.id ?? ""} />
          {state?.error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="del-reason" className="text-xs">Reason for removal</Label>
            <Input id="del-reason" name="reason" placeholder="e.g. Entered in error" className="text-sm" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} variant="destructive" className="text-xs h-8">
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
      {state?.error && <p className="text-xs text-red-500 mt-1">{state.error}</p>}
      <Button type="submit" size="sm" variant="outline" className="text-xs h-7" disabled={isPending}>
        {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
        Restore Default Categories
      </Button>
    </form>
  );
}

// ==============================================================================
// Main Hub
// ==============================================================================
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage your gym&apos;s operating expenses.
          </p>
        </div>
        <Button
          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 w-fit"
          onClick={() => { setEditExpense(null); setFormOpen(true); }}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Expense
        </Button>
      </div>

      {/* Overview cards */}
      <ExpenseOverviewCards overview={overview} currency={currency} />

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === "expenses" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("expenses")}
          className={`text-xs gap-1.5 ${
            activeTab === "expenses"
              ? "bg-slate-900 text-white"
              : "text-slate-600"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          All Expenses
        </Button>

        <Button
          variant={activeTab === "reports" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("reports")}
          className={`text-xs gap-1.5 ${
            activeTab === "reports"
              ? "bg-slate-900 text-white"
              : "text-slate-600"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Expense Reports
        </Button>

        {isOwner && (
          <Button
            variant={activeTab === "categories" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("categories")}
            className={`text-xs gap-1.5 ${
              activeTab === "categories"
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Categories
          </Button>
        )}
      </div>

      {activeTab === "expenses" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-700">All Expenses</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ExpenseListTable
              expenses={expenses}
              categories={categories}
              onEdit={handleEdit}
              onDelete={(e) => setDeleteTarget(e)}
              currency={currency}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "reports" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-slate-700">Expense Analysis</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ExpenseCategoryBreakdown overview={overview} currency={currency} />
          </CardContent>
        </Card>
      )}

      {isOwner && activeTab === "categories" && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Expense Categories</CardTitle>
            <SeedCategoriesButton gymId={gymId} gymSlug={gymSlug} />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <CategoryManagementPanel
              categories={categories}
              gymId={gymId}
              gymSlug={gymSlug}
              onAddClick={() => setAddCategoryOpen(true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ExpenseFormModal
        open={formOpen}
        expense={editExpense}
        categories={categories}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={handleCloseForm}
      />

      <DeleteExpenseDialog
        expense={deleteTarget}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setDeleteTarget(null)}
      />

      <AddCategoryModal
        open={addCategoryOpen}
        gymId={gymId}
        gymSlug={gymSlug}
        onClose={() => setAddCategoryOpen(false)}
      />
    </div>
  );
}

