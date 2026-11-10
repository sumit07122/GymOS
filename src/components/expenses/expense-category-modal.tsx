"use client";

import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  ExpenseActionState,
} from "@/lib/actions/expense";
import { ExpenseCategory } from "@prisma/client";

// ==============================================================================
// Add Category Dialog
// ==============================================================================
interface AddCategoryModalProps {
  open: boolean;
  gymId: string;
  gymSlug: string;
  onClose: () => void;
}

function AddCategoryInner({ gymId, gymSlug, onClose }: Omit<AddCategoryModalProps, "open">) {
  const [state, formAction, isPending] = useActionState<ExpenseActionState | null, FormData>(
    createCategoryAction,
    null
  );

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="cat-name" className="text-xs">Category Name *</Label>
        <Input
          id="cat-name"
          name="name"
          placeholder="e.g. Insurance"
          className="text-sm"
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
          {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
          Add Category
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddCategoryModal({ open, gymId, gymSlug, onClose }: AddCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Add Expense Category</DialogTitle>
          <DialogDescription className="text-xs">
            Create a custom category for this gym.
          </DialogDescription>
        </DialogHeader>
        <AddCategoryInner key={open ? "open" : "closed"} gymId={gymId} gymSlug={gymSlug} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

// ==============================================================================
// Category Management Panel (list + delete)
// ==============================================================================
interface CategoryManagementPanelProps {
  categories: ExpenseCategory[];
  gymId: string;
  gymSlug: string;
  onAddClick: () => void;
}

function DeleteCategoryButton({
  categoryId,
  gymId,
  gymSlug,
}: {
  categoryId: string;
  gymId: string;
  gymSlug: string;
}) {
  const [state, formAction, isPending] = useActionState<ExpenseActionState | null, FormData>(
    deleteCategoryAction,
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="gymSlug" value={gymSlug} />
      <input type="hidden" name="categoryId" value={categoryId} />
      {state?.error && (
        <span className="text-xs text-red-500 mr-2">{state.error}</span>
      )}
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        disabled={isPending}
        className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
        title="Delete category"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      </Button>
    </form>
  );
}

export function CategoryManagementPanel({
  categories,
  gymId,
  gymSlug,
  onAddClick,
}: CategoryManagementPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{categories.length} categories</p>
        <Button
          size="sm"
          className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700"
          onClick={onAddClick}
        >
          + Add Category
        </Button>
      </div>
      <div className="rounded-md border border-slate-200 overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50"
              >
                <span className="text-slate-700">{cat.name}</span>
                <DeleteCategoryButton
                  categoryId={cat.id}
                  gymId={gymId}
                  gymSlug={gymSlug}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-slate-400">
        Categories with existing expenses cannot be deleted.
      </p>
    </div>
  );
}

