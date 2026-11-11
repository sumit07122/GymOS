import { describe, it, expect } from "vitest";
import { GET as healthGet } from "@/app/api/health/route";
import { GET as whatsappGet, POST as whatsappPost } from "@/app/api/webhooks/whatsapp/route";
import { POST as razorpayPost } from "@/app/api/webhooks/razorpay/route";
import { cleanErrorMessage } from "@/components/admin/onboard-gym-form";
import { NextRequest } from "next/server";

describe("Production Infrastructure & Webhooks Suite", () => {
  it("health endpoint returns structured JSON with version and database telemetry", async () => {
    const res = await healthGet();
    expect([200, 503]).toContain(res.status);
    const data = await res.json();
    expect(data).toHaveProperty("status");
    expect(data.version).toBe("2.4.0");
    expect(data).toHaveProperty("database");
    expect(data.database).toHaveProperty("status");
  });

  it("whatsapp webhook GET verifies Meta subscription challenge", async () => {
    const validUrl = "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=fixia_gymos_webhook_verify_token&hub.challenge=test_challenge_123";
    const req = new NextRequest(validUrl);
    const res = await whatsappGet(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("test_challenge_123");
  });

  it("whatsapp webhook GET rejects invalid verify tokens", async () => {
    const invalidUrl = "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=invalid_token&hub.challenge=123";
    const req = new NextRequest(invalidUrl);
    const res = await whatsappGet(req);
    expect(res.status).toBe(403);
  });

  it("whatsapp webhook POST successfully handles delivery status receipts", async () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                statuses: [
                  {
                    id: "msg-test-123",
                    status: "delivered",
                    timestamp: "1700000000",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = new NextRequest("https://example.com/api/webhooks/whatsapp", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await whatsappPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("cleanErrorMessage strips raw JSON arrays into human-readable strings", () => {
    const rawZodJson = '[{"origin":"string","code":"too_small","minimum":8,"inclusive":true,"path":["ownerPassword"],"message":"Password must be at least 8 characters"}]';
    const cleaned = cleanErrorMessage(rawZodJson);
    expect(cleaned).toBe("Password must be at least 8 characters");
    expect(cleaned).not.toContain("[");
    expect(cleaned).not.toContain("{");

    expect(cleanErrorMessage("Direct error message")).toBe("Direct error message");
    expect(cleanErrorMessage(null)).toBe("");
  });

  it("razorpay webhook safely ignores events missing payment entity", async () => {
    const req = new NextRequest("https://example.com/api/webhooks/razorpay", {
      method: "POST",
      body: JSON.stringify({ event: "dummy.event", payload: {} }),
    });
    const res = await razorpayPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ignored_no_payment_entity");
  });
});
