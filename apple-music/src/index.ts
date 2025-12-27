import { serve } from "bun";
import { networkInterfaces } from "os";
import index from "./index.html";
import {
  setCredentials,
  hasCredentials,
  clearCredentials,
  type AppleCredentials,
} from "./lib/apple-music/token";
import { getClient } from "./lib/apple-music/client";

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

const server = serve({
  port,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

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

    // Apple Music API Proxy
    "/api/music/search": async req => {
      const url = new URL(req.url);
      const term = url.searchParams.get("term") || "";
      const types = url.searchParams.get("types")?.split(",") || ["songs", "artists", "albums"];
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const storefront = url.searchParams.get("storefront") || "jp";

      if (!term) {
        return Response.json({ error: "term is required" }, { status: 400 });
      }

      try {
        const client = getClient(storefront);
        const result = await client.search(term, types, limit);
        return Response.json(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Search failed";
        return Response.json({ error: message }, { status: 500 });
      }
    },

    "/api/music/songs/:id": async req => {
      try {
        const client = getClient();
        const result = await client.getSong(req.params.id);
        return Response.json(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed";
        return Response.json({ error: message }, { status: 500 });
      }
    },

    "/api/music/albums/:id": async req => {
      try {
        const client = getClient();
        const result = await client.getAlbum(req.params.id);
        return Response.json(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed";
        return Response.json({ error: message }, { status: 500 });
      }
    },

    "/api/music/artists/:id": async req => {
      try {
        const client = getClient();
        const result = await client.getArtist(req.params.id);
        return Response.json(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed";
        return Response.json({ error: message }, { status: 500 });
      }
    },

    "/api/music/charts": async req => {
      const url = new URL(req.url);
      const types = url.searchParams.get("types")?.split(",") || ["songs", "albums"];
      const limit = parseInt(url.searchParams.get("limit") || "20");

      try {
        const client = getClient();
        const result = await client.getCharts(types, limit);
        return Response.json(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed";
        return Response.json({ error: message }, { status: 500 });
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

const localIP = getLocalIP();
console.log(`🚀 Local: http://localhost:${port}`);
if (localIP) console.log(`📡 Network: http://${localIP}:${port}`);
