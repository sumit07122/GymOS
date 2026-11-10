import { db } from "@/lib/db";
import { GymStatus, SaasSubscriptionStatus } from "@prisma/client";
import {
  SaasFeature,
  SaasFeatureKey,
  ALL_SAAS_FEATURES,
} from "./features";

export { SaasFeature, ALL_SAAS_FEATURES };
export type { SaasFeatureKey };

// ==============================================================================
// FIXIA GymOS — Centralized SaaS Feature Entitlements System (M19)
// ==============================================================================
// INVARIANTS:
// 1. Centralized Control: Feature availability is determined by SaaS subscription
//    plans and platform-level account status, NEVER scattered ad-hoc in UI code.
// 2. Defense-in-Depth: Suspended or inactive gyms forfeit all feature entitlements.
// 3. Grace Periods: Subscriptions past due honor configured grace periods before
//    revoking access.
// 4. Overrides: Super admins can grant or deny specific feature overrides per gym.
// ==============================================================================

export class FeatureEntitlementError extends Error {
  public readonly feature: SaasFeatureKey;
  public readonly reason: string;

  constructor(feature: SaasFeatureKey, reason: string) {
    super(`Access to feature "${feature}" denied: ${reason}`);
    this.name = "FeatureEntitlementError";
    this.feature = feature;
    this.reason = reason;
  }
}

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  feature: SaasFeatureKey;
  gymStatus: GymStatus;
  subscriptionStatus?: SaasSubscriptionStatus;
  planName?: string;
  isOverridden?: boolean;
}

/**
 * Checks whether a specific gym is entitled to use a SaaS feature.
 */
