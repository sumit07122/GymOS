import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { User, Session, UserGymRole, Gym } from "@prisma/client";

// ==============================================================================
// FIXIA GymOS — Database-Backed Session Management
// ==============================================================================
// Implements 100% database-persisted sessions using the Prisma Session table.
// Guarantees:
// 1. Instant server-side revocation on password change, role demotion, or logout.
// 2. Cookie is HttpOnly, Secure (in production), SameSite=Lax.
// 3. Automated detection and cleanup of expired sessions.
// ==============================================================================

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-fixia_session_token"
    : "fixia_session_token";

export const SESSION_MAX_AGE_DAYS = 30;

export type AuthenticatedUser = User & {
  gymRoles: (UserGymRole & {
    gym: Gym;
  })[];
};

export type AuthenticatedSession = Session & {
  user: AuthenticatedUser;
};

/**
 * Creates a new database session record and sets the HttpOnly session cookie.
 */
export async function createDatabaseSession(
  userId: string
): Promise<AuthenticatedSession> {
  const sessionToken = crypto.randomUUID();
  const expires = new Date(
    Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await db.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
    include: {
      user: {
        include: {
          gymRoles: {
            include: {
              gym: true,
            },
          },
        },
      },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return session;
}

/**
 * Retrieves and validates the current active database session from the request cookie.
 * Returns null if unauthenticated, session token missing, or session expired.
 */
export async function getDatabaseSession(): Promise<AuthenticatedSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            gymRoles: {
              include: {
                gym: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check expiration
    if (session.expires < new Date()) {
      await db.session.delete({ where: { sessionToken: token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    // Check if user is suspended
    if (session.user.status === "SUSPENDED") {
      await db.session.delete({ where: { sessionToken: token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    return session;
  } catch (err) {
    console.error("Error reading database session:", err);
    return null;
  }
}

/**
 * Destroys the current database session record and clears the session cookie.
 */
export async function invalidateDatabaseSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await db.session.delete({ where: { sessionToken: token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (err) {
    console.error("Error invalidating session:", err);
  }
}

/**
 * Invalidates ALL database sessions for a specific user across all devices.
 * Triggered on password change, account suspension, or security resets.
 */
export async function invalidateAllUserDatabaseSessions(
  userId: string
): Promise<number> {
  const result = await db.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

/**
 * Purges all expired session records from the database.
 */
export async function cleanupExpiredDatabaseSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

