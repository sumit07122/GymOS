"use client";

import * as React from "react";
import { WhatsAppHeader } from "./whatsapp-header";
import { WhatsAppProviderCard } from "./whatsapp-provider-card";
import { WhatsAppPreferencesCard } from "./whatsapp-preferences-card";
import { WhatsAppTemplatesCard } from "./whatsapp-templates-card";
import { WhatsAppConsentTable } from "./whatsapp-consent-table";
import { WhatsAppHistoryTable } from "./whatsapp-history-table";
import { WhatsAppTestModal } from "./whatsapp-test-modal";
import { WhatsAppAnnouncementModal } from "./whatsapp-announcement-modal";
import {
  Settings,
  BellRing,
  FileCheck2,
  Users,
  History,
} from "lucide-react";

interface WhatsAppConfigData {
  provider: string;
  isEnabled: boolean;
  isLiveDelivery: boolean;
  phoneNumberId?: string | null;
  wabaId?: string | null;
  accessTokenMasked?: string | null;
  accountSid?: string | null;
  authTokenMasked?: string | null;
  senderPhoneNumber?: string | null;
  webhookVerifyToken?: string | null;
  notifyOnMembershipCreated: boolean;
  notifyOnMembershipExpiring: boolean;
  expiryReminderDays: number;
  notifyOnPaymentReceived: boolean;
  notifyOnDuesOverdue: boolean;
  notifyOnBookingConfirmed: boolean;
  notifyOnBookingCancelled: boolean;
  customHeader?: string | null;
  customFooter?: string | null;
  hasAccessToken: boolean;
  hasAuthToken: boolean;
}

interface TemplateData {
  id: string;
  eventType: string;
  templateName: string;
  languageCode: string;
  headerText?: string | null;
  bodyText: string;
  footerText?: string | null;
  status: string;
  variables?: string | null;
}

interface MemberConsentItem {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  whatsappConsent: boolean;
  whatsappConsentAt?: string | Date | null;
  whatsappConsentSource?: string | null;
}

interface NotificationHistoryItem {
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

interface WhatsAppHubProps {
  gym: {
    id: string;
    name: string;
    slug: string;
    phone?: string | null;
  };
  config: WhatsAppConfigData;
  templates: TemplateData[];
  consentData: {
    members: MemberConsentItem[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
      consentedCount: number;
      optInRate: number;
    };
  };
  historyData: {
    notifications: NotificationHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
    };
  };
}

export function WhatsAppHub({
  gym,
  config,
  templates,
  consentData,
  historyData,
}: WhatsAppHubProps) {
  const [activeTab, setActiveTab] = React.useState<
    "preferences" | "provider" | "templates" | "consent" | "history"
  >("preferences");

  const [testModalOpen, setTestModalOpen] = React.useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <WhatsAppHeader
        gymName={gym.name}
        isLiveDelivery={config.isLiveDelivery}
        provider={config.provider}
        isEnabled={config.isEnabled}
        optInRate={consentData.pagination.optInRate}
        totalSent={historyData.pagination.totalCount}
        onOpenTestModal={() => setTestModalOpen(true)}
        onOpenAnnouncementModal={() => setAnnouncementModalOpen(true)}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "preferences"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BellRing className="h-3.5 w-3.5" />
          <span>Automation Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("provider")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "provider"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Provider Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "templates"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Approved Templates (7)</span>
        </button>

        <button
          onClick={() => setActiveTab("consent")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "consent"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Member Opt-In ({consentData.pagination.consentedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Delivery History ({historyData.pagination.totalCount})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "preferences" && (
        <WhatsAppPreferencesCard gymSlug={gym.slug} config={config} />
      )}

      {activeTab === "provider" && (
        <WhatsAppProviderCard gymSlug={gym.slug} config={config} />
      )}

      {activeTab === "templates" && (
        <WhatsAppTemplatesCard gymSlug={gym.slug} templates={templates} />
      )}

      {activeTab === "consent" && (
        <WhatsAppConsentTable
          gymSlug={gym.slug}
          members={consentData.members}
          pagination={consentData.pagination}
        />
      )}

      {activeTab === "history" && (
        <WhatsAppHistoryTable
          gymSlug={gym.slug}
          notifications={historyData.notifications}
          pagination={historyData.pagination}
        />
      )}

      {/* Modals */}
      <WhatsAppTestModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        gymSlug={gym.slug}
        defaultPhone={gym.phone}
      />

      <WhatsAppAnnouncementModal
        open={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        gymSlug={gym.slug}
        optedInCount={consentData.pagination.consentedCount}
      />
    </div>
  );
}

