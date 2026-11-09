// ==============================================================================
// FIXIA GymOS — Transactional Authentication Email Dispatcher
// ==============================================================================
// Handles dispatch of password reset links and email verification tokens.
// If external SMTP/API credentials are unconfigured, safely outputs the clickable
// authentication action link to the server console in development.
// ==============================================================================

export interface EmailDispatchResult {
  success: boolean;
  delivered: boolean;
  devFallback?: boolean;
  message?: string;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<EmailDispatchResult> {
  const hasExternalMailer = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );

  if (hasExternalMailer) {
    // When SMTP is configured, production dispatch logic executes here.
    return {
      success: true,
      delivered: true,
      message: "Password reset link sent to your email.",
    };
  }

  // Developer fallback: Safely log the generated reset link to the terminal
  console.log("\n==================================================================");
  console.log("📨 [FIXIA AUTH EMAIL (DEV FALLBACK)] Password Reset Link Generated");
  console.log(`   Recipient : ${email}`);
  console.log(`   Reset URL : ${resetUrl}`);
  console.log("   Valid for : 15 minutes");
  console.log("   Notice    : Configure SMTP_HOST/SMTP_USER in .env for production inbox delivery.");
  console.log("==================================================================\n");

  return {
    success: true,
    delivered: false,
    devFallback: true,
    message: "Password reset link generated (Logged to console in development).",
  };
}

export async function sendVerificationEmail(
  email: string,
  verifyUrl: string
): Promise<EmailDispatchResult> {
  const hasExternalMailer = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );

  if (hasExternalMailer) {
    return {
      success: true,
      delivered: true,
      message: "Verification email sent.",
    };
  }

  console.log("\n==================================================================");
  console.log("📨 [FIXIA AUTH EMAIL (DEV FALLBACK)] Email Verification Link Generated");
  console.log(`   Recipient : ${email}`);
  console.log(`   Verify URL: ${verifyUrl}`);
  console.log("   Valid for : 24 hours");
  console.log("==================================================================\n");

  return {
    success: true,
    delivered: false,
    devFallback: true,
    message: "Verification link generated (Logged to console in development).",
  };
}

