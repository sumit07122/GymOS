"use client";

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
import { Pencil, Plus, Users, Clock } from "lucide-react";
import { Class } from "@prisma/client";

interface ClassListTableProps {
  classes: Class[];
  onEdit: (cls: Class) => void;
  onSchedule: (cls: Class) => void;
  canManage: boolean;
}

export function ClassListTable({
  classes,
  onEdit,
  onSchedule,
  canManage,
}: ClassListTableProps) {
  if (classes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No class templates configured yet. Click &quot;New Class&quot; to define your first group class.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs">Class Name</TableHead>
            <TableHead className="text-xs">Description</TableHead>
            <TableHead className="text-xs">Duration</TableHead>
            <TableHead className="text-xs">Capacity</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            {canManage && <TableHead className="text-xs w-28 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((c) => (
            <TableRow key={c.id} className="hover:bg-slate-50 text-xs">
              <TableCell className="font-semibold text-slate-800">{c.name}</TableCell>
              <TableCell className="text-slate-500 max-w-xs truncate">
                {c.description || "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{c.durationMinutes} mins</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-slate-600">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span>{c.defaultCapacity} slots</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={c.isActive ? "default" : "secondary"}
                  className={`text-[10px] font-normal ${
                    c.isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""
                  }`}
                >
                  {c.isActive ? "Active" : "Archived"}
                </Badge>
              </TableCell>
              {canManage && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={() => onSchedule(c)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-500"
                      onClick={() => onEdit(c)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

