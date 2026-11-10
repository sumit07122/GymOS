"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { bookClassAction, cancelBookingAction } from "@/lib/actions/portal";

interface PortalScheduleTabProps {
  gymSlug: string;
  classes: {
    upcoming: Array<{
      id: string;
      className: string;
      description?: string | null;
      durationMinutes: number;
      instructorName: string;
      startTime: string;
      endTime: string;
      capacity: number;
      bookedCount: number;
      spotsRemaining: number;
      roomLocation?: string | null;
      isBooked: boolean;
      myBookingId?: string | null;
    }>;
    myBookings: Array<{
      id: string;
      scheduleId: string;
      className: string;
      instructorName: string;
      startTime: string;
      endTime: string;
      roomLocation?: string | null;
      status: string;
      bookedAt: string;
    }>;
  };
}

export function PortalScheduleTab({
  gymSlug,
  classes,
}: PortalScheduleTabProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"schedule" | "bookings">(
    "schedule"
  );
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  const handleBook = async (scheduleId: string) => {
    try {
      setProcessingId(scheduleId);
      setActionError(null);
      setActionSuccess(null);

      const res = await bookClassAction(gymSlug, scheduleId);
      if (res.success) {
        setActionSuccess(res.message || "Class booked successfully!");
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(res.error || "Failed to book class.");
      }
    } catch {
      setActionError("Network error while booking class.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel your booking?")) return;
    try {
      setProcessingId(bookingId);
      setActionError(null);
      setActionSuccess(null);

      const res = await cancelBookingAction(gymSlug, bookingId);
      if (res.success) {
        setActionSuccess(res.message || "Booking cancelled.");
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        setActionError(res.error || "Failed to cancel booking.");
      }
    } catch {
      setActionError("Network error while cancelling booking.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Sub-tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Button
          size="sm"
          variant={activeSubTab === "schedule" ? "default" : "outline"}
          onClick={() => setActiveSubTab("schedule")}
          className="text-xs h-8 gap-1.5"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Upcoming Classes ({classes.upcoming.length})</span>
        </Button>
        <Button
          size="sm"
          variant={activeSubTab === "bookings" ? "default" : "outline"}
          onClick={() => setActiveSubTab("bookings")}
          className="text-xs h-8 gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>My Bookings ({classes.myBookings.length})</span>
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {activeSubTab === "schedule" ? (
        /* ================= 1. UPCOMING SCHEDULE ================= */
        <div className="space-y-3">
          {classes.upcoming.length > 0 ? (
            classes.upcoming.map((cls) => {
              const isFull = cls.spotsRemaining <= 0;
              const isBooking = processingId === cls.id;
              const isCancelling = cls.myBookingId && processingId === cls.myBookingId;

              return (
                <div
                  key={cls.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-indigo-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {cls.className}
                        </h3>
                        {cls.isBooked && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Booked
                          </Badge>
                        )}
                        {isFull && !cls.isBooked && (
                          <Badge variant="outline" className="text-slate-400 text-[10px]">
                            Class Full
                          </Badge>
                        )}
                      </div>

                      {cls.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cls.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          <span>
                            {new Date(cls.startTime).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}{" "}
                            at{" "}
                            {new Date(cls.startTime).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-500">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cls.instructorName}</span>
                        </div>

                        {cls.roomLocation && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{cls.roomLocation}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-slate-500">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {cls.spotsRemaining} of {cls.capacity} spots open
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:self-center">
                      {cls.isBooked ? (
                        cls.myBookingId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(cls.myBookingId!)}
                            disabled={!!isCancelling}
                            className="w-full sm:w-auto text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            {isCancelling ? "Cancelling..." : "Cancel Booking"}
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none">
                            Confirmed
                          </Badge>
                        )
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleBook(cls.id)}
                          disabled={isFull || isBooking}
                          className="w-full sm:w-auto text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isBooking ? "Booking..." : isFull ? "Full" : "Book Spot"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
              <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <span>No upcoming classes currently scheduled for this gym.</span>
            </div>
          )}
        </div>
      ) : (
        /* ================= 2. MY BOOKINGS ================= */
        <div className="space-y-3">
          {classes.myBookings.length > 0 ? (
            classes.myBookings.map((bk) => {
              const isCancelling = processingId === bk.id;
              const isPast = new Date(bk.startTime) < new Date();

              return (
                <div
                  key={bk.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {bk.className}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          bk.status === "CONFIRMED"
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : bk.status === "CANCELLED"
                            ? "border-slate-200 text-slate-400"
                            : "border-indigo-200 text-indigo-700"
                        }`}
                      >
                        {bk.status}
                      </Badge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="h-3 w-3" />
                        {new Date(bk.startTime).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(bk.startTime).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span>Instructor: {bk.instructorName}</span>
                      {bk.roomLocation && <span>• Room: {bk.roomLocation}</span>}
                    </div>
                  </div>

                  {bk.status === "CONFIRMED" && !isPast && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(bk.id)}
                      disabled={isCancelling}
                      className="self-start sm:self-auto text-xs h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
              <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <span>You have no active class bookings. Browse the schedule to book a spot!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