export async function checkGymEntitlement(
  gymId: string,
  feature: SaasFeatureKey,
  referenceNow = new Date()
): Promise<EntitlementCheckResult> {
  const gym = await db.gym.findUnique({
    where: { id: gymId },
    select: {
      id: true,
      status: true,
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!gym) {
    return {
      allowed: false,
      reason: "Gym workspace does not exist.",
      feature,
      gymStatus: GymStatus.INACTIVE,
    };
  }

  // 1. Gym Account Status Check
  if (gym.status === GymStatus.SUSPENDED) {
    return {
      allowed: false,
      reason: "Gym workspace is currently suspended by FIXIA platform administration.",
      feature,
      gymStatus: gym.status,
    };
  }

  if (gym.status === GymStatus.INACTIVE) {
    return {
      allowed: false,
      reason: "Gym workspace is inactive.",
      feature,
      gymStatus: gym.status,
    };
  }

  const sub = gym.subscription;

  // 2. If no SaaS subscription is attached yet:
  // For un-subscribed gyms or newly registered gyms during initial setup,
  // allow Core features or handle default trial.
  if (!sub) {
    const coreFeatures: SaasFeatureKey[] = [
      SaasFeature.CORE_MEMBERS,
      SaasFeature.CORE_PLANS,
      SaasFeature.ATTENDANCE_QR,
      SaasFeature.BILLING_INVOICING,
      SaasFeature.MEMBER_PORTAL,
    ];
    const isCore = coreFeatures.includes(feature);

    return {
      allowed: isCore,
      reason: isCore
        ? undefined
        : "Subscription plan required to access advanced modules.",
      feature,
      gymStatus: gym.status,
    };
  }

  // 3. Custom Feature Overrides take absolute precedence
  if (sub.customFeatureOverrides) {
    try {
      const overrides = JSON.parse(sub.customFeatureOverrides);
      if (typeof overrides[feature] === "boolean") {
        return {
          allowed: overrides[feature],
          reason: overrides[feature]
            ? undefined
            : "Feature manually disabled by platform administrator override.",
          feature,
          gymStatus: gym.status,
          subscriptionStatus: sub.status,
          planName: sub.plan.name,
          isOverridden: true,
        };
      }
    } catch {
      // ignore parse errors and proceed to plan evaluation
    }
  }

  // 4. Subscription Status Checks
  if (sub.status === SaasSubscriptionStatus.SUSPENDED) {
    return {
      allowed: false,
      reason: "SaaS subscription has been suspended.",
      feature,
      gymStatus: gym.status,
      subscriptionStatus: sub.status,
      planName: sub.plan.name,
    };
  }

  if (sub.status === SaasSubscriptionStatus.CANCELLED) {
    return {
      allowed: false,
      reason: "SaaS subscription was cancelled.",
      feature,
      gymStatus: gym.status,
      subscriptionStatus: sub.status,
      planName: sub.plan.name,
    };
  }

  // Check Trial Expiration
  if (sub.status === SaasSubscriptionStatus.TRIALING) {
    if (sub.trialEndsAt && referenceNow > sub.trialEndsAt) {
      return {
        allowed: false,
        reason: "SaaS trial period has expired. Please upgrade your subscription plan.",
        feature,
        gymStatus: gym.status,
        subscriptionStatus: sub.status,
        planName: sub.plan.name,
      };
    }
  }

  // Check Past Due & Grace Period
  if (sub.status === SaasSubscriptionStatus.PAST_DUE) {
    if (sub.gracePeriodEndsAt && referenceNow > sub.gracePeriodEndsAt) {
      return {
        allowed: false,
        reason: "SaaS subscription payment is past due and grace period has elapsed.",
        feature,
        gymStatus: gym.status,
        subscriptionStatus: sub.status,
        planName: sub.plan.name,
      };
    }
  }

  // 5. Plan Features Checklist Evaluation
  let planFeatures: string[] = [];
  try {
    planFeatures = JSON.parse(sub.plan.features || "[]");
  } catch {
    planFeatures = [];
  }

  const isIncluded = planFeatures.includes(feature) || planFeatures.includes("*");

  if (!isIncluded) {
    return {
      allowed: false,
      reason: `The "${sub.plan.name}" plan does not include the ${feature} feature.`,
      feature,
      gymStatus: gym.status,
      subscriptionStatus: sub.status,
      planName: sub.plan.name,
    };
  }

  return {
    allowed: true,
    feature,
    gymStatus: gym.status,
    subscriptionStatus: sub.status,
    planName: sub.plan.name,
  };
}

/**
 * Asserts that a gym has the given feature entitlement, or throws FeatureEntitlementError.
 */
export async function assertGymEntitlement(
  gymId: string,
  feature: SaasFeatureKey
): Promise<void> {
  const result = await checkGymEntitlement(gymId, feature);
  if (!result.allowed) {
    throw new FeatureEntitlementError(feature, result.reason || "Feature access not permitted.");
  }
}

/**
 * Retrieves full feature availability map for a gym.
 */
export async function getGymEntitlementsSummary(gymId: string) {
  const gym = await db.gym.findUnique({
    where: { id: gymId },
    select: {
      id: true,
      name: true,
      status: true,
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!gym) {
    return {
      gymId,
      gymStatus: GymStatus.INACTIVE,
      features: {} as Record<SaasFeatureKey, boolean>,
      plan: null,
    };
  }

  const results: Record<string, boolean> = {};
  for (const item of ALL_SAAS_FEATURES) {
    const res = await checkGymEntitlement(gymId, item.key);
    results[item.key] = res.allowed;
  }

  return {
    gymId: gym.id,
    gymName: gym.name,
    gymStatus: gym.status,
    subscription: gym.subscription
      ? {
          status: gym.subscription.status,
          billingPeriod: gym.subscription.billingPeriod,
          currentPeriodEnd: gym.subscription.currentPeriodEnd,
          trialEndsAt: gym.subscription.trialEndsAt,
          plan: {
            name: gym.subscription.plan.name,
            code: gym.subscription.plan.code,
            maxMembers: gym.subscription.plan.maxMembers,
            maxStaff: gym.subscription.plan.maxStaff,
            maxClasses: gym.subscription.plan.maxClasses,
          },
        }
      : null,
    features: results as Record<SaasFeatureKey, boolean>,
  };
}
