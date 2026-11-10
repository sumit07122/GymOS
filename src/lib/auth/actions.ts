"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import {
  loginSchema,
  registerOwnerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "./password";
import {
  createDatabaseSession,
  invalidateDatabaseSession,
  invalidateAllUserDatabaseSessions,
} from "./session";
import {
  createPasswordResetToken,
  verifyAndConsumeResetToken,
} from "./tokens";
import { sendPasswordResetEmail } from "./email";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "./rate-limit";
import { SystemRole, GymRole, GymStatus } from "@prisma/client";
import { redirect } from "next/navigation";

// ==============================================================================
// FIXIA GymOS — Authentication Server Actions
// ==============================================================================

export interface AuthActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  redirectUrl?: string;
  message?: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Action: Gym Owner Registration
 */
export async function registerOwnerAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    gymName: formData.get("gymName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = registerOwnerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Please correct the form errors.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { gymName, ownerName, email, password } = validation.data;

  // Rate limiting to prevent registration spam
  const rateLimitKey = `register:${email}`;
  const rateCheck = checkRateLimit(rateLimitKey, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Too many registration attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.`,
    };
  }

  // Check existing user
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      error: "An account with this email address already exists.",
    };
  }

  // Compute unique slug for gym
  let baseSlug = slugify(gymName);
  if (!baseSlug) baseSlug = "gym";
  let slug = baseSlug;
  const slugCollision = await db.gym.findUnique({ where: { slug } });
  if (slugCollision) {
    slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  // Hash password with Argon2id
  const passwordHash = await hashPassword(password);
  const qrSigningSecret = crypto.randomBytes(32).toString("hex");

  // Atomic database provisioning
  const result = await db.$transaction(async (tx) => {
    // 1. Create Gym entity
    const gym = await tx.gym.create({
      data: {
        name: gymName,
        slug,
        status: GymStatus.ACTIVE,
        qrSigningSecret,
        currency: "USD",
        timezone: "America/New_York",
      },
    });

    // 2. Create User entity
    const user = await tx.user.create({
      data: {
        name: ownerName,
        email,
        passwordHash,
        role: SystemRole.GYM_OWNER,
      },
    });

    // 3. Associate User as Gym OWNER
    await tx.userGymRole.create({
      data: {
        userId: user.id,
        gymId: gym.id,
        role: GymRole.OWNER,
        isPrimary: true,
      },
    });

    // 4. Seed default operational expense categories
    const defaultCategories = ["Rent", "Utilities", "Maintenance", "Salaries", "Equipment"];
    await tx.expenseCategory.createMany({
      data: defaultCategories.map((name) => ({
        gymId: gym.id,
        name,
      })),
    });

    return { gym, user };
  });

  resetRateLimit(rateLimitKey);

  // Create database session and set cookie
  await createDatabaseSession(result.user.id);

  return {
    success: true,
    redirectUrl: `/${result.gym.slug}`,
  };
}

/**
 * Action: User Login (Owner, Staff, or Member)
 */
export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Please provide a valid email and password.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;
  const rateLimitKey = `login:${email}`;

  // Rate limiting check
  const rateCheck = checkRateLimit(rateLimitKey, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Too many failed attempts. Account locked for ${rateCheck.retryAfterSeconds} seconds.`,
    };
  }

  // Lookup user by email
  const user = await db.user.findUnique({
    where: { email },
    include: {
      gymRoles: {
        include: {
          gym: true,
        },
      },
    },
  });

  // Protect against timing attack and account enumeration
  if (!user || !user.passwordHash) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  // Verify Argon2id password hash
  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    const attempt = recordFailedAttempt(rateLimitKey);
    const attemptsLeft = attempt.remaining;
    return {
      success: false,
      error: attemptsLeft > 0
        ? `Invalid email or password. (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining)`
        : "Invalid email or password. Too many attempts; account temporarily locked.",
    };
  }

  // Check account suspension
  if (user.status === "SUSPENDED") {
    return {
      success: false,
      error: "This account has been suspended. Please contact your gym administrator.",
    };
  }

  // Successful authentication -> reset rate limit
  resetRateLimit(rateLimitKey);

  // Create database session record & HttpOnly cookie
  await createDatabaseSession(user.id);

  // Compute redirect based on role
  let redirectUrl = "/owner/dashboard";
  if (user.role === SystemRole.SUPER_ADMIN) {
    redirectUrl = "/platform-admin";
  } else if (user.gymRoles.some((r) => r.role === GymRole.OWNER)) {
    redirectUrl = "/owner/dashboard";
  } else if (user.gymRoles.some((r) => r.role === GymRole.MEMBER)) {
    redirectUrl = "/member/home";
  } else {
    const member = await db.member.findFirst({ where: { userId: user.id } });
    if (member) {
      redirectUrl = "/member/home";
    } else if (user.gymRoles.length > 0) {
      redirectUrl = `/${user.gymRoles[0].gym.slug}`;
    }
  }

  return {
    success: true,
    redirectUrl,
  };
}

