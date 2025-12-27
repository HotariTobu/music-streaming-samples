/**
 * Apple Music Developer Token Generator
 *
 * Generates JWT tokens for Apple Music API authentication.
 * Credentials are stored in-memory only (volatile).
 *
 * @see https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens
 */

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
let cachedToken: TokenResult | null = null;

/**
 * Store credentials in memory
 */
export function setCredentials(credentials: AppleCredentials): void {
  storedCredentials = credentials;
  cachedToken = null; // Invalidate cached token
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
  cachedToken = null;
}

/**
 * Base64URL encode (RFC 4648)
 */
function base64UrlEncode(data: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Import PEM private key for ES256 signing
 */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    "pkcs8",
    bytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
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

  const header = { alg: "ES256", kid: keyId };
  const payload = { iss: teamId, iat: now, exp: exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKey(privateKey);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  const token = `${signingInput}.${encodedSignature}`;

  return { token, expiresAt: new Date(exp * 1000) };
}

/**
 * Get or generate a developer token (with caching)
 */
export async function getDeveloperToken(): Promise<TokenResult> {
  if (!storedCredentials) {
    throw new Error("Credentials not configured");
  }

  // Return cached token if still valid (with 1 hour buffer)
  if (cachedToken) {
    const bufferMs = 60 * 60 * 1000;
    if (cachedToken.expiresAt.getTime() - Date.now() > bufferMs) {
      return cachedToken;
    }
  }

  cachedToken = await generateToken(storedCredentials, 86400); // 24 hours for API proxy
  return cachedToken;
}
