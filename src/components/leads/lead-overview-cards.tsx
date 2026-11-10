"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  UserCheck,
  Clock,
} from "lucide-react";
import { LeadCrmMetrics } from "@/lib/services/lead.service";
import { StatCard } from "@/components/design-system/stat-card";

interface LeadOverviewCardsProps {
  metrics: LeadCrmMetrics;
}

export function LeadOverviewCards({ metrics }: LeadOverviewCardsProps) {
  const { totalLeads, activePipelineLeads, conversionRate, followUps } = metrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Enquiries"
        value={totalLeads}
        icon={Users}
        subtext="All-time prospect enquiries"
      />
      <StatCard
        label="Active Pipeline"
        value={activePipelineLeads}
        icon={TrendingUp}
        subtext="New, contacted, or trial leads"
      />
      <StatCard
        label="Conversion Rate"
        value={`${conversionRate.toFixed(1)}%`}
        icon={UserCheck}
        trend={{
          value: `${conversionRate.toFixed(0)}%`,
          isPositive: true,
        }}
        subtext="Trials converted to members"
      />
      <StatCard
        label="Follow-ups Scheduled"
        value={followUps.upcoming + followUps.today}
        icon={Clock}
        trend={
          followUps.overdue > 0
            ? { value: `${followUps.overdue} overdue`, isPositive: false }
            : undefined
        }
        subtext="Touchpoints on schedule"
      />
    </div>
  );
}
