/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Camera, X } from "lucide-react";

interface WebsiteGalleryProps {
  galleryUrls: string[];
  primaryColor: string;
}

export function WebsiteGallery({
  galleryUrls,
  primaryColor,
}: WebsiteGalleryProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  if (!galleryUrls || galleryUrls.length === 0) return null;

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-slate-900 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: primaryColor }}>
            <Camera className="h-4 w-4" />
            <span>Tour the Floor</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Photo Gallery
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            A glimpse into the environment, strength floor, and recovery zones waiting for you.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {galleryUrls.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(url)}
              className="group relative overflow-hidden rounded-[16px] bg-white/[0.03] border border-white/10 p-2 shadow-sm ring-1 ring-white/5 cursor-pointer hover:border-white/20 transition-all hover:-translate-y-0.5"
            >
              <div className="relative h-60 w-full overflow-hidden rounded-[12px] bg-slate-800">
                <img
                  src={url}
                  alt={`Gym facility photo ${idx + 1}`}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />
                <div className="absolute bottom-2.5 right-2.5 rounded-[8px] bg-slate-950/70 backdrop-blur-md px-2 py-1 text-[10px] font-semibold text-slate-300 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Full
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2"
              aria-label="Close preview"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged facility preview"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
