"use client";

import * as React from "react";
import { Clock, MapPin, Phone, Mail, Navigation } from "lucide-react";

interface WebsiteHoursLocationProps {
  gym: {
    name: string;
    phone?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    openingHours?: string | null;
  };
  googleMapsUrl?: string | null;
  primaryColor: string;
}

export function WebsiteHoursLocation({
  gym,
  googleMapsUrl,
  primaryColor,
}: WebsiteHoursLocationProps) {
  const fullAddress = [
    gym.addressLine1,
    gym.addressLine2,
    gym.city,
    gym.state,
    gym.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const directionsUrl =
    googleMapsUrl ||
    (fullAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${gym.name}, ${fullAddress}`
        )}`
      : null);

  return (
    <section id="location" className="py-20 sm:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Hours & Operations */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-3" style={{ color: primaryColor }}>
              <Clock className="h-4 w-4" />
              <span>Operating Hours</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              When You Can Train
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Staffed front desk hours and active facility access times.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs sm:text-sm">
                <span className="font-semibold text-white">Monday – Friday</span>
                <span className="font-mono text-slate-300">06:00 – 22:00</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs sm:text-sm">
                <span className="font-semibold text-white">Saturday</span>
                <span className="font-mono text-slate-300">07:00 – 20:00</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white">Sunday & Holidays</span>
                <span className="font-mono text-slate-300">08:00 – 18:00</span>
              </div>
            </div>

            {gym.openingHours && (
              <div className="mt-6 rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Schedule Notes
                </span>
                <p>{gym.openingHours}</p>
              </div>
            )}
          </div>

          {/* Right: Location & Address */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-3" style={{ color: primaryColor }}>
              <MapPin className="h-4 w-4" />
              <span>Location & Directions</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Visit {gym.name}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Convenient access with ample member parking and public transit connections.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Facility Address</span>
                  <p className="text-slate-300 mt-0.5">
                    {fullAddress || "Contact front desk for physical location"}
                  </p>
                </div>
              </div>

              {gym.phone && (
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <Phone className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Front Desk Phone</span>
                    <a href={`tel:${gym.phone}`} className="text-slate-300 hover:text-white">
                      {gym.phone}
                    </a>
                  </div>
                </div>
              )}

              {gym.email && (
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">Inquiries Email</span>
                    <a href={`mailto:${gym.email}`} className="text-slate-300 hover:text-white">
                      {gym.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {directionsUrl && (
              <div className="mt-8 pt-4 border-t border-slate-800">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
