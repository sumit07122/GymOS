import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

export const viewport: Viewport = {
  themeColor: "#0B6B4F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FIXIA GymOS — Commercial Multi-Tenant Gym SaaS",
  description:
    "Unified operating system for gym and fitness businesses. Manage members, attendance, billing, leads, and operations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FIXIA GymOS",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans overflow-x-hidden">
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-canvas text-ink font-sans selection:bg-pine-soft selection:text-pine">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
