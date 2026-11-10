"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@prisma/client";

interface ExerciseLibraryTableProps {
  exercises: Exercise[];
}

export function ExerciseLibraryTable({ exercises }: ExerciseLibraryTableProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No exercises found. Add your first exercise to populate the library.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs">Exercise Name</TableHead>
            <TableHead className="text-xs">Primary Muscle Group</TableHead>
            <TableHead className="text-xs">Description / Form Cues</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((ex) => (
            <TableRow key={ex.id} className="hover:bg-slate-50 text-xs">
              <TableCell className="font-semibold text-slate-800">{ex.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {ex.muscleGroup || "General"}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 max-w-md truncate">
                {ex.description || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

