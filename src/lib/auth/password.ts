import { hash, verify } from "@node-rs/argon2";

// ==============================================================================
// FIXIA GymOS — Argon2id Password Cryptography
// ==============================================================================
// Enforces memory-hard, GPU/ASIC-resistant password hashing using Argon2id.
// Parameters: memoryCost = 19456 KiB, timeCost = 2 iterations, parallelism = 1
// ==============================================================================

/**
 * Generates an Argon2id password hash.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Cryptographically verifies a plaintext password against an Argon2id hash.
 * Protects against timing attacks.
 */
export async function verifyPassword(
  hashString: string,
  plainPassword: string
): Promise<boolean> {
  if (!hashString || !plainPassword) {
    return false;
  }
  try {
    return await verify(hashString, plainPassword);
  } catch (err) {
    console.error("Argon2id password verification error:", err);
    return false;
  }
}

