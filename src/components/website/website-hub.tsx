"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, LayoutDashboard } from "lucide-react";
import { WebsiteNavbar } from "./website-navbar";
import { WebsiteHero } from "./website-hero";
import { WebsiteAbout } from "./website-about";
import { WebsiteFacilities } from "./website-facilities";
import { WebsitePlans } from "./website-plans";
import { WebsiteTrainers } from "./website-trainers";
import { WebsiteGallery } from "./website-gallery";
import { WebsiteHoursLocation } from "./website-hours-location";
import { WebsiteEnquiryForm } from "./website-enquiry-form";
import { WebsiteWhatsAppButton } from "./website-whatsapp-button";
import { WebsiteFooter } from "./website-footer";

interface WebsiteHubProps {
  data: {
    gym: {
      id: string;
      name: string;
      slug: string;
      logoUrl?: string | null;
      phone?: string | null;
      email?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      city?: string | null;
      state?: string | null;
      postalCode?: string | null;
      country?: string | null;
      currency: string;
      openingHours?: string | null;
    };
    website: {
      isPublished: boolean;
      headline: string;
      subheadline: string;
      tagline: string;
      heroImageUrl: string;
      aboutText: string;
      primaryColor: string;
      secondaryColor: string;
      facilities: string[];
      galleryUrls: string[];
      featuredTrainers: Array<{
        name: string;
        role: string;
        bio?: string | null;
        imageUrl?: string | null;
      }>;
      whatsAppNumber?: string | null;
      instagramHandle?: string | null;
      facebookUrl?: string | null;
      googleMapsUrl?: string | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      customNotice?: string | null;
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
  };
  isOwnerOrStaff?: boolean;
}

export function WebsiteHub({ data, isOwnerOrStaff = false }: WebsiteHubProps) {
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(
    null
  );
  const { gym, website, plans } = data;

  // Unpublished State Handling:
  // If unpublished AND viewer is not owner/staff, show clean "Website under maintenance" page.
  if (!website.isPublished && !isOwnerOrStaff) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6 shadow-xl">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{gym.name}</h1>
        <p className="mt-3 text-sm text-slate-400 max-w-md">
          Our public website is currently being updated. Please check back soon or visit our facility directly in {gym.city || "town"}.
        </p>

        {gym.phone && (
          <div className="mt-6 text-xs text-slate-300">
            <span>Front Desk Phone: </span>
            <a href={`tel:${gym.phone}`} className="font-semibold text-white underline">
              {gym.phone}
            </a>
          </div>
        )}

        <div className="mt-8">
          <Link href={`/portal/${gym.slug}`}>
            <Button variant="outline" className="text-xs border-slate-700 text-slate-300 hover:text-white">
              Member Portal & Pass
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Unpublished Preview Indicator for Logged-In Gym Staff */}
      {!website.isPublished && isOwnerOrStaff && (
        <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              PREVIEW MODE: This gym website is currently UNPUBLISHED to the public. Only logged-in gym owners/staff can view this page.
            </span>
          </div>
          <Link href={`/${gym.slug}/website`}>
            <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 bg-slate-950 text-white hover:bg-slate-900">
              <LayoutDashboard className="h-3 w-3" />
              <span>Website Settings</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Top Navigation */}
      <WebsiteNavbar
        gym={gym}
        primaryColor={website.primaryColor}
        whatsAppNumber={website.whatsAppNumber}
      />

      {/* Hero Section */}
      <WebsiteHero gym={gym} website={website} />

      {/* About Section */}
      <WebsiteAbout gym={gym} website={website} />

      {/* Facilities Section */}
      <WebsiteFacilities
        facilities={website.facilities}
        primaryColor={website.primaryColor}
      />

      {/* Membership Plans Section */}
      <WebsitePlans
        gym={{ currency: gym.currency }}
        plans={plans}
        primaryColor={website.primaryColor}
        onSelectPlan={(id) => setSelectedPlanId(id)}
      />

      {/* Certified Trainers Section */}
      <WebsiteTrainers
        trainers={website.featuredTrainers}
        primaryColor={website.primaryColor}
      />

      {/* Floor & Equipment Gallery */}
      <WebsiteGallery
        galleryUrls={website.galleryUrls}
        primaryColor={website.primaryColor}
      />

      {/* Hours & Location Section */}
      <WebsiteHoursLocation
        gym={gym}
        googleMapsUrl={website.googleMapsUrl}
        primaryColor={website.primaryColor}
      />

      {/* Lead Enquiry Form */}
      <WebsiteEnquiryForm
        gym={gym}
        plans={plans}
        selectedPlanId={selectedPlanId}
        primaryColor={website.primaryColor}
        whatsAppNumber={website.whatsAppNumber}
      />

      {/* Floating WhatsApp Action Button */}
      <WebsiteWhatsAppButton
        gymName={gym.name}
        whatsAppNumber={website.whatsAppNumber}
      />

      {/* Footer */}
      <WebsiteFooter
        gym={gym}
        primaryColor={website.primaryColor}
        instagramHandle={website.instagramHandle}
        facebookUrl={website.facebookUrl}
      />
    </div>
  );
}
