"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";

interface ClassesOverviewCardsProps {
  totalClasses: number;
  totalSchedules: number;
  totalBookings: number;
  upcomingToday: number;
}

export function ClassesOverviewCards({
  totalClasses,
  totalSchedules,
  totalBookings,
  upcomingToday,
}: ClassesOverviewCardsProps) {
  const cards = [
    {
      label: "Active Classes",
      value: totalClasses.toString(),
      sub: "Configured class formats",
      icon: Calendar,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Scheduled Sessions",
      value: totalSchedules.toString(),
      sub: "Active & upcoming",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Bookings",
      value: totalBookings.toString(),
      sub: "Confirmed reservations",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Today's Sessions",
      value: upcomingToday.toString(),
      sub: "Happening today",
      icon: CheckCircle,
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
