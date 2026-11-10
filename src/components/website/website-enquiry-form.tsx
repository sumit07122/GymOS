"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/actions/website";

interface WebsiteEnquiryFormProps {
  gym: {
    name: string;
    slug: string;
  };
  plans: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  selectedPlanId?: string | null;
  primaryColor: string;
  whatsAppNumber?: string | null;
}

export function WebsiteEnquiryForm({
  gym,
  plans,
  selectedPlanId,
  primaryColor,
  whatsAppNumber,
}: WebsiteEnquiryFormProps) {
  const [prevSelectedPlanId, setPrevSelectedPlanId] = React.useState(selectedPlanId);
  const [chosenPlanId, setChosenPlanId] = React.useState<string>(
    selectedPlanId || ""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sync selected plan from external selection if prop changes
  if (selectedPlanId !== prevSelectedPlanId) {
    setPrevSelectedPlanId(selectedPlanId);
    setChosenPlanId(selectedPlanId || "");
  }

  const cleanWaNumber = whatsAppNumber?.replace(/[^0-9]/g, "") || "";
  const waUrl = cleanWaNumber
    ? `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
        `Hi ${gym.name}, I'd like more information about membership plans and free trial passes!`
      )}`
    : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const form = e.currentTarget;
      const formData = new FormData(form);
      if (chosenPlanId) {
        formData.set("interestedPlanId", chosenPlanId);
      }

      const res = await submitPublicEnquiryAction(gym.slug, formData);
      if (res.success) {
        setSuccessMessage(
          res.message ||
            "Thank you! Your inquiry was received. We will be in touch shortly."
        );
        form.reset();
        setChosenPlanId("");
      } else {
        setError(res.error || "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setError("Network connection error. Please try again or reach out on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="enquire" className="py-20 sm:py-28 bg-slate-900 text-white border-t border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold mb-2"
            style={{ color: primaryColor }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Get Started</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Take Your First Step at {gym.name}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Have questions about memberships or want to claim a complimentary day pass? Send an inquiry and our team will get in touch today.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-10 shadow-2xl">
          {successMessage ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Inquiry Received!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                {successMessage}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuccessMessage(null)}
                  className="text-xs border-slate-700 text-slate-300 hover:text-white"
                >
                  Send Another Inquiry
                </Button>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat Instantly on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-slate-300">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    placeholder="e.g. Alex"
                    className="bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-slate-300">
                    Last Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    placeholder="e.g. Mercer"
                    className="bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-300">
                    Phone / Mobile <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    className="bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                    Email Address (optional)
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alex@example.com"
                    className="bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Interested Membership Plan Dropdown */}
              {plans.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="planSelect" className="text-xs font-semibold text-slate-300">
                    Interested Membership Plan
                  </Label>
                  <select
                    id="planSelect"
                    value={chosenPlanId}
                    onChange={(e) => setChosenPlanId(e.target.value)}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">General Inquiry / Free Day Pass</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-300">
                  Questions or Fitness Goals
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Tell us about what you're looking for, best time to call, or request a tour..."
                  className="bg-slate-900 border-slate-800 text-white text-xs focus:border-indigo-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto text-xs font-bold px-8 py-3 h-11 rounded-xl text-white shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? "Sending Inquiry..." : "Submit Inquiry"}</span>
                </Button>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Prefer WhatsApp? Message directly</span>
                  </a>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
