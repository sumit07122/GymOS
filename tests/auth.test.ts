import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  loginSchema,
  registerOwnerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { hashToken, generateRawToken } from "@/lib/auth/tokens";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/auth/rate-limit";

describe("Milestone M03: Password Cryptography (Argon2id)", () => {
  it("hashes password with Argon2id and verifies correctly", async () => {
    const plain = "StrongSecret123!";
    const hashed = await hashPassword(plain);

    expect(hashed).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hashed, plain)).toBe(true);
  });

  it("rejects incorrect passwords with timing-safe comparison", async () => {
    const plain = "CorrectPassword123#";
    const hashed = await hashPassword(plain);

    expect(await verifyPassword(hashed, "WrongPassword123#")).toBe(false);
    expect(await verifyPassword(hashed, "")).toBe(false);
    expect(await verifyPassword("", plain)).toBe(false);
  });
});

describe("Milestone M03: Validation Schemas (Zod)", () => {
  it("validates valid login input and normalizes email", () => {
    const result = loginSchema.safeParse({
      email: "  Owner@IronForge.com ",
      password: "MyPassword123!",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("owner@ironforge.com");
    }
  });

  it("rejects invalid login inputs", () => {
    const badEmail = loginSchema.safeParse({
      email: "not-an-email",
      password: "pass",
    });
    expect(badEmail.success).toBe(false);

    const empty = loginSchema.safeParse({ email: "", password: "" });
    expect(empty.success).toBe(false);
  });

  it("enforces strong password complexity for owner registration", () => {
    // Missing uppercase
    expect(
      registerOwnerSchema.safeParse({
        gymName: "Alpha Gym",
        ownerName: "John Doe",
        email: "john@alpha.com",
        password: "weakpassword1!",
      }).success
    ).toBe(false);

    // Missing number
    expect(
      registerOwnerSchema.safeParse({
        gymName: "Alpha Gym",
        ownerName: "John Doe",
        email: "john@alpha.com",
        password: "WeakPassword!",
      }).success
    ).toBe(false);

    // Missing special character
    expect(
      registerOwnerSchema.safeParse({
        gymName: "Alpha Gym",
        ownerName: "John Doe",
        email: "john@alpha.com",
        password: "WeakPassword1",
      }).success
    ).toBe(false);

    // Compliant password
    expect(
      registerOwnerSchema.safeParse({
        gymName: "Alpha Gym",
        ownerName: "John Doe",
        email: "john@alpha.com",
        password: "ValidPassword123!",
      }).success
    ).toBe(true);
  });

  it("validates reset password confirmation match", () => {
    const mismatch = resetPasswordSchema.safeParse({
      token: "valid-token-123",
      password: "Password123!",
      confirmPassword: "DifferentPassword123!",
    });
    expect(mismatch.success).toBe(false);

    const match = resetPasswordSchema.safeParse({
      token: "valid-token-123",
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    expect(match.success).toBe(true);
  });

  it("validates forgot password email input", () => {
    expect(forgotPasswordSchema.safeParse({ email: "valid@gym.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
  });
});

describe("Milestone M03: Single-Use Token Cryptography", () => {
  it("generates 64-character hex cryptographically random tokens", () => {
    const token1 = generateRawToken();
    const token2 = generateRawToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("hashes tokens at rest deterministically with SHA-256", () => {
    const raw = "abc123rawtokenvalue";
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);

    expect(h1).toHaveLength(64);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(raw);
  });
});

describe("Milestone M03: Login Rate Limiter", () => {
  const testKey = "rate-limit-test-user@gym.com";

  it("allows up to 5 attempts then locks out", () => {
    resetRateLimit(testKey);

    // 5 attempts allowed
    for (let i = 0; i < 5; i++) {
      const check = checkRateLimit(testKey, { maxAttempts: 5, windowMs: 10000 });
      expect(check.allowed).toBe(true);
      recordFailedAttempt(testKey, { maxAttempts: 5, windowMs: 10000 });
    }

    // 6th attempt should be blocked
    const blockedCheck = checkRateLimit(testKey, { maxAttempts: 5, windowMs: 10000 });
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.remaining).toBe(0);
    expect(blockedCheck.retryAfterSeconds).toBeGreaterThan(0);

    // Reset clears the block
    resetRateLimit(testKey);
    const unblockedCheck = checkRateLimit(testKey, { maxAttempts: 5, windowMs: 10000 });
    expect(unblockedCheck.allowed).toBe(true);
  });
});

