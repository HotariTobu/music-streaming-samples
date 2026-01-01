/**
 * Apple Music Developer Token Generator
 *
 * Generates JWT tokens for Apple Music API authentication.
 * Credentials are stored in-memory only (volatile).
 *
 * @see https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens
 */

import { SignJWT, importPKCS8 } from "jose";

export interface AppleCredentials {
  teamId: string;
  keyId: string;
  privateKey: string;
}

interface TokenResult {
  token: string;
  expiresAt: Date;
}

// In-memory credential store (volatile - lost on restart)
let storedCredentials: AppleCredentials | null = null;

/**
 * Store credentials in memory
 */
export function setCredentials(credentials: AppleCredentials): void {
  storedCredentials = credentials;
}

/**
 * Check if credentials are configured
 */
export function hasCredentials(): boolean {
  return storedCredentials !== null;
}

/**
 * Get stored credentials
 */
export function getCredentials(): AppleCredentials | null {
  return storedCredentials;
}

/**
 * Clear stored credentials
 */
export function clearCredentials(): void {
  storedCredentials = null;
}

/**
 * Generate Apple Music Developer Token (JWT with ES256)
 */
export async function generateToken(
  credentials: AppleCredentials,
  expiresIn: number
): Promise<TokenResult> {
  const { teamId, keyId, privateKey } = credentials;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresIn;

  const key = await importPKCS8(privateKey, "ES256");

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(key);

  return { token, expiresAt: new Date(exp * 1000) };
}
