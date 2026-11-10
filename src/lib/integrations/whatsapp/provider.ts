/* eslint-disable @typescript-eslint/no-explicit-any */
import { WhatsAppProviderType } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — WhatsApp Provider Abstraction (M17)
// ==============================================================================

export interface ProviderSendResult {
  success: boolean;
  providerMessageId?: string;
  rawResponse?: any;
  error?: string;
  statusCode?: number;
}

export interface TemplateMessageParams {
  recipientPhone: string;
  templateName: string;
  languageCode: string;
  parameters: Record<string, string | number>;
  renderedBody: string;
  headerText?: string | null;
  footerText?: string | null;
}

export interface TextMessageParams {
  recipientPhone: string;
  messageText: string;
}

export interface WhatsAppProvider {
  readonly type: WhatsAppProviderType;
  sendTemplate(params: TemplateMessageParams): Promise<ProviderSendResult>;
  sendText(params: TextMessageParams): Promise<ProviderSendResult>;
  checkHealth(): Promise<{ healthy: boolean; message: string }>;
}

// ------------------------------------------------------------------------------
// 1. MOCK / SANDBOX PROVIDER (Zero External Network Overhead & Deterministic Testing)
// ------------------------------------------------------------------------------

export class MockSandboxWhatsAppProvider implements WhatsAppProvider {
  readonly type = WhatsAppProviderType.MOCK_SANDBOX;

  private simulateFailures: boolean;

  constructor(options?: { simulateFailures?: boolean }) {
    this.simulateFailures = options?.simulateFailures ?? false;
  }

  async sendTemplate(params: TemplateMessageParams): Promise<ProviderSendResult> {
    // If the phone number is designated test failure e.g. +10000000000 or flag set
    if (this.simulateFailures || params.recipientPhone.includes("0000000")) {
      return {
        success: false,
        error: "Provider rejected message: Simulated sandbox carrier rejection.",
        statusCode: 400,
        rawResponse: {
          error: {
            message: "Simulated sandbox error: Invalid or unreachable recipient phone number.",
            code: 131026,
            type: "OAuthException",
          },
        },
      };
    }

    const mockId = `wamid.mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      success: true,
      providerMessageId: mockId,
      rawResponse: {
        messaging_product: "whatsapp",
        contacts: [{ input: params.recipientPhone, wa_id: params.recipientPhone.replace(/\+/g, "") }],
        messages: [{ id: mockId, message_status: "accepted" }],
      },
    };
  }

  async sendText(params: TextMessageParams): Promise<ProviderSendResult> {
    if (this.simulateFailures || params.recipientPhone.includes("0000000")) {
      return {
        success: false,
        error: "Provider rejected text message: Simulated sandbox carrier rejection.",
        statusCode: 400,
      };
    }

    const mockId = `wamid.mock_txt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      success: true,
      providerMessageId: mockId,
      rawResponse: {
        messaging_product: "whatsapp",
        messages: [{ id: mockId, message_status: "accepted" }],
      },
    };
  }

  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    return {
      healthy: true,
      message: "Sandbox provider active and accepting simulated messages.",
    };
  }
}

// ------------------------------------------------------------------------------
// 2. META CLOUD API PROVIDER (Official Graph API Platform)
// ------------------------------------------------------------------------------

