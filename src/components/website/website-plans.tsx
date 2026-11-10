"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, ArrowRight, Zap } from "lucide-react";

interface WebsitePlansProps {
  gym: {
    currency: string;
  };
  plans: Array<{
    id: string;
    name: string;
    description?: string | null;
    durationDays: number;
    durationMonths: number;
    price: number;
    admissionFee: number;
    benefits: string[];
    accessRestrictions: string[];
  }>;
  primaryColor: string;
  onSelectPlan?: (planId: string) => void;
}

export function WebsitePlans({
  gym,
  plans,
  primaryColor,
  onSelectPlan,
}: WebsitePlansProps) {
  const handleSelect = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
    const target = document.getElementById("enquire");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="plans" className="py-20 sm:py-28 bg-slate-900 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
            <Zap className="h-4 w-4" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Membership Plans Tailored to Your Goals
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            No hidden maintenance surprises. Full digital pass access, clean facilities, and community support included.
          </p>
        </div>

        {plans.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan, idx) => {
              const isPopular = idx === 1 || plans.length === 1;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 ${
                    isPopular
                      ? "bg-slate-950 border-2 shadow-2xl scale-[1.02]"
                      : "bg-slate-950/70 border border-slate-800 hover:border-slate-700"
                  }`}
                  style={{
                    borderColor: isPopular ? primaryColor : undefined,
                  }}
                >
                  {isPopular && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md flex items-center gap-1"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Zap className="h-3 w-3 fill-current" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white capitalize">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                          {plan.description || "Comprehensive gym floor access and member benefits."}
                        </p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="mt-6 flex items-baseline gap-1.5 border-b border-slate-800 pb-6">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                        {gym.currency} {plan.price.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        / {plan.durationDays} days
                      </span>
                    </div>

                    {plan.admissionFee > 0 && (
                      <div className="mt-2 text-[11px] text-slate-400">
                        + {gym.currency} {plan.admissionFee.toFixed(0)} one-time registration
                      </div>
                    )}

                    {/* Benefits List */}
                    <div className="mt-6 space-y-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                        Included Features
                      </span>
                      {plan.benefits.map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Restrictions if any */}
                    {plan.accessRestrictions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80">
                        {plan.accessRestrictions.map((res, rIdx) => (
                          <div key={rIdx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8 pt-4">
                    <Button
                      onClick={() => handleSelect(plan.id)}
                      className="w-full text-xs font-bold py-3 rounded-xl text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: isPopular ? primaryColor : "#1e293b",
                      }}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-xs text-slate-400">
            Membership plans are currently being updated. Please submit an inquiry below for current rates!
          </div>
        )}
      </div>
    </section>
  );
}
