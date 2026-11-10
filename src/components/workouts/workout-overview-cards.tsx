"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, ClipboardList, Users, TrendingUp } from "lucide-react";

interface WorkoutOverviewCardsProps {
  totalExercises: number;
  totalPlans: number;
  activeAssignments: number;
  totalLogs: number;
}

export function WorkoutOverviewCards({
  totalExercises,
  totalPlans,
  activeAssignments,
  totalLogs,
}: WorkoutOverviewCardsProps) {
  const cards = [
    {
      label: "Exercise Library",
      value: totalExercises.toString(),
      sub: "Catalogued movements",
      icon: Dumbbell,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Workout Plans",
      value: totalPlans.toString(),
      sub: "Custom training templates",
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Plan Assignments",
      value: activeAssignments.toString(),
      sub: "Members on active routine",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Fitness Progress Entries",
      value: totalLogs.toString(),
      sub: "Weight & measurement logs",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-md ${card.bg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 truncate">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

