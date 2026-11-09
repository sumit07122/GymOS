/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { qrTokenPayloadSchema, QrTokenPayload } from "@/lib/validations/attendance";

// ==============================================================================
// FIXIA GymOS — Cryptographic Dynamic QR Token Generator & Verifier
// ==============================================================================
// Spec:
// - HMAC-SHA256 with tenant's confidential qrSigningSecret
// - 60-second rolling TTL + clock drift tolerance
// - Unique UUID nonce per generation (replay prevention)
// - Timing-safe constant-time signature comparison
// - Zero PII in QR payload
// ==============================================================================

export class InvalidQrSignatureError extends Error {
  constructor(message = "SECURITY WARNING: QR token cryptographic signature is invalid or forged.") {
    super(message);
    this.name = "InvalidQrSignatureError";
  }
}

export class ExpiredQrTokenError extends Error {
  constructor(message = "QR code has expired. Please refresh your dynamic attendance QR pass.") {
    super(message);
    this.name = "ExpiredQrTokenError";
  }
}

export class CrossTenantScanError extends Error {
  constructor(message = "SECURITY ALERT: Cross-tenant attendance scan rejected. Member belongs to another gym.") {
    super(message);
    this.name = "CrossTenantScanError";
  }
}

export class ReplayScanError extends Error {
  constructor(message = "SECURITY ALERT: Token replay detected. This QR code has already been scanned.") {
    super(message);
    this.name = "ReplayScanError";
  }
}

export interface GenerateQrTokenOptions {
  gymId: string;
  memberId: string;
  qrSigningSecret: string;
  timestampSeconds?: number;
  nonce?: string;
}

export interface VerifyQrTokenOptions {
  maxAgeSeconds?: number;     // Standard 60 seconds
  clockDriftSeconds?: number; // Tolerates ±30s device clock skew
}

/**
 * Builds the canonical string to sign: "v:gid:mid:ts:nonce"
 */
function buildSignPayload(v: number, gymId: string, memberId: string, ts: number, nonce: string): string {
  return `${v}:${gymId}:${memberId}:${ts}:${nonce}`;
}

/**
 * Generates a dynamic, short-lived, HMAC-SHA256 signed QR attendance token.
 */
export function generateDynamicQrToken({
  gymId,
  memberId,
  qrSigningSecret,
  timestampSeconds,
  nonce,
}: GenerateQrTokenOptions): string {
  const v = 1;
  const ts = timestampSeconds ?? Math.floor(Date.now() / 1000);
  const tokenNonce = nonce ?? crypto.randomUUID();

  const signPayload = buildSignPayload(v, gymId, memberId, ts, tokenNonce);
  const sig = crypto.createHmac("sha256", qrSigningSecret).update(signPayload).digest("hex");

  const tokenObj: QrTokenPayload = {
    v,
    gid: gymId,
    mid: memberId,
    ts,
    nonce: tokenNonce,
    sig,
  };

  // Base64URL-encoded JSON string for clean QR scanning
  return Buffer.from(JSON.stringify(tokenObj), "utf-8").toString("base64url");
}

/**
 * Parses and cryptographically verifies a raw scanned QR token string.
 */
export function verifyDynamicQrToken(
  rawQrString: string,
  expectedGymId: string,
  qrSigningSecret: string,
  options: VerifyQrTokenOptions = {}
): {
  memberId: string;
  gymId: string;
  nonce: string;
  timestamp: Date;
} {
  const maxAge = options.maxAgeSeconds ?? 60;
  const drift = options.clockDriftSeconds ?? 30;

  let parsedRaw: any;

  // 1. Attempt Base64URL decode, or fallback to plain JSON
  try {
    const decoded = Buffer.from(rawQrString.trim(), "base64url").toString("utf-8");
    parsedRaw = JSON.parse(decoded);
  } catch {
    try {
      parsedRaw = JSON.parse(rawQrString.trim());
    } catch {
      throw new Error("Malformed QR code data format. Unable to parse attendance token.");
    }
  }

  // 2. Validate payload schema
  const validation = qrTokenPayloadSchema.safeParse(parsedRaw);
  if (!validation.success) {
    throw new Error("Invalid QR token structure. Missing required security parameters.");
  }

  const { v, gid, mid, ts, nonce, sig } = validation.data;

  // 3. Strict Tenant Isolation Check
  if (gid !== expectedGymId) {
    throw new CrossTenantScanError(
      `Scanned QR belongs to gym tenant "${gid}", not current workspace "${expectedGymId}".`
    );
  }

  // 4. Cryptographic Signature Verification
  const expectedSignPayload = buildSignPayload(v, gid, mid, ts, nonce);
  const expectedSig = crypto
    .createHmac("sha256", qrSigningSecret)
    .update(expectedSignPayload)
    .digest("hex");

  const sigBuffer = Buffer.from(sig, "hex");
  const expectedBuffer = Buffer.from(expectedSig, "hex");

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new InvalidQrSignatureError();
  }

  // 5. Expiration and Clock Drift Verification
  const now = Math.floor(Date.now() / 1000);

  // Future timestamp beyond allowed drift
  if (ts > now + drift) {
    throw new ExpiredQrTokenError("QR token timestamp is in the future. Please check device system clock.");
  }

  // Expired token
  if (now - ts > maxAge + drift) {
    throw new ExpiredQrTokenError("QR code has expired (60s validity exceeded). Please present a fresh QR code.");
  }

  return {
    memberId: mid,
    gymId: gid,
    nonce,
    timestamp: new Date(ts * 1000),
  };
}
