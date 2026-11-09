"use client";

import * as React from "react";
import { useActionState } from "react";
import { importMembersCsvAction, MemberActionState } from "@/lib/actions/member";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2, FileText, Info } from "lucide-react";

interface CsvImportModalProps {
  gymId: string;
  gymSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CsvImportModal({
  gymId,
  gymSlug,
  isOpen,
  onClose,
}: CsvImportModalProps) {
  const [csvText, setCsvText] = React.useState("");

  const [state, formAction, isPending] = useActionState<MemberActionState | null, FormData>(
    importMembersCsvAction,
    null
  );

  const sampleCsv = `First Name,Last Name,Phone,Email,Address,Emergency Contact,Emergency Phone\nMarcus,Aurelius,+15551234567,marcus@rome.com,120 Roman Way,Faustina,+15559876543\nBruce,Wayne,+15552345678,bruce@wayne.com,1007 Mountain Drive,Alfred,+15558765432`;

  const handleInsertSample = () => {
    setCsvText(sampleCsv);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText((event.target?.result as string) || "");
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white border border-slate-200 shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Upload className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Bulk Import Members from CSV
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Import existing member rosters. Email and phone duplicates within the gym will be safely flagged.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-2">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="csvContent" value={csvText} />

          {/* Feedback messages */}
          {state?.success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{state.message}</div>
                {state.skippedCount && state.skippedCount > 0 ? (
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    {state.skippedCount} row(s) were skipped due to format or duplicate errors.
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {state?.error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Import Failed</div>
                <div className="text-[11px] mt-0.5">{state.error}</div>
              </div>
            </div>
          )}

          {state?.importErrors && state.importErrors.length > 0 && (
            <div className="max-h-28 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1 text-amber-950">
                <Info className="h-3.5 w-3.5" />
                <span>Row Validation Notices:</span>
              </div>
              {state.importErrors.map((err, idx) => (
                <div key={idx} className="font-mono text-[10px]">
                  • {err}
                </div>
              ))}
            </div>
          )}

          {/* File Picker or Paste Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <label htmlFor="csv-textarea">CSV Content</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-medium text-emerald-600 hover:text-emerald-700 underline">
                  Upload file
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                >
                  Insert template
                </button>
              </div>
            </div>

            <textarea
              id="csv-textarea"
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="First Name,Last Name,Phone,Email,Address..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="rounded-lg bg-slate-100 p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
            <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Required Headers: </span>
              <span className="font-mono text-[10px]">First Name, Last Name</span>. Optional:{" "}
              <span className="font-mono text-[10px]">Phone, Email, Address, Emergency Contact</span>.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !csvText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5"
            >
              {isPending ? "Validating & Importing..." : "Start Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

