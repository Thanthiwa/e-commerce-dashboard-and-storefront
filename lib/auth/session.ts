import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { IUser } from "@/lib/db/models";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-secret-key-min-32-characters-long";
const SESSION_COOKIE = "admin_session";
const SESSION_EXPIRY = "7d";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
}

/**
 * Encode a secret key for JWT signing
 */
function getSecretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

/**
 * Create a signed JWT token
 */
export async function createToken(user: IUser): Promise<string> {
  const payload: SessionPayload = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(getSecretKey());
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a session cookie
 */
export async function createSession(user: IUser): Promise<void> {
  const token = await createToken(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Destroy the session cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(allowedRoles: string[]): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return allowedRoles.includes(session.role);
}
