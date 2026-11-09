import { z } from "zod";

// ==============================================================================
// FIXIA GymOS — Authentication Validation Schemas (Client & Server)
// ==============================================================================
// Strictly enforces input sanitization, length boundaries, and password complexity.
// ==============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .max(255, "Email address is too long")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password exceeds maximum allowed length"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerOwnerSchema = z.object({
  gymName: z
    .string()
    .trim()
    .min(2, "Gym name must be at least 2 characters")
    .max(100, "Gym name cannot exceed 100 characters"),
  ownerName: z
    .string()
    .trim()
    .min(2, "Your name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .max(255, "Email address is too long")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password exceeds maximum allowed length")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .max(255, "Email address is too long")
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password exceeds maximum allowed length")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

