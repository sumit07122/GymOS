import * as React from "react";
import { requireOwnerSession } from "@/lib/auth/guards";
import GymWhatsAppPage from "@/app/(dashboard)/[gymSlug]/whatsapp/page";

export default async function OwnerWhatsAppPage() {
  const { gym } = await requireOwnerSession("/owner/whatsapp");
  return <GymWhatsAppPage params={Promise.resolve({ gymSlug: gym.slug })} />;
}