export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  readonly type = WhatsAppProviderType.META_CLOUD_API;

  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion = "v18.0";

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  async sendTemplate(params: TemplateMessageParams): Promise<ProviderSendResult> {
    try {
      const cleanPhone = params.recipientPhone.replace(/[^0-9]/g, "");
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

      // Format Meta template components
      const bodyParameters = Object.values(params.parameters).map((val) => ({
        type: "text",
        text: String(val),
      }));

      const components: any[] = [];
      if (bodyParameters.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParameters,
        });
      }

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "template",
        template: {
          name: params.templateName,
          language: {
            code: params.languageCode || "en_US",
          },
          components: components.length > 0 ? components : undefined,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `Meta Cloud API responded with HTTP ${response.status}`,
          statusCode: response.status,
          rawResponse: data,
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return {
        success: true,
        providerMessageId: messageId,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to communicate with Meta Cloud API.",
      };
    }
  }

  async sendText(params: TextMessageParams): Promise<ProviderSendResult> {
    try {
      const cleanPhone = params.recipientPhone.replace(/[^0-9]/g, "");
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: false,
          body: params.messageText,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `Meta Cloud API error: HTTP ${response.status}`,
          statusCode: response.status,
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerMessageId: data?.messages?.[0]?.id,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Network exception reaching Meta Cloud API.",
      };
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    if (!this.phoneNumberId || !this.accessToken) {
      return {
        healthy: false,
        message: "Missing Meta Phone Number ID or Access Token credentials.",
      };
    }

    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          healthy: false,
          message: data?.error?.message || `Meta verification returned HTTP ${res.status}`,
        };
      }
      return {
        healthy: true,
        message: `Connected to verified Meta WhatsApp phone: ${data?.display_phone_number || this.phoneNumberId}`,
      };
    } catch (err: any) {
      return {
        healthy: false,
        message: err?.message || "Unable to reach Meta Graph API endpoint.",
      };
    }
  }
}

// ------------------------------------------------------------------------------
// 3. TWILIO WHATSAPP API PROVIDER
// ------------------------------------------------------------------------------

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  readonly type = WhatsAppProviderType.TWILIO;

  private accountSid: string;
  private authToken: string;
  private senderPhoneNumber: string;

  constructor(accountSid: string, authToken: string, senderPhoneNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.senderPhoneNumber = senderPhoneNumber;
  }

  async sendTemplate(params: TemplateMessageParams): Promise<ProviderSendResult> {
    return this.sendText({
      recipientPhone: params.recipientPhone,
      messageText: params.renderedBody,
    });
  }

  async sendText(params: TextMessageParams): Promise<ProviderSendResult> {
    try {
      const cleanPhone = params.recipientPhone.startsWith("+")
        ? params.recipientPhone
        : `+${params.recipientPhone}`;
      const from = this.senderPhoneNumber.startsWith("whatsapp:")
        ? this.senderPhoneNumber
        : `whatsapp:${this.senderPhoneNumber}`;
      const to = cleanPhone.startsWith("whatsapp:") ? cleanPhone : `whatsapp:${cleanPhone}`;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const body = new URLSearchParams({
        From: from,
        To: to,
        Body: params.messageText,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || `Twilio error: HTTP ${response.status}`,
          statusCode: response.status,
          rawResponse: data,
        };
      }

      return {
        success: true,
        providerMessageId: data?.sid,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Network exception reaching Twilio API.",
      };
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    if (!this.accountSid || !this.authToken || !this.senderPhoneNumber) {
      return {
        healthy: false,
        message: "Missing Twilio Account SID, Auth Token, or Sender Phone.",
      };
    }
    return {
      healthy: true,
      message: `Twilio provider configured for sender ${this.senderPhoneNumber}.`,
    };
  }
}

// ------------------------------------------------------------------------------
// 4. PROVIDER FACTORY
// ------------------------------------------------------------------------------

export interface WhatsAppConfigEntity {
  provider: WhatsAppProviderType;
  isLiveDelivery: boolean;
  phoneNumberId?: string | null;
  accessToken?: string | null;
  accountSid?: string | null;
  authToken?: string | null;
  senderPhoneNumber?: string | null;
}

export function getWhatsAppProvider(
  config: WhatsAppConfigEntity | null | undefined
): WhatsAppProvider {
  if (!config) {
    return new MockSandboxWhatsAppProvider();
  }

  // If live delivery is false or required credentials are not supplied, fallback to MockSandbox
  if (!config.isLiveDelivery) {
    return new MockSandboxWhatsAppProvider();
  }

  if (
    config.provider === WhatsAppProviderType.META_CLOUD_API &&
    config.phoneNumberId &&
    config.accessToken
  ) {
    return new MetaCloudWhatsAppProvider(config.phoneNumberId, config.accessToken);
  }

  if (
    config.provider === WhatsAppProviderType.TWILIO &&
    config.accountSid &&
    config.authToken &&
    config.senderPhoneNumber
  ) {
    return new TwilioWhatsAppProvider(
      config.accountSid,
      config.authToken,
      config.senderPhoneNumber
    );
  }

  return new MockSandboxWhatsAppProvider();
}

