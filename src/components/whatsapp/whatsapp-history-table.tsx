"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { retryWhatsAppNotificationAction } from "@/lib/actions/whatsapp";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Clock,
} from "lucide-react";

interface NotificationRow {
  id: string;
  eventType: string;
  templateName: string;
  recipientPhone: string;
  recipientName?: string | null;
  messageBody: string;
  status: string;
  provider: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  maxRetries: number;
  sentAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  readAt?: string | Date | null;
  createdAt: string | Date;
  member?: {
    id: string;
    memberCode: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface WhatsAppHistoryTableProps {
  gymSlug: string;
  notifications: NotificationRow[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export function WhatsAppHistoryTable({
  gymSlug,
  notifications: initialNotifications,
  pagination,
}: WhatsAppHistoryTableProps) {
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [viewingItem, setViewingItem] = React.useState<NotificationRow | null>(null);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const handleRetry = async (notificationId: string) => {
    try {
      setRetryingId(notificationId);
      setActionError(null);
      const res = await retryWhatsAppNotificationAction(gymSlug, notificationId);

      if (res.success && "notification" in res && res.notification) {
        const notif = res.notification;
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  status: notif.status,
                  retryCount: notif.retryCount,
                  errorMessage: notif.errorMessage,
                  sentAt: notif.sentAt,
                }
              : n
          )
        );
      } else {
        setActionError(
          "error" in res && res.error ? String(res.error) : "Retry failed."
        );
      }
    } catch {
      setActionError("Unexpected failure retrying message.");
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READ":
        return (
          <Badge className="bg-sky-50 text-sky-700 border border-sky-300 gap-1 text-[10px]">
            <CheckCircle2 className="h-2.5 w-2.5 text-sky-600" />
            Read
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 gap-1 text-[10px]">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
            Delivered
          </Badge>
        );
      case "SENT":
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 gap-1 text-[10px]">
            <Clock className="h-2.5 w-2.5 text-blue-600" />
            Sent (Pending Delivery)
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border border-rose-300 gap-1 text-[10px]">
            <AlertCircle className="h-2.5 w-2.5 text-rose-600" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Notification Audit Trail & Delivery History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of dispatched messages, provider references, delivery timestamps, and retry statuses.
          </p>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing {notifications.length} of {pagination.totalCount} records
        </div>
      </div>

      {actionError && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Recipient</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Delivery Status</th>
              <th className="py-2.5 px-3">Provider ID</th>
              <th className="py-2.5 px-3">Sent At</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No notifications recorded yet. Automated messages will appear here once triggered.
                </td>
              </tr>
            ) : (
              notifications.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <div>{item.eventType.replace(/_/g, " ")}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.templateName}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-700">
                    <div>{item.recipientName || item.member?.firstName || "Prospect / User"}</div>
                    {item.member && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.member.memberCode}
                      </div>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                    {item.recipientPhone}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex flex-col gap-0.5">
                      {getStatusBadge(item.status)}
                      {item.errorMessage && (
                        <span className="text-[10px] text-rose-500 max-w-xs truncate" title={item.errorMessage}>
                          {item.errorMessage}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={item.providerMessageId || ""}>
                    {item.providerMessageId || "—"}
                  </td>

                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {item.sentAt
                      ? new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                        " " +
                        new Date(item.sentAt).toLocaleDateString()
                      : new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingItem(item)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
                        title="View Message Text"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {item.status === "FAILED" && item.retryCount < item.maxRetries && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={retryingId === item.id}
                          onClick={() => handleRetry(item.id)}
                          className="h-7 text-[10px] px-2 border-slate-300 text-slate-700 hover:bg-slate-100 gap-1"
                        >
                          {retryingId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          <span>Retry ({item.retryCount}/{item.maxRetries})</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Message Details Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Notification Details: {viewingItem?.eventType.replace(/_/g, " ")}
            </DialogTitle>
          </DialogHeader>

          {viewingItem && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400">Recipient:</span>
                  <div className="font-semibold text-slate-800">
                    {viewingItem.recipientName || "Member"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Phone:</span>
                  <div className="font-mono text-slate-800">
                    {viewingItem.recipientPhone}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Provider:</span>
                  <div className="font-semibold text-slate-800">
                    {viewingItem.provider}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Delivery Status:</span>
                  <div>{getStatusBadge(viewingItem.status)}</div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Rendered WhatsApp Message Body:
                </span>
                <div className="rounded-xl border border-slate-200 bg-emerald-50/30 p-3 font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingItem.messageBody}
                </div>
              </div>

              {viewingItem.errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                  <strong>Error details:</strong> {viewingItem.errorMessage}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

