/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSubscriptionAddonAction } from "@/lib/actions/platform-admin";

export function AddonCreatorDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    description: "",
    monthlyPrice: "499",
    yearlyPrice: "4990",
    featureKey: "WHATSAPP_MESSAGES_PACK_1000",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const res = await createSubscriptionAddonAction({
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
        yearlyPrice: parseFloat(formData.yearlyPrice) || 0,
        featureKey: formData.featureKey,
        isActive: true,
      });
      if (res && !res.success) {
        setError(res.error || "Failed to create add-on");
      } else {
        setOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create add-on");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-pine hover:bg-pine/90 text-white font-semibold text-xs h-9 rounded-lg gap-1.5 shadow-xs transition"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span>Create Add-on</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-line text-ink sm:max-w-md rounded-xl shadow-xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-ink text-base font-bold">New SaaS Add-on</DialogTitle>
              <DialogDescription className="text-muted text-xs">
                Define a reusable tier add-on that gym subscriptions can purchase.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="text-ink font-semibold">Add-on Name *</label>
                <Input
                  required
                  placeholder="e.g. 5,000 WhatsApp Notification Pack"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Unique Code *</label>
                <Input
                  required
                  placeholder="ADDON_WA_5K"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-white border-line text-ink text-xs h-9 font-mono focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-ink font-semibold">Monthly Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-ink font-semibold">Annual Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Feature Entitlement Key *</label>
                <Input
                  required
                  placeholder="WHATSAPP_NOTIFICATIONS or CUSTOM_DOMAIN"
                  value={formData.featureKey}
                  onChange={(e) => setFormData({ ...formData, featureKey: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 font-mono focus:ring-pine/30 focus:border-pine"
                />
              </div>

              <div className="space-y-1">
                <label className="text-ink font-semibold">Description</label>
                <Input
                  placeholder="Includes 5,000 automated transaction alerts per month"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-line text-ink text-xs h-9 focus:ring-pine/30 focus:border-pine"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-line">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-xs h-9 border-line"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-pine hover:bg-pine/90 text-white text-xs font-semibold h-9"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : "Save Add-on"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
