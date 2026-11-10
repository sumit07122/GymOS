"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateWhatsAppConfigAction } from "@/lib/actions/whatsapp";
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface WhatsAppProviderCardProps {
  gymSlug: string;
  config: {
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
    hasAccessToken: boolean;
    hasAuthToken: boolean;
  };
}

export function WhatsAppProviderCard({
  gymSlug,
  config,
}: WhatsAppProviderCardProps) {
  const [provider, setProvider] = React.useState<string>(config.provider);
  const [isEnabled, setIsEnabled] = React.useState<boolean>(config.isEnabled);
  const [isLiveDelivery, setIsLiveDelivery] = React.useState<boolean>(
    config.isLiveDelivery
  );

  const [phoneNumberId, setPhoneNumberId] = React.useState(
    config.phoneNumberId || ""
  );
  const [wabaId, setWabaId] = React.useState(config.wabaId || "");
  const [accessToken, setAccessToken] = React.useState("");

  const [accountSid, setAccountSid] = React.useState(config.accountSid || "");
  const [authToken, setAuthToken] = React.useState("");
  const [senderPhoneNumber, setSenderPhoneNumber] = React.useState(
    config.senderPhoneNumber || ""
  );

  const [isPending, setIsPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; error?: boolean } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      setMessage(null);

      const res = await updateWhatsAppConfigAction(gymSlug, {
        provider,
        isEnabled,
        isLiveDelivery,
        phoneNumberId: phoneNumberId || null,
        wabaId: wabaId || null,
        accessToken: accessToken ? accessToken : undefined,
        accountSid: accountSid || null,
        authToken: authToken ? authToken : undefined,
        senderPhoneNumber: senderPhoneNumber || null,
      });

      if (res.success) {
        setMessage({ text: res.message || "Settings saved successfully." });
        setAccessToken("");
        setAuthToken("");
      } else {
        setMessage({ text: res.error || "Failed to update configuration.", error: true });
      }
    } catch {
      setMessage({ text: "An error occurred while saving configuration.", error: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            WhatsApp Provider Connection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect an official Meta WhatsApp Cloud API or Twilio Messaging account to dispatch verified notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {config.isLiveDelivery ? (
            <Badge className="bg-emerald-600 text-white gap-1 text-[11px]">
              <ShieldCheck className="h-3 w-3" />
              Live Delivery Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[11px]"
            >
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Delivery Status: Sandbox / Pending Verification
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-5 space-y-5">
        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.error
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {message.error ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Provider Platform
            </Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOCK_SANDBOX" className="text-xs">
                  Sandbox & Mock Mode (Recommended for Testing)
                </SelectItem>
                <SelectItem value="META_CLOUD_API" className="text-xs">
                  Meta WhatsApp Cloud API (Official Platform)
                </SelectItem>
                <SelectItem value="TWILIO" className="text-xs">
                  Twilio WhatsApp API
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              Mock Sandbox mode generates simulated delivery receipts without consuming provider credits.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Notification System Status
            </Label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Enable Automated WhatsApp Alerts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isLiveDelivery}
                  onChange={(e) => setIsLiveDelivery(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Live Delivery (Requires Verified Provider)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Leave &quot;Live Delivery&quot; unchecked if Meta account is pending verification.
            </p>
          </div>
        </div>

        {/* Meta Cloud API Fields */}
        {provider === "META_CLOUD_API" && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Meta WhatsApp Cloud API Credentials</span>
              </span>
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Meta Developer Console</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Phone Number ID
                </Label>
                <Input
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. 104829104829104"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  WhatsApp Business Account (WABA) ID
                </Label>
                <Input
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  placeholder="e.g. 192837465019283"
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  System User Permanent Access Token
                </Label>
                <Input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder={
                    config.hasAccessToken
                      ? `Stored securely: ${config.accessTokenMasked}`
                      : "Paste EAAG... access token"
                  }
                  className="text-xs font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Access tokens are stored securely on the server and never exposed in client payloads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Twilio Fields */}
        {provider === "TWILIO" && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Twilio WhatsApp Messaging Credentials
              </span>
              <a
                href="https://console.twilio.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Twilio Console</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Twilio Account SID
                </Label>
                <Input
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                  placeholder="e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Sender Phone Number
                </Label>
                <Input
                  value={senderPhoneNumber}
                  onChange={(e) => setSenderPhoneNumber(e.target.value)}
                  placeholder="e.g. +14155238886"
                  className="text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Auth Token
                </Label>
                <Input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder={
                    config.hasAuthToken
                      ? `Stored securely: ${config.authTokenMasked}`
                      : "Paste Twilio Auth Token"
                  }
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sandbox Notice */}
        {provider === "MOCK_SANDBOX" && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Sandbox Integration Mode Active</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">
              In sandbox mode, you can test triggers for all 7 business events, inspect rendered templates, simulate member consent, test idempotency, and review notification logs without needing an approved Meta/Twilio business account.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Save Provider Credentials
          </Button>
        </div>
      </form>
    </div>
  );
}

