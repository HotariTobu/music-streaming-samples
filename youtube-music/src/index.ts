import { serve } from "bun";
import { networkInterfaces } from "os";
import index from "./index.html";

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

// In-memory storage for credentials and tokens
interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  apiKey: string;
}

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

let credentials: GoogleCredentials | null = null;
let tokenData: TokenData | null = null;

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const OAUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function getRedirectUri() {
  return `http://localhost:${port}/api/auth/callback`;
}

// Helper to make authenticated YouTube API requests
async function youtubeApiRequest(
  endpoint: string,
  params: Record<string, string>,
  requireAuth = false
): Promise<Response> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);

  if (requireAuth && tokenData) {
    // Use OAuth token
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
    });
    return res;
  } else if (credentials?.apiKey) {
    // Use API key for public endpoints
    url.searchParams.set("key", credentials.apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const res = await fetch(url.toString());
    return res;
  } else {
    throw new Error("No credentials configured");
  }
}

const server = serve({
  port,
  routes: {
    // Serve index.html for all unmatched routes
    "/*": index,

    // Credentials management
    "/api/credentials": {
      async GET() {
        return Response.json({ configured: credentials !== null });
      },
      async POST(req) {
        try {
          const body = (await req.json()) as GoogleCredentials;
          if (!body.clientId || !body.clientSecret || !body.apiKey) {
            return Response.json(
              { error: "Required: clientId, clientSecret, apiKey" },
              { status: 400 }
            );
          }
          credentials = body;
          return Response.json({ success: true });
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
      },
      async DELETE() {
        credentials = null;
        tokenData = null;
        return Response.json({ success: true });
      },
    },

    // Auth session check
    "/api/auth/session": {
      async GET() {
        if (tokenData && tokenData.expiresAt > new Date()) {
          return Response.json({
            authorized: true,
            accessToken: tokenData.accessToken,
            expiresAt: tokenData.expiresAt.toISOString(),
          });
        }
        return Response.json({ authorized: false });
      },
    },

    // OAuth login redirect
    "/api/auth/login": {
      async GET() {
        if (!credentials) {
          return Response.json({ error: "Credentials not configured" }, { status: 401 });
        }

        const params = new URLSearchParams({
          client_id: credentials.clientId,
          redirect_uri: getRedirectUri(),
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtube.force-ssl",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        });

        return Response.redirect(`${OAUTH_BASE}?${params}`);
      },
    },

    // OAuth callback
    "/api/auth/callback": {
      async GET(req) {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          return Response.redirect(`/?error=${encodeURIComponent(error)}`);
        }

        if (!code || !credentials) {
          return Response.redirect("/?error=invalid_callback");
        }

        try {
          const tokenRes = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code,
              client_id: credentials.clientId,
              client_secret: credentials.clientSecret,
              redirect_uri: getRedirectUri(),
              grant_type: "authorization_code",
            }),
          });

          if (!tokenRes.ok) {
            const err = await tokenRes.json();
            console.error("Token exchange failed:", err);
            return Response.redirect("/?error=token_exchange_failed");
          }

          const data = await tokenRes.json();
          tokenData = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(Date.now() + data.expires_in * 1000),
          };

          return Response.redirect("/");
        } catch (err) {
          console.error("OAuth callback error:", err);
          return Response.redirect("/?error=callback_error");
        }
      },
    },

    // Token refresh
    "/api/auth/refresh": {
      async POST() {
        if (!credentials || !tokenData?.refreshToken) {
          return Response.json({ error: "No refresh token" }, { status: 401 });
        }

        try {
          const tokenRes = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              refresh_token: tokenData.refreshToken,
              client_id: credentials.clientId,
              client_secret: credentials.clientSecret,
              grant_type: "refresh_token",
            }),
          });

          if (!tokenRes.ok) {
            return Response.json({ error: "Refresh failed" }, { status: 401 });
          }

          const data = await tokenRes.json();
          tokenData = {
            accessToken: data.access_token,
            refreshToken: tokenData.refreshToken,
            expiresAt: new Date(Date.now() + data.expires_in * 1000),
          };

          return Response.json({
            accessToken: tokenData.accessToken,
            expiresAt: tokenData.expiresAt.toISOString(),
          });
        } catch {
          return Response.json({ error: "Refresh failed" }, { status: 500 });
        }
      },
    },

    // Logout
    "/api/auth/logout": {
      async POST() {
        tokenData = null;
        return Response.json({ success: true });
      },
    },

    // YouTube Search
    "/api/youtube/search": {
      async GET(req) {
        if (!credentials) {
          return Response.json({ error: "Not configured" }, { status: 401 });
        }

        const url = new URL(req.url);
        const q = url.searchParams.get("q");
        const type = url.searchParams.get("type") || "video";
        const videoCategoryId = url.searchParams.get("videoCategoryId");
        const maxResults = url.searchParams.get("maxResults") || "20";
        const pageToken = url.searchParams.get("pageToken");

        if (!q) {
          return Response.json({ error: "Query required" }, { status: 400 });
        }

        try {
          const params: Record<string, string> = {
            part: "snippet",
            q,
            type,
            maxResults,
          };
          if (videoCategoryId) params.videoCategoryId = videoCategoryId;
          if (pageToken) params.pageToken = pageToken;

          const res = await youtubeApiRequest("search", params);
          if (!res.ok) {
            const err = await res.json();
            return Response.json({ error: err.error?.message || "Search failed" }, { status: res.status });
          }

          const data = await res.json();

          // Transform response
          const items = data.items?.map((item: any) => {
            const id = item.id.videoId || item.id.channelId || item.id.playlistId;
            return {
              id,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
              channelId: item.snippet.channelId,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
            };
          }) || [];

          return Response.json({
            items,
            nextPageToken: data.nextPageToken,
          });
        } catch (err) {
          console.error("Search error:", err);
          return Response.json({ error: "Search failed" }, { status: 500 });
        }
      },
    },

    // Get playlist details
    "/api/youtube/playlists/:playlistId": {
      async GET(req) {
        if (!credentials) {
          return Response.json({ error: "Not configured" }, { status: 401 });
        }

        const playlistId = req.params.playlistId;

        try {
          const res = await youtubeApiRequest("playlists", {
            part: "snippet,contentDetails",
            id: playlistId,
          });

          if (!res.ok) {
            const err = await res.json();
            return Response.json({ error: err.error?.message || "Fetch failed" }, { status: res.status });
          }

          const data = await res.json();
          const item = data.items?.[0];

          if (!item) {
            return Response.json({ error: "Playlist not found" }, { status: 404 });
          }

          return Response.json({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            itemCount: item.contentDetails.itemCount,
            publishedAt: item.snippet.publishedAt,
          });
        } catch (err) {
          console.error("Playlist fetch error:", err);
          return Response.json({ error: "Fetch failed" }, { status: 500 });
        }
      },
    },

    // Get playlist items
    "/api/youtube/playlists/:playlistId/items": {
      async GET(req) {
        if (!credentials) {
          return Response.json({ error: "Not configured" }, { status: 401 });
        }

        const playlistId = req.params.playlistId;
        const url = new URL(req.url);
        const maxResults = url.searchParams.get("maxResults") || "50";
        const pageToken = url.searchParams.get("pageToken");

        try {
          const params: Record<string, string> = {
            part: "snippet,contentDetails",
            playlistId,
            maxResults,
          };
          if (pageToken) params.pageToken = pageToken;

          const res = await youtubeApiRequest("playlistItems", params);

          if (!res.ok) {
            const err = await res.json();
            return Response.json({ error: err.error?.message || "Fetch failed" }, { status: res.status });
          }

          const data = await res.json();

          const items = data.items?.map((item: any) => ({
            id: item.id,
            videoId: item.contentDetails.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelId: item.snippet.videoOwnerChannelId,
            channelTitle: item.snippet.videoOwnerChannelTitle,
            position: item.snippet.position,
          })) || [];

          return Response.json({
            items,
            nextPageToken: data.nextPageToken,
          });
        } catch (err) {
          console.error("Playlist items fetch error:", err);
          return Response.json({ error: "Fetch failed" }, { status: 500 });
        }
      },
    },

    // Get user's playlists
    "/api/youtube/playlists": {
      async GET(req) {
        if (!tokenData) {
          return Response.json({ error: "Not authorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const maxResults = url.searchParams.get("maxResults") || "20";
        const pageToken = url.searchParams.get("pageToken");

        try {
          const params: Record<string, string> = {
            part: "snippet,contentDetails",
            mine: "true",
            maxResults,
          };
          if (pageToken) params.pageToken = pageToken;

          const res = await youtubeApiRequest("playlists", params, true);

          if (!res.ok) {
            const err = await res.json();
            return Response.json({ error: err.error?.message || "Fetch failed" }, { status: res.status });
          }

          const data = await res.json();

          const items = data.items?.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            itemCount: item.contentDetails.itemCount,
          })) || [];

          return Response.json({
            items,
            nextPageToken: data.nextPageToken,
          });
        } catch (err) {
          console.error("My playlists fetch error:", err);
          return Response.json({ error: "Fetch failed" }, { status: 500 });
        }
      },
    },

    // Get liked videos
    "/api/youtube/videos/liked": {
      async GET(req) {
        if (!tokenData) {
          return Response.json({ error: "Not authorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const maxResults = url.searchParams.get("maxResults") || "20";
        const pageToken = url.searchParams.get("pageToken");

        try {
          const params: Record<string, string> = {
            part: "snippet,contentDetails",
            myRating: "like",
            maxResults,
          };
          if (pageToken) params.pageToken = pageToken;

          const res = await youtubeApiRequest("videos", params, true);

          if (!res.ok) {
            const err = await res.json();
            return Response.json({ error: err.error?.message || "Fetch failed" }, { status: res.status });
          }

          const data = await res.json();

          const items = data.items?.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
          })) || [];

          return Response.json({
            items,
            nextPageToken: data.nextPageToken,
          });
        } catch (err) {
          console.error("Liked videos fetch error:", err);
          return Response.json({ error: "Fetch failed" }, { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Local: http://localhost:${port}`);
if (localIP) console.log(`📡 Network: http://${localIP}:${port}`);
