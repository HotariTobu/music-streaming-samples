/**
 * PKCE (Proof Key for Code Exchange) utilities for Spotify OAuth 2.0
 *
 * The PKCE extension provides protection against attacks where the authorization
 * code may be intercepted. It's required for public clients (browser apps).
 */

/**
 * Generate a cryptographically random code verifier.
 * The verifier must be between 43-128 characters and contain only
 * alphanumeric characters plus "-", ".", "_", "~".
 */
export function generateCodeVerifier(length = 64): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues)
    .map((x) => possible[x % possible.length])
    .join("");
}

/**
 * Generate a code challenge from a code verifier using SHA-256.
 * The challenge is the Base64 URL-encoded SHA-256 hash of the verifier.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

/**
 * Base64 URL-encode an ArrayBuffer.
 * This is different from standard Base64: uses "-" and "_" instead of "+" and "/",
 * and omits padding "=" characters.
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generate a random state value for CSRF protection.
 * The state is sent with the authorization request and verified on callback.
 */
export function generateState(length = 16): string {
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Build the Spotify authorization URL with PKCE parameters.
 */
export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scopes?: string[];
}): string {
  const {
    clientId,
    redirectUri,
    codeChallenge,
    state,
    scopes = [
      // Listening history
      "user-read-recently-played",
      "user-read-playback-position",
      "user-top-read",
      // Spotify Connect
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      // Playback (requires Premium)
      "streaming",
      // Playlists
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-private",
      "playlist-modify-public",
      // Library
      "user-library-read",
      "user-library-modify",
      // Follow
      "user-follow-read",
      "user-follow-modify",
      // User profile
      "user-read-email",
      "user-read-private",
    ],
  } = params;

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", codeChallenge);

  return url.toString();
}
