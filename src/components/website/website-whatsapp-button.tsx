"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";

interface WebsiteWhatsAppButtonProps {
  gymName: string;
  whatsAppNumber?: string | null;
}

export function WebsiteWhatsAppButton({
  gymName,
  whatsAppNumber,
}: WebsiteWhatsAppButtonProps) {
  const cleanNumber = whatsAppNumber?.replace(/[^0-9]/g, "");

  if (!cleanNumber) return null;

  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Hello ${gymName}! I have a question about gym membership.`
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-2xl hover:bg-emerald-500 hover:scale-105 transition-all text-xs font-bold"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 fill-current" />
      <span className="hidden sm:inline">Chat with Us</span>
    </a>
  );
}
