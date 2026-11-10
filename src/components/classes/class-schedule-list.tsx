"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  Ban,
  Search,
  MapPin,
} from "lucide-react";
import { ScheduleWithDetails } from "@/lib/services/class.service";
import { ClassStatus } from "@prisma/client";

interface ClassScheduleListProps {
  schedules: ScheduleWithDetails[];
  onBook: (schedule: ScheduleWithDetails) => void;
  onCancelSchedule: (schedule: ScheduleWithDetails) => void;
  canManage: boolean;
}

const STATUS_BADGES: Record<ClassStatus, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", className: "bg-amber-100 text-amber-800" },
  COMPLETED: { label: "Completed", className: "bg-slate-100 text-slate-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

export function ClassScheduleList({
  schedules,
  onBook,
  onCancelSchedule,
  canManage,
}: ClassScheduleListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = schedules.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.class.name.toLowerCase().includes(q) ||
        (s.instructor?.name?.toLowerCase().includes(q) ?? false) ||
        (s.roomLocation?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Search class, instructor, or room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-slate-500">
        Showing {filtered.length} scheduled session{filtered.length !== 1 ? "s" : ""}
      </div>

      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Class</TableHead>
              <TableHead className="text-xs">Date & Time</TableHead>
              <TableHead className="text-xs">Instructor</TableHead>
              <TableHead className="text-xs">Room</TableHead>
              <TableHead className="text-xs">Capacity</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs text-slate-400 py-10">
                  No sessions match current filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const isFull = s.bookedCount >= s.capacity;
                const canBookSession = s.status === ClassStatus.SCHEDULED && !isFull;
                const startDate = new Date(s.startTime);
                const endDate = new Date(s.endTime);

                return (
                  <TableRow key={s.id} className="hover:bg-slate-50 text-xs">
                    <TableCell className="font-semibold text-slate-800">
                      {s.class.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {startDate.toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {startDate.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          –{" "}
                          {endDate.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {s.instructor?.name || "TBA"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {s.roomLocation ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{s.roomLocation}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span
                          className={`font-medium ${
                            isFull ? "text-red-600" : "text-slate-700"
                          }`}
                        >
                          {s.bookedCount} / {s.capacity}
                        </span>
                        {isFull && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Full
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-normal ${STATUS_BADGES[s.status]?.className ?? ""}`}
                      >
                        {STATUS_BADGES[s.status]?.label ?? s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canBookSession}
                          className="h-7 text-xs px-2"
                          onClick={() => onBook(s)}
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                        {canManage && s.status === ClassStatus.SCHEDULED && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onCancelSchedule(s)}
                            title="Cancel session"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
