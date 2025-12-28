import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { z } from "zod";
import { RootLayout } from "./layouts/RootLayout";
import { CatalogSearch } from "./components/CatalogSearch";
import { Charts } from "./components/Charts";
import { UserLibrary } from "./components/UserLibrary";
import { PlaybackControls } from "./components/PlaybackControls";

// Search params schemas
const searchTabSchema = z.object({
  tab: z.enum(["songs", "albums", "artists", "playlists"]).default("songs"),
  q: z.string().optional(),
});

const chartsTabSchema = z.object({
  tab: z.enum(["songs", "albums", "playlists"]).default("songs"),
});

const libraryTabSchema = z.object({
  tab: z.enum(["songs", "albums", "playlists", "artists", "recent"]).default("songs"),
});

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Search route (index)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CatalogSearch,
  validateSearch: searchTabSchema,
});

// Charts route
const chartsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charts",
  component: Charts,
  validateSearch: chartsTabSchema,
});

// Library route
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: UserLibrary,
  validateSearch: libraryTabSchema,
});

// Player route
const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player",
  component: PlaybackControls,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  chartsRoute,
  libraryRoute,
  playerRoute,
]);

// Create router
export const router = createRouter({ routeTree });

// Type registration for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
