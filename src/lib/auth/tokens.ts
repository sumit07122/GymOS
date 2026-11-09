import crypto from "crypto";
import { db } from "@/lib/db";

// ==============================================================================
// FIXIA GymOS — Single-Use Expiring Verification & Reset Tokens
// ==============================================================================
// Security rules:
// 1. Tokens are hashed at rest using SHA-256 before storage in VerificationToken.
// 2. The plaintext token is delivered once (e.g. via email or dev log) and never stored.
// 3. Tokens expire deterministically (15 min for password reset, 24 hr for email verify).
// 4. Tokens are deleted upon first use (strictly single-use).
// ==============================================================================

export const RESET_TOKEN_EXPIRATION_MINUTES = 15;
export const EMAIL_VERIFY_TOKEN_EXPIRATION_HOURS = 24;

/**
 * Computes a deterministic SHA-256 hash of a raw token.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a cryptographically secure random token string.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates and stores a single-use password reset token in the database.
 * Replaces any existing pending reset tokens for that email.
 */
export async function createPasswordResetToken(
  email: string
): Promise<{ rawToken: string; expiresAt: Date }> {
  const normalizedEmail = email.toLowerCase().trim();
  const identifier = `password-reset:${normalizedEmail}`;
  const rawToken = generateRawToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  // Invalidate any existing pending tokens for this email
  await db.verificationToken.deleteMany({
    where: { identifier },
  });

  // Store hashed token at rest
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashedToken,
      expires: expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

/**
 * Verifies and atomically consumes a password reset token.
 * Returns the verified email address if valid, or throws an error.
 */
export async function verifyAndConsumeResetToken(
  rawToken: string
): Promise<{ email: string }> {
  const hashedToken = hashToken(rawToken);

  // Find verification token by hashed token
  const record = await db.verificationToken.findFirst({
    where: {
      token: hashedToken,
      identifier: {
        startsWith: "password-reset:",
      },
    },
  });

  if (!record) {
    throw new Error("Invalid or expired password reset token.");
  }

  // Check expiration
  if (record.expires < new Date()) {
    // Delete expired token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: record.identifier,
          token: record.token,
        },
      },
    });
    throw new Error("Password reset token has expired. Please request a new link.");
  }

  // Atomically delete the token to prevent replay
  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  });

  const email = record.identifier.replace("password-reset:", "");
  return { email };
}

/**
 * Creates an email verification token.
 */
export async function createEmailVerificationToken(
  email: string
): Promise<{ rawToken: string; expiresAt: Date }> {
  const normalizedEmail = email.toLowerCase().trim();
  const identifier = `email-verify:${normalizedEmail}`;
  const rawToken = generateRawToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFY_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
  );

  await db.verificationToken.deleteMany({
    where: { identifier },
  });

  await db.verificationToken.create({
    data: {
      identifier,
      token: hashedToken,
      expires: expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

/**
 * Verifies and atomically consumes an email verification token.
 */
export async function verifyAndConsumeEmailToken(
  rawToken: string
): Promise<{ email: string }> {
  const hashedToken = hashToken(rawToken);

  const record = await db.verificationToken.findFirst({
    where: {
      token: hashedToken,
      identifier: {
        startsWith: "email-verify:",
      },
    },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: record.identifier,
            token: record.token,
          },
        },
      });
    }
    throw new Error("Invalid or expired email verification token.");
  }

  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  });

  const email = record.identifier.replace("email-verify:", "");
  return { email };
}

