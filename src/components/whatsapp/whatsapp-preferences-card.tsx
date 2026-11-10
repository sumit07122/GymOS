"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWhatsAppConfigAction } from "@/lib/actions/whatsapp";
import { WhatsAppProviderType } from "@prisma/client";
import {
  Bell,
  CreditCard,
  Calendar,
  Clock,
  Receipt,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface WhatsAppPreferencesCardProps {
  gymSlug: string;
  config: {
    provider: string;
    isEnabled: boolean;
    isLiveDelivery: boolean;
    notifyOnMembershipCreated: boolean;
    notifyOnMembershipExpiring: boolean;
    expiryReminderDays: number;
    notifyOnPaymentReceived: boolean;
    notifyOnDuesOverdue: boolean;
    notifyOnBookingConfirmed: boolean;
    notifyOnBookingCancelled: boolean;
    customHeader?: string | null;
    customFooter?: string | null;
  };
}

export function WhatsAppPreferencesCard({
  gymSlug,
  config,
}: WhatsAppPreferencesCardProps) {
  const [notifyOnMembershipCreated, setNotifyOnMembershipCreated] =
    React.useState(config.notifyOnMembershipCreated);
  const [notifyOnMembershipExpiring, setNotifyOnMembershipExpiring] =
    React.useState(config.notifyOnMembershipExpiring);
  const [expiryReminderDays, setExpiryReminderDays] = React.useState(
    String(config.expiryReminderDays || 3)
  );
  const [notifyOnPaymentReceived, setNotifyOnPaymentReceived] = React.useState(
    config.notifyOnPaymentReceived
  );
  const [notifyOnDuesOverdue, setNotifyOnDuesOverdue] = React.useState(
    config.notifyOnDuesOverdue
  );
  const [notifyOnBookingConfirmed, setNotifyOnBookingConfirmed] = React.useState(
    config.notifyOnBookingConfirmed
  );
  const [notifyOnBookingCancelled, setNotifyOnBookingCancelled] = React.useState(
    config.notifyOnBookingCancelled
  );

  const [customHeader, setCustomHeader] = React.useState(
    config.customHeader || ""
  );
  const [customFooter, setCustomFooter] = React.useState(
    config.customFooter || ""
  );

  const [isPending, setIsPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; error?: boolean } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      setMessage(null);

      const res = await updateWhatsAppConfigAction(gymSlug, {
        provider: config.provider as WhatsAppProviderType,
        isEnabled: config.isEnabled,
        isLiveDelivery: config.isLiveDelivery,
        notifyOnMembershipCreated,
        notifyOnMembershipExpiring,
        expiryReminderDays: parseInt(expiryReminderDays, 10) || 3,
        notifyOnPaymentReceived,
        notifyOnDuesOverdue,
        notifyOnBookingConfirmed,
        notifyOnBookingCancelled,
        customHeader: customHeader || null,
        customFooter: customFooter || null,
      });

      if (res.success) {
        setMessage({ text: "Notification preferences and triggers updated." });
      } else {
        setMessage({ text: res.error || "Failed to update preferences.", error: true });
      }
    } catch {
      setMessage({ text: "Error saving preferences.", error: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="pb-5 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">
          Automated Event Triggers & Notification Rules
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select which gym operations automatically dispatch WhatsApp messages to opted-in members.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-5 space-y-6">
        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.error
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {message.error ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Triggers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Membership Welcome */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  New Membership Welcome
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnMembershipCreated}
                  onChange={(e) => setNotifyOnMembershipCreated(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Dispatches welcome card with plan name, validity dates, and member code upon plan assignment.
              </p>
            </div>
          </div>

          {/* 2. Expiry Reminder */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Membership Expiry Reminder
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnMembershipExpiring}
                  onChange={(e) => setNotifyOnMembershipExpiring(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[11px] text-slate-500">Send reminder:</span>
                <Select
                  value={expiryReminderDays}
                  onValueChange={setExpiryReminderDays}
                >
                  <SelectTrigger className="h-7 w-28 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" className="text-xs">1 day before</SelectItem>
                    <SelectItem value="3" className="text-xs">3 days before</SelectItem>
                    <SelectItem value="5" className="text-xs">5 days before</SelectItem>
                    <SelectItem value="7" className="text-xs">7 days before</SelectItem>
                    <SelectItem value="14" className="text-xs">14 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 3. Payment Receipt */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Payment Receipt
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnPaymentReceived}
                  onChange={(e) => setNotifyOnPaymentReceived(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Immediately dispatches official receipt with transaction ID and remaining balance when payment is logged.
              </p>
            </div>
          </div>

          {/* 4. Dues Reminder */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Outstanding Dues Reminder
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnDuesOverdue}
                  onChange={(e) => setNotifyOnDuesOverdue(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Notifies members with overdue invoices to settle pending dues via the front desk or payment link.
              </p>
            </div>
          </div>

          {/* 5. Class Booking Confirmation */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Class Booking Confirmation
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnBookingConfirmed}
                  onChange={(e) => setNotifyOnBookingConfirmed(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Dispatches class time, coach name, and preparation guidelines upon reservation.
              </p>
            </div>
          </div>

          {/* 6. Booking Cancellation */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700 shrink-0 mt-0.5">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Booking Cancellation Alert
                </span>
                <input
                  type="checkbox"
                  checked={notifyOnBookingCancelled}
                  onChange={(e) => setNotifyOnBookingCancelled(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Confirms booking release when a member or coach cancels a scheduled session.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Branding Overrides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Custom Header Text (Optional)
            </Label>
            <Input
              value={customHeader}
              onChange={(e) => setCustomHeader(e.target.value)}
              placeholder="e.g. Iron Pulse Fitness"
              maxLength={60}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Custom Footer Text (Optional)
            </Label>
            <Input
              value={customFooter}
              onChange={(e) => setCustomFooter(e.target.value)}
              placeholder="e.g. Reply STOP to opt out"
              maxLength={60}
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Save Automation Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

