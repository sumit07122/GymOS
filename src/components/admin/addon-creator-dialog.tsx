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
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-indigo-600/30"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Create Add-on</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-white text-base">New SaaS Add-on</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Define a reusable tier add-on that gym subscriptions can purchase.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="mt-3 rounded-lg bg-rose-950/50 border border-rose-800 p-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Add-on Name *</label>
                <Input
                  required
                  placeholder="e.g. 5,000 WhatsApp Notification Pack"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Unique Code *</label>
                <Input
                  required
                  placeholder="ADDON_WA_5K"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Monthly Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Annual Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Feature Entitlement Key *</label>
                <Input
                  required
                  placeholder="WHATSAPP_NOTIFICATIONS or CUSTOM_DOMAIN"
                  value={formData.featureKey}
                  onChange={(e) => setFormData({ ...formData, featureKey: e.target.value })}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <Input
                  placeholder="Includes 5,000 automated transaction alerts per month"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-950 border-slate-700 text-white text-xs h-9"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Add-on"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
