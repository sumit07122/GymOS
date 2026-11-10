"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateGymSettingsAction, ActionState } from "@/lib/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Building2, MapPin, Clock, Save } from "lucide-react";

interface SettingsFormProps {
  gym: {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string;
    currency: string;
    timezone: string;
    openingHours: string | null;
    taxRate: number;
    taxNumber: string | null;
    logoUrl: string | null;
  };
}

export function SettingsForm({ gym }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    updateGymSettingsAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      <input type="hidden" name="gymId" value={gym.id} />

      {/* Success Notification */}
      {state?.success && (
        <div className="flex items-center gap-3 rounded-xl border border-pine/30 bg-pine-soft p-4 text-xs text-ink shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-pine shrink-0" />
          <div>
            <div className="font-semibold text-pine">Settings Saved</div>
            <div>{state.message || "Gym business profile updated successfully."}</div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {state?.error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <div className="font-semibold">Update Failed</div>
            <div>{state.error}</div>
          </div>
        </div>
      )}

      {/* Basic Identity & Workspace */}
      <Card className="border-line shadow-xs rounded-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-pine" />
            <CardTitle className="text-sm font-bold text-ink">
              Gym Identity & Branding
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted">
            Public business name, URL slug and branding elements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-ink">
                Gym Name <span className="text-rose-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={gym.name}
                required
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
              {state?.fieldErrors?.name && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-xs font-semibold text-ink">
                Workspace Slug (Managed by FIXIA)
              </label>
              <Input
                id="slug"
                name="slug"
                defaultValue={gym.slug}
                disabled
                className="text-xs h-9 bg-canvas/60 text-muted cursor-not-allowed font-mono border-line rounded-lg"
              />
              <p className="text-[10px] text-muted">
                Public website URL: gms.fixia.in/g/{gym.slug}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-ink">
                Business Contact Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={gym.email || ""}
                placeholder="contact@yourgym.com"
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
              {state?.fieldErrors?.email && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-ink">
                Business Phone
              </label>
              <Input
                id="phone"
                name="phone"
                defaultValue={gym.phone || ""}
                placeholder="+91 98765 43210"
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
              {state?.fieldErrors?.phone && (
                <p className="text-[11px] text-rose-600">{state.fieldErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="logoUrl" className="text-xs font-semibold text-ink">
              Gym Brand Logo URL
            </label>
            <Input
              id="logoUrl"
              name="logoUrl"
              defaultValue={gym.logoUrl || ""}
              placeholder="https://yourdomain.com/brand-logo.png"
              className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
            />
            <p className="text-[10px] text-muted">
              Appears on digital membership passes, invoices, receipts, and public website.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location & Physical Facility */}
      <Card className="border-line shadow-xs rounded-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-pine" />
            <CardTitle className="text-sm font-bold text-ink">
              Facility Location & Address
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted">
            Physical gym premise address displayed on invoices and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="addressLine1" className="text-xs font-semibold text-ink">
              Street Address Line 1
            </label>
            <Input
              id="addressLine1"
              name="addressLine1"
              defaultValue={gym.addressLine1 || ""}
              placeholder="123 Fitness Boulevard"
              className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="addressLine2" className="text-xs font-semibold text-ink">
              Suite / Floor / Landmark
            </label>
            <Input
              id="addressLine2"
              name="addressLine2"
              defaultValue={gym.addressLine2 || ""}
              placeholder="Level 2, Premium Sports Complex"
              className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-semibold text-ink">
                City
              </label>
              <Input
                id="city"
                name="city"
                defaultValue={gym.city || ""}
                placeholder="Mumbai"
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="state" className="text-xs font-semibold text-ink">
                State / Province
              </label>
              <Input
                id="state"
                name="state"
                defaultValue={gym.state || ""}
                placeholder="Maharashtra"
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="postalCode" className="text-xs font-semibold text-ink">
                Postal Code
              </label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={gym.postalCode || ""}
                placeholder="400001"
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="country" className="text-xs font-semibold text-ink">
                Country
              </label>
              <Input
                id="country"
                name="country"
                defaultValue={gym.country || "IN"}
                placeholder="IN"
                className="text-xs h-9 uppercase bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Schedule & Regional Billing */}
      <Card className="border-line shadow-xs rounded-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-pine" />
            <CardTitle className="text-sm font-bold text-ink">
              Operating Schedule & Financial Localization
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted">
            Business hours, base currency, timezone, and tax rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="openingHours" className="text-xs font-semibold text-ink">
              Opening Hours Schedule
            </label>
            <textarea
              id="openingHours"
              name="openingHours"
              rows={3}
              defaultValue={gym.openingHours || ""}
              placeholder={"Mon - Fri: 06:00 - 22:00\nSat - Sun: 08:00 - 20:00"}
              className="w-full rounded-lg border border-line bg-canvas p-2.5 text-xs text-ink placeholder:text-muted focus:border-pine focus:outline-hidden focus:ring-1 focus:ring-pine/30"
            />
            <p className="text-[10px] text-muted">
              Displayed on gym public website and front desk check-in kiosk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="currency" className="text-xs font-semibold text-ink">
                Primary Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={gym.currency}
                className="w-full rounded-lg border border-line bg-canvas h-9 px-2.5 text-xs text-ink focus:border-pine focus:outline-hidden focus:ring-1 focus:ring-pine"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="SGD">SGD ($) - Singapore Dollar</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="timezone" className="text-xs font-semibold text-ink">
                Operating Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={gym.timezone}
                className="w-full rounded-lg border border-line bg-canvas h-9 px-2.5 text-xs text-ink focus:border-pine focus:outline-hidden focus:ring-1 focus:ring-pine"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="America/New_York">America/New_York (Eastern)</option>
                <option value="America/Chicago">America/Chicago (Central)</option>
                <option value="America/Denver">America/Denver (Mountain)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="taxRate" className="text-xs font-semibold text-ink">
                Standard GST / Tax Rate (%)
              </label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                defaultValue={gym.taxRate.toString()}
                className="text-xs h-9 bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
              <p className="text-[10px] text-muted">
                Default rate automatically applied to membership invoices.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="taxNumber" className="text-xs font-semibold text-ink">
                GSTIN / Tax ID Registration #
              </label>
              <Input
                id="taxNumber"
                name="taxNumber"
                defaultValue={gym.taxNumber || ""}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className="text-xs h-9 font-mono bg-canvas border-line text-ink rounded-lg focus-visible:ring-pine/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Action */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-pine hover:bg-pine/90 text-white text-xs px-5 h-9 rounded-lg shadow-xs transition"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
