import { serve } from "bun";
import { networkInterfaces } from "os";
import index from "./index.html";
import {
  setCredentials,
  hasCredentials,
  clearCredentials,
  type AppleCredentials,
  generateToken,
  getCredentials,
} from "./lib/apple-music/token";

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
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Credentials management (in-memory)
    "/api/credentials": {
      async POST(req) {
        try {
          const body = (await req.json()) as AppleCredentials;
          if (!body.teamId || !body.keyId || !body.privateKey) {
            return Response.json(
              { error: "Required: teamId, keyId, privateKey" },
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
        return Response.json({ configured: hasCredentials() });
      },
      async DELETE() {
        clearCredentials();
        return Response.json({ success: true });
      },
    },

    // Token endpoint (short-lived JWT for browser-side MusicKit)
    "/api/token": {
      async GET(req) {
        // Origin check
        const origin = req.headers.get("origin");
        if (!isAllowedOrigin(origin)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const credential = getCredentials()
        if (!credential) {
          return Response.json(
            { error: "Credentials not configured" },
            { status: 401 }
          );
        }

        try {
          const { token, expiresAt } = await generateToken(credential, 60 * 10);
          return Response.json({
            token,
            expiresAt: expiresAt.toISOString(),
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Token generation failed";
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