/**
 * Action: Gym Member Login (Scoped by Gym Slug or Code)
 */
export async function memberLoginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const gymSlug = (formData.get("gymSlug") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!gymSlug || !email || !password) {
    return {
      success: false,
      error: "Please provide Gym Slug, Member Email, and Password.",
    };
  }

  // 1. Resolve Gym
  const gym = await db.gym.findFirst({
    where: {
      OR: [{ slug: gymSlug }, { id: gymSlug }],
    },
  });

  if (!gym) {
    return {
      success: false,
      error: `Gym workspace "${gymSlug}" not found. Please verify your gym code or URL.`,
    };
  }

  // 2. Validate User Credentials
  const user = await db.user.findUnique({
    where: { email },
    include: {
      gymRoles: true,
    },
  });

  if (!user || !user.passwordHash) {
    return {
      success: false,
      error: "Invalid member credentials or gym mismatch.",
    };
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    return {
      success: false,
      error: "Invalid member credentials or gym mismatch.",
    };
  }

  // 3. Verify Membership in this Gym
  const memberRecord = await db.member.findFirst({
    where: {
      gymId: gym.id,
      OR: [
        { userId: user.id },
        { email: user.email },
      ],
    },
  });

  const hasGymMemberRole = user.gymRoles.some(
    (gr) => gr.gymId === gym.id && gr.role === GymRole.MEMBER
  );

  if (!memberRecord && !hasGymMemberRole && user.role !== SystemRole.SUPER_ADMIN) {
    return {
      success: false,
      error: `No active member profile found for ${email} at ${gym.name}.`,
    };
  }

  // Auto-link user to member record if not yet linked
  if (memberRecord && !memberRecord.userId) {
    await db.member.update({
      where: { id: memberRecord.id },
      data: { userId: user.id },
    });
  }

  // 4. Create Session
  await createDatabaseSession(user.id);

  return {
    success: true,
    redirectUrl: "/member/home",
  };
}

/**
 * Action: FIXIA Platform Super Admin Login
 */
export async function superAdminLoginAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "Please enter your administrator email and password.",
    };
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash || user.role !== SystemRole.SUPER_ADMIN) {
    return {
      success: false,
      error: "Access Denied: Platform Super Administrator credentials required.",
    };
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    return {
      success: false,
      error: "Invalid credentials.",
    };
  }

  await createDatabaseSession(user.id);

  return {
    success: true,
    redirectUrl: "/platform-admin",
  };
}

/**
 * Action: Logout
 */
export async function logoutAction(): Promise<void> {
  await invalidateDatabaseSession();
  redirect("/login");
}

/**
 * Action: Forgot Password Request
 */
export async function forgotPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const validation = forgotPasswordSchema.safeParse({ email: rawEmail });

  if (!validation.success) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  const { email } = validation.data;
  const rateLimitKey = `forgot-password:${email}`;

  const rateCheck = checkRateLimit(rateLimitKey, { maxAttempts: 3, windowMs: 15 * 60 * 1000 });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Too many requests. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  recordFailedAttempt(rateLimitKey);

  // Query user
  const user = await db.user.findUnique({
    where: { email },
  });

  // Always return identical success message to prevent account enumeration
  if (user && user.status !== "SUSPENDED") {
    const { rawToken } = await createPasswordResetToken(email);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendPasswordResetEmail(email, resetUrl);
  }

  return {
    success: true,
    message: "If that email is registered, you will receive password reset instructions shortly.",
  };
}

/**
 * Action: Reset Password with Token
 */
export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: "Please fix the validation errors.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validation.data;

  try {
    // Atomically verify and consume the single-use token
    const { email } = await verifyAndConsumeResetToken(token);

    // Hash new password with Argon2id
    const passwordHash = await hashPassword(password);

    // Update user password
    const user = await db.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Invalidate all active sessions for this user across all devices
    await invalidateAllUserDatabaseSessions(user.id);

    return {
      success: true,
      message: "Your password has been successfully updated. You may now log in.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reset password.",
    };
  }
}

