/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Phone,
  Clock,
  Search,
} from "lucide-react";
import { updateWebsiteConfigAction, WebsiteActionState } from "@/lib/actions/website";

const COLOR_PRESETS = [
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Emerald", hex: "#059669" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Amber", hex: "#d97706" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Orange", hex: "#ea580c" },
];

interface WebsiteOwnerControlsProps {
  gym: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    openingHours?: string | null;
  };
  initialConfig: any;
}

export function WebsiteOwnerControls({
  gym,
  initialConfig,
}: WebsiteOwnerControlsProps) {
  const [state, formAction, isPending] = useActionState<
    WebsiteActionState | null,
    FormData
  >(updateWebsiteConfigAction, null);

  const [isPublished, setIsPublished] = React.useState<boolean>(
    initialConfig.isPublished ?? true
  );
  const [primaryColor, setPrimaryColor] = React.useState<string>(
    initialConfig.primaryColor || "#4f46e5"
  );

  // Facilities manager
  const [facilities, setFacilities] = React.useState<string[]>(() => {
    try {
      return typeof initialConfig.facilities === "string"
        ? JSON.parse(initialConfig.facilities)
        : initialConfig.facilities || [];
    } catch {
      return [];
    }
  });
  const [newFacility, setNewFacility] = React.useState("");

  // Gallery manager
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>(() => {
    try {
      return typeof initialConfig.galleryUrls === "string"
        ? JSON.parse(initialConfig.galleryUrls)
        : initialConfig.galleryUrls || [];
    } catch {
      return [];
    }
  });
  const [newGalleryUrl, setNewGalleryUrl] = React.useState("");

  const handleAddFacility = () => {
    if (!newFacility.trim()) return;
    setFacilities([...facilities, newFacility.trim()]);
    setNewFacility("");
  };

  const handleRemoveFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setGalleryUrls([...galleryUrls, newGalleryUrl.trim()]);
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* 1. Header & Live Website Preview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {gym.name} Public Website
              </h2>
              <Badge
                className={
                  isPublished
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                    : "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                }
              >
                {isPublished ? "Published & Live" : "Unpublished (Draft)"}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              URL: <span className="font-mono text-indigo-600">/gym/{gym.slug}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/gym/${gym.slug}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 border-slate-300"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Live Website</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {state?.success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-semibold">Website Published</div>
            <div>{state.message}</div>
          </div>
        </div>
      )}

      {state?.error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <div className="font-semibold">Save Failed</div>
            <div>{state.error}</div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="gymId" value={gym.id} />
        <input type="hidden" name="gymSlug" value={gym.slug} />
        <input type="hidden" name="isPublished" value={isPublished ? "true" : "false"} />
        <input type="hidden" name="primaryColor" value={primaryColor} />
        <input type="hidden" name="facilities" value={JSON.stringify(facilities)} />
        <input type="hidden" name="galleryUrls" value={JSON.stringify(galleryUrls)} />

        {/* 2. Publication Status & Branding Palette */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Publication Status & Brand Accent
              </h3>
            </div>
            <Button
              type="button"
              variant={isPublished ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPublished(!isPublished)}
              className="text-xs h-8"
              style={{
                backgroundColor: isPublished ? primaryColor : undefined,
              }}
            >
              {isPublished ? "Status: Live (Click to Unpublish)" : "Status: Draft (Click to Publish)"}
            </Button>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 block mb-2">
              Primary Brand Accent Color
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.hex}
                  onClick={() => setPrimaryColor(preset.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    primaryColor === preset.hex
                      ? "border-slate-900 ring-2 ring-slate-900/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-inner"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-slate-400 font-mono">Custom:</span>
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-24 text-xs font-mono h-8"
                  placeholder="#4f46e5"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-xs font-semibold text-slate-700">
                Gym Logo URL
              </Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                defaultValue={gym.logoUrl || ""}
                placeholder="https://example.com/logo.png"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="heroImageUrl" className="text-xs font-semibold text-slate-700">
                Hero Background Image URL
              </Label>
              <Input
                id="heroImageUrl"
                name="heroImageUrl"
                defaultValue={initialConfig.heroImageUrl || ""}
                placeholder="https://images.unsplash.com/photo-..."
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* 3. Hero & Content Copy */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Hero Section Copy
            </h3>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="headline" className="text-xs font-semibold text-slate-700">
              Hero Headline (Main Hook)
            </Label>
            <Input
              id="headline"
              name="headline"
              defaultValue={initialConfig.headline || ""}
              placeholder="Forge Strength & Peak Vitality at Your Gym"
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subheadline" className="text-xs font-semibold text-slate-700">
              Subheadline (Description)
            </Label>
            <Textarea
              id="subheadline"
              name="subheadline"
              rows={2}
              defaultValue={initialConfig.subheadline || ""}
              placeholder="State-of-the-art strength training, expert coaching, and sauna recovery in your neighborhood."
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tagline" className="text-xs font-semibold text-slate-700">
                Tagline / Badge
              </Label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue={initialConfig.tagline || ""}
                placeholder="Built for Consistency. Engineered for Results."
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customNotice" className="text-xs font-semibold text-slate-700">
                Special Promo / Banner Notice
              </Label>
              <Input
                id="customNotice"
                name="customNotice"
                defaultValue={initialConfig.customNotice || ""}
                placeholder="Limited Offer: Claim a complimentary day pass this week!"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label htmlFor="aboutText" className="text-xs font-semibold text-slate-700">
              About the Gym (Full Story)
            </Label>
            <Textarea
              id="aboutText"
              name="aboutText"
              rows={4}
              defaultValue={initialConfig.aboutText || ""}
              placeholder="Write about your gym philosophy, founding story, coaching standards, and welcoming atmosphere..."
              className="text-xs"
            />
          </div>
        </div>

        {/* 4. Facilities Manager */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Gym Amenities & Facilities
          </h3>

          <div className="flex gap-2">
            <Input
              type="text"
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              placeholder="e.g. Cold Plunge, Olympic Lifting, Cardio Deck"
              className="text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFacility();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddFacility}
              className="text-xs h-9 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Facility</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {facilities.map((fac, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 border border-slate-200"
              >
                <span>{fac}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 5. Photo Gallery Manager */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Facility Photo Gallery
            </h3>
          </div>

          <div className="flex gap-2">
            <Input
              type="url"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGalleryUrl();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddGalleryUrl}
              className="text-xs h-9 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Photo</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {galleryUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-28 group"
              >
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryUrl(idx)}
                  className="absolute top-1.5 right-1.5 rounded-md bg-black/70 p-1 text-white hover:bg-rose-600 transition-colors opacity-90"
                  title="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Contact, WhatsApp & Location Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Contact & Social Channels
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="whatsAppNumber" className="text-xs font-semibold text-slate-700">
                WhatsApp Phone Number
              </Label>
              <Input
                id="whatsAppNumber"
                name="whatsAppNumber"
                defaultValue={initialConfig.whatsAppNumber || gym.phone || ""}
                placeholder="+15550199"
                className="text-xs h-9"
              />
              <span className="text-[10px] text-slate-400">
                Allows visitors to chat directly on WhatsApp.
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Front Desk Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={gym.phone || ""}
                placeholder="+1 (555) 0100"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Inquiries Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={gym.email || ""}
                placeholder="contact@yourgym.com"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instagramHandle" className="text-xs font-semibold text-slate-700">
                Instagram Handle
              </Label>
              <Input
                id="instagramHandle"
                name="instagramHandle"
                defaultValue={initialConfig.instagramHandle || ""}
                placeholder="@yourgymname"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="addressLine1" className="text-xs font-semibold text-slate-700">
                Facility Street Address
              </Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                defaultValue={gym.addressLine1 || ""}
                placeholder="123 Fitness Boulevard"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
                City / Town
              </Label>
              <Input
                id="city"
                name="city"
                defaultValue={gym.city || ""}
                placeholder="New York"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="openingHours" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Opening Hours Schedule Text</span>
            </Label>
            <Input
              id="openingHours"
              name="openingHours"
              defaultValue={
                gym.openingHours ||
                "Mon - Fri: 06:00 - 22:00 | Sat: 07:00 - 20:00 | Sun: 08:00 - 18:00"
              }
              placeholder="Mon - Fri: 06:00 - 22:00 | Sat - Sun: 08:00 - 20:00"
              className="text-xs h-9"
            />
          </div>
        </div>

        {/* 7. SEO Meta Tags */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Search className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Search Engine Optimization (SEO)
            </h3>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seoTitle" className="text-xs font-semibold text-slate-700">
              SEO Page Title
            </Label>
            <Input
              id="seoTitle"
              name="seoTitle"
              defaultValue={initialConfig.seoTitle || ""}
              placeholder={`${gym.name} | Best Gym & Fitness in ${gym.city || "Town"}`}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seoDescription" className="text-xs font-semibold text-slate-700">
              SEO Meta Description
            </Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              defaultValue={initialConfig.seoDescription || ""}
              placeholder="Join today for top-rated strength training, group classes, and sauna recovery in your neighborhood."
              className="text-xs"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white shadow-2xl border border-slate-800">
          <div className="text-xs text-slate-400">
            Changes are published live to <strong className="text-white">/gym/{gym.slug}</strong>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="text-xs font-bold h-9 px-6 rounded-xl shadow-lg gap-1.5 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Publishing Changes..." : "Save & Publish"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
