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
