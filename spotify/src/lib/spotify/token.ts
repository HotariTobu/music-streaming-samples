/**
 * Server-side token management for Spotify OAuth 2.0
 *
 * Handles:
 * - Storing client credentials (in-memory for development)
 * - Exchanging authorization codes for tokens
 * - Refreshing access tokens
 */

export interface SpotifyCredentials {
  clientId: string;
  clientSecret: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  tokenType: string;
}

// In-memory credential storage (volatile, for development only)
let credentials: SpotifyCredentials | null = null;

export function setCredentials(creds: SpotifyCredentials): void {
  credentials = creds;
}

export function getCredentials(): SpotifyCredentials | null {
  return credentials;
}

export function hasCredentials(): boolean {
  return credentials !== null;
}

export function clearCredentials(): void {
  credentials = null;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 *
 * This is part of the OAuth 2.0 PKCE flow:
 * 1. User authorizes the app on Spotify
 * 2. Spotify redirects back with an authorization code
 * 3. We exchange the code (plus code_verifier) for tokens
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenData> {
  if (!credentials) {
    throw new Error("Credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || "Token exchange failed");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
    tokenType: data.token_type,
  };
}

/**
 * Refresh an access token using a refresh token.
 *
 * Spotify access tokens expire after 1 hour. Use this function
 * to get a new access token without requiring user re-authorization.
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenData> {
  if (!credentials) {
    throw new Error("Credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.error || "Token refresh failed");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    // Spotify may return a new refresh token, or we keep the old one
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
    tokenType: data.token_type,
  };
}
