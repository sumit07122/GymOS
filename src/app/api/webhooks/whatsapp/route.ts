import { NextRequest, NextResponse } from "next/server";
import { handleWhatsAppWebhookStatusUpdate } from "@/lib/services/whatsapp.service";
import { db } from "@/lib/db";

// ==============================================================================
// FIXIA GymOS — WhatsApp Webhook Handler (Meta Cloud API / Twilio)
// ==============================================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "fixia_gymos_webhook_verify_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden: Invalid verification token", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta Cloud API structure: entry[].changes[].value.statuses[]
    const entries = Array.isArray(body?.entry) ? body.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value || {};

        // 1. Process delivery receipts (sent, delivered, read, failed)
        const statuses = Array.isArray(value?.statuses) ? value.statuses : [];
        for (const st of statuses) {
          const timestamp = st.timestamp
            ? parseInt(st.timestamp, 10) * 1000
            : undefined;

          await handleWhatsAppWebhookStatusUpdate({
            providerMessageId: st.id,
            status: st.status,
            timestamp,
            errorCode: st.errors?.[0]?.code ? String(st.errors[0].code) : undefined,
            errorMessage: st.errors?.[0]?.title || st.errors?.[0]?.message,
          }).catch((err) => {
            console.warn("WhatsApp status webhook error:", err);
          });
        }

        // 2. Process inbound messages (handle compliance opt-out STOP keywords)
        const messages = Array.isArray(value?.messages) ? value.messages : [];
        for (const msg of messages) {
          const text = msg.text?.body?.trim().toUpperCase();
          const senderPhone = msg.from; // e.g. "917017936338"
          if (["STOP", "UNSUBSCRIBE", "OPTOUT", "CANCEL"].includes(text) && senderPhone) {
            await db.member
              .updateMany({
                where: { phone: { contains: senderPhone.slice(-10) } },
                data: {
                  whatsappConsent: false,
                  whatsappConsentAt: new Date(),
                  whatsappConsentSource: "INBOUND_KEYWORD_STOP",
                },
              })
              .catch((err) => {
                console.warn("Failed to process WhatsApp opt-out keyword:", err);
              });
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (err: unknown) {
    console.error("WhatsApp webhook processing error:", err);
    // Meta expects 200 OK to acknowledge receipt
    return NextResponse.json({ success: false, error: "Internal processing error" }, { status: 200 });
  }
}
