/**
 * Session-based Token Management with Rotation
 *
 * - Each session has a current token and optionally a next token
 * - Tokens are rotated before expiration (at 80% of lifetime)
 * - Client can prepare new MusicKit instance with next token in background
 */

import { generateToken, hasCredentials, getCredentials } from "./token";

const TOKEN_LIFETIME_SEC = 60 * 60; // 1 hour
const ROTATION_THRESHOLD = 0.8; // Rotate at 80% of lifetime (48 min)

interface TokenInfo {
  token: string;
  expiresAt: Date;
}

interface Session {
  id: string;
  current: TokenInfo;
  next: TokenInfo | null;
  createdAt: Date;
}

// In-memory session store
const sessions = new Map<string, Session>();

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a new token with 1 hour expiration
 */
async function generateSessionToken(): Promise<TokenInfo> {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error("Credentials not configured");
  }

  return await generateToken(credentials, TOKEN_LIFETIME_SEC);
}

/**
 * Check if token should be rotated
 */
function shouldRotate(tokenInfo: TokenInfo): boolean {
  const lifetime = TOKEN_LIFETIME_SEC * 1000;
  const elapsed = Date.now() - (tokenInfo.expiresAt.getTime() - lifetime);
  return elapsed >= lifetime * ROTATION_THRESHOLD;
}

/**
 * Create a new session
 */
export async function createSession(): Promise<Session> {
  const id = generateSessionId();
  const current = await generateSessionToken();

  const session: Session = {
    id,
    current,
    next: null,
    createdAt: new Date(),
  };

  sessions.set(id, session);
  return session;
}

/**
 * Get session by ID, rotating token if needed
 */
export async function getSession(id: string): Promise<Session | null> {
  const session = sessions.get(id);
  if (!session) return null;

  // Check if we need to prepare next token
  if (!session.next && shouldRotate(session.current)) {
    session.next = await generateSessionToken();
  }

  return session;
}

/**
 * Rotate to next token (called when client switches to new instance)
 */
export async function rotateSession(id: string): Promise<Session | null> {
  const session = sessions.get(id);
  if (!session) return null;

  if (session.next) {
    session.current = session.next;
    session.next = null;
  } else {
    // Force generate new token
    session.current = await generateSessionToken();
  }

  return session;
}

/**
 * Delete a session
 */
export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}

/**
 * Get session info for client
 */
export function getSessionInfo(session: Session) {
  return {
    sessionId: session.id,
    current: {
      token: session.current.token,
      expiresAt: session.current.expiresAt.toISOString(),
    },
    next: session.next
      ? {
          token: session.next.token,
          expiresAt: session.next.expiresAt.toISOString(),
        }
      : null,
    shouldRotate: shouldRotate(session.current),
  };
}

/**
 * Cleanup expired sessions
 */
export function cleanupSessions(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, session] of sessions) {
    const latestExpiry = session.next?.expiresAt || session.current.expiresAt;
    if (latestExpiry.getTime() < now) {
      sessions.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}
