import { serve } from "bun";
import { networkInterfaces } from "os";
import index from "./index.html";
import {
  setCredentials,
  getCredentials,
  hasCredentials,
  clearCredentials,
  exchangeCodeForToken,
  refreshAccessToken,
  type SpotifyCredentials,
} from "./lib/spotify/token";

function getLocalIP() {
  const interfaces = networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const port = Bun.argv[2] ? parseInt(Bun.argv[2]) : 3000;
const localIP = getLocalIP();

const ALLOWED_ORIGINS = new Set([
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  ...(localIP ? [`http://${localIP}:${port}`] : []),
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.has(origin);
}

const server = serve({
  port,
  routes: {
    // Serve index.html for all unmatched routes (SPA)
    "/*": index,

    // Credentials management (in-memory for development)
    "/api/credentials": {
      async POST(req) {
        try {
          const body = (await req.json()) as SpotifyCredentials;
          if (!body.clientId || !body.clientSecret) {
            return Response.json(
              { error: "Required: clientId, clientSecret" },
              { status: 400 }
            );
          }
          setCredentials(body);
          return Response.json({ success: true });
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
      },
      async GET() {
        const creds = getCredentials();
        return Response.json({
          configured: hasCredentials(),
          clientId: creds?.clientId || null,
        });
      },
      async DELETE() {
        clearCredentials();
        return Response.json({ success: true });
      },
    },

    // OAuth callback handler
    // Spotify redirects here with ?code=...&state=...
    // We exchange the code for tokens and redirect to the app
    "/callback": async (req) => {
      const url = new URL(req.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      // Handle authorization errors
      if (error) {
        // Redirect to app with error
        return Response.redirect(`/?auth_error=${encodeURIComponent(error)}`);
      }

      if (!code || !state) {
        return Response.redirect("/?auth_error=missing_params");
      }

      // The code_verifier was stored client-side before redirect
      // We need to receive it from the client to complete the exchange
      // For security, we'll return the code to the client which will
      // then call /api/token/exchange with the code_verifier
      return Response.redirect(`/?auth_code=${code}&auth_state=${state}`);
    },

    // Token exchange endpoint
    // Client calls this with the authorization code and code_verifier
    "/api/token/exchange": {
      async POST(req) {
        const origin = req.headers.get("origin");
        if (!isAllowedOrigin(origin)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!hasCredentials()) {
          return Response.json(
            { error: "Credentials not configured" },
            { status: 401 }
          );
        }

        try {
          const { code, codeVerifier, redirectUri } = await req.json();

          if (!code || !codeVerifier || !redirectUri) {
            return Response.json(
              { error: "Required: code, codeVerifier, redirectUri" },
              { status: 400 }
            );
          }

          const tokenData = await exchangeCodeForToken(code, codeVerifier, redirectUri);

          return Response.json({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresAt: tokenData.expiresAt.toISOString(),
            scope: tokenData.scope,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Token exchange failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },

    // Token refresh endpoint
    "/api/token/refresh": {
      async POST(req) {
        const origin = req.headers.get("origin");
        if (!isAllowedOrigin(origin)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!hasCredentials()) {
          return Response.json(
            { error: "Credentials not configured" },
            { status: 401 }
          );
        }

        try {
          const { refreshToken } = await req.json();

          if (!refreshToken) {
            return Response.json(
              { error: "Required: refreshToken" },
              { status: 400 }
            );
          }

          const tokenData = await refreshAccessToken(refreshToken);

          return Response.json({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresAt: tokenData.expiresAt.toISOString(),
            scope: tokenData.scope,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Token refresh failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Local: http://localhost:${port}`);
if (localIP) console.log(`📡 Network: http://${localIP}:${port}`);
