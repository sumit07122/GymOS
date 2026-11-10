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
import { sendTestWhatsAppMessageAction } from "@/lib/actions/whatsapp";
import { Zap, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface WhatsAppTestModalProps {
  open: boolean;
  onClose: () => void;
  gymSlug: string;
  defaultPhone?: string | null;
}

export function WhatsAppTestModal({
  open,
  onClose,
  gymSlug,
  defaultPhone,
}: WhatsAppTestModalProps) {
  const [recipientPhone, setRecipientPhone] = React.useState(defaultPhone || "");
  const [recipientName, setRecipientName] = React.useState("Staff / Owner");
  const [messageText, setMessageText] = React.useState(
    "Testing WhatsApp integration connectivity from FIXIA GymOS."
  );

  const [isPending, setIsPending] = React.useState(false);
  const [result, setResult] = React.useState<{ text: string; error?: boolean } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      setResult(null);

      const res = await sendTestWhatsAppMessageAction(gymSlug, {
        recipientPhone,
        recipientName,
        messageText,
      });

      if (res.success) {
        setResult({
          text:
            "message" in res && res.message
              ? res.message
              : "Test message sent successfully.",
        });
      } else {
        setResult({
          text:
            "error" in res && res.error
              ? String(res.error)
              : "Failed to deliver test message.",
          error: true,
        });
      }
    } catch {
      setResult({ text: "An error occurred while sending test message.", error: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Send Sandbox / Connectivity Test</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 py-2 text-xs">
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
              Recipient Phone Number (with Country Code)
            </Label>
            <Input
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g. +15551234567"
              className="text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Recipient Name
            </Label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. John Doe"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Test Message Text
            </Label>
            <Textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="text-xs"
              required
            />
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
              disabled={isPending}
              className="text-xs bg-slate-900 text-white hover:bg-slate-800"
            >
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Send Test Message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

