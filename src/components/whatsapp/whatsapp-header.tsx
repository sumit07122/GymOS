"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Zap,
  ShieldCheck,
  Radio,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/page-header";
import { StatCard } from "@/components/design-system/stat-card";

interface WhatsAppHeaderProps {
  gymName: string;
  isLiveDelivery: boolean;
  provider: string;
  isEnabled: boolean;
  optInRate: number;
  totalSent: number;
  onOpenTestModal: () => void;
  onOpenAnnouncementModal: () => void;
}

export function WhatsAppHeader({
  gymName,
  isLiveDelivery,
  provider,
  isEnabled,
  optInRate,
  totalSent,
  onOpenTestModal,
  onOpenAnnouncementModal,
}: WhatsAppHeaderProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="WhatsApp Business Notifications"
        description={`Automated member welcome cards, renewal notices, payment receipts, and announcements for ${gymName}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTestModal}
              className="text-xs h-9 border-line bg-white hover:bg-canvas text-ink rounded-lg shadow-xs gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-pine" />
              <span>Send Test Message</span>
            </Button>

            <Button
              size="sm"
              onClick={onOpenAnnouncementModal}
              className="text-xs h-9 bg-pine hover:bg-pine/90 text-white rounded-lg shadow-xs gap-1.5 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Broadcast Announcement</span>
            </Button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Gateway Provider"
          value={provider === "META" ? "Meta Cloud API" : provider === "TWILIO" ? "Twilio API" : "Simulated"}
          icon={Radio}
          subtext={isEnabled ? "Active Integration" : "Integration Paused"}
        />
        <StatCard
          label="Environment"
          value={isLiveDelivery ? "Production Live" : "Sandbox"}
          icon={ShieldCheck}
          subtext={isLiveDelivery ? "Live WhatsApp API calls" : "Simulated logs"}
        />
        <StatCard
          label="Member Opt-In Rate"
          value={`${optInRate.toFixed(1)}%`}
          icon={Users}
          subtext="Consented member phone records"
        />
        <StatCard
          label="Total Notifications"
          value={totalSent}
          icon={Send}
          subtext="Delivered messages logged"
        />
      </div>
    </div>
  );
}
