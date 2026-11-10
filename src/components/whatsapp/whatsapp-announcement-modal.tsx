"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { sendGymAnnouncementAction } from "@/lib/actions/whatsapp";
import { Send, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface WhatsAppAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  gymSlug: string;
  optedInCount: number;
}

export function WhatsAppAnnouncementModal({
  open,
  onClose,
  gymSlug,
  optedInCount,
}: WhatsAppAnnouncementModalProps) {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [result, setResult] = React.useState<{ text: string; error?: boolean } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      setResult(null);

      const res = await sendGymAnnouncementAction(gymSlug, {
        target: "ALL_OPTED_IN_MEMBERS",
        title,
        message,
      });

      if (res.success) {
        setResult({
          text:
            "message" in res && res.message
              ? res.message
              : "Announcement dispatched successfully.",
        });
        setTitle("");
        setMessage("");
      } else {
        setResult({
          text:
            "error" in res && res.error
              ? String(res.error)
              : "Failed to dispatch announcement.",
          error: true,
        });
      }
    } catch {
      setResult({ text: "An unexpected error occurred.", error: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="h-4 w-4 text-emerald-600" />
            <span>Broadcast Gym Announcement</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleBroadcast} className="space-y-4 py-2 text-xs">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-emerald-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Opt-In Compliance Enforced</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              This announcement will be safely dispatched to <strong>{optedInCount} active members</strong> who have granted WhatsApp messaging consent.
            </p>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                result.error
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {result.error ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              <span>{result.text}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Announcement Title / Subject
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Special Holiday Hours / New Olympic Platforms"
              className="text-xs"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Announcement Message Body
            </Label>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement message here..."
              className="text-xs"
              required
              maxLength={1000}
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Supports WhatsApp bold formatting with *asterisks*.</span>
              <span>{message.length} / 1000</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !title.trim() || !message.trim()}
              className="text-xs bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Send Announcement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

