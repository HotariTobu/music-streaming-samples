import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  getRouteApi,
} from "@tanstack/react-router";
import { z } from "zod";
import { RootLayout } from "./layouts/RootLayout";
import { SearchLayout } from "./layouts/SearchLayout";
import { LibraryLayout } from "./layouts/LibraryLayout";
import { SearchVideos } from "./components/SearchVideos";
import { SearchChannels } from "./components/SearchChannels";
import { SearchPlaylists } from "./components/SearchPlaylists";
import { PlaylistDetailPage } from "./components/PlaylistDetailPage";
import { LibraryPlaylists } from "./components/LibraryPlaylists";
import { LibraryLiked } from "./components/LibraryLiked";
import { LibraryHistory } from "./components/LibraryHistory";
import { PlaybackControls } from "./components/PlaybackControls";

// Search params schemas
const searchQuerySchema = z.object({
  q: z.string().optional(),
});

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Index route - redirect to /search/videos
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/search/videos" });
  },
});

// Search layout route
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchLayout,
  validateSearch: searchQuerySchema,
});

// Search child routes
const searchVideosRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/videos",
  component: SearchVideos,
});

const searchChannelsRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/channels",
  component: SearchChannels,
});

const searchPlaylistsRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/playlists",
  component: SearchPlaylists,
});

const searchPlaylistDetailRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/playlists/$playlistId",
  validateSearch: searchQuerySchema,
  component: function SearchPlaylistRoute() {
    const { playlistId } = getRouteApi("/search/playlists/$playlistId").useParams();
    const { q } = getRouteApi("/search/playlists/$playlistId").useSearch();
    const backTo = q ? `/search/playlists?q=${encodeURIComponent(q)}` : "/search/playlists";
    return <PlaylistDetailPage playlistId={playlistId} backTo={backTo} />;
  },
});

// Library layout route
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: LibraryLayout,
});

const libraryPlaylistsRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/playlists",
  component: LibraryPlaylists,
});

const libraryLikedRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/liked",
  component: LibraryLiked,
});

const libraryHistoryRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/history",
  component: LibraryHistory,
});

const libraryPlaylistDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/playlists/$playlistId",
  component: function LibraryPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/playlists/$playlistId").useParams();
    return <PlaylistDetailPage playlistId={playlistId} backTo="/library/playlists" />;
  },
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
  searchRoute.addChildren([
    searchVideosRoute,
    searchChannelsRoute,
    searchPlaylistsRoute,
    searchPlaylistDetailRoute,
  ]),
  libraryRoute.addChildren([
    libraryPlaylistsRoute,
    libraryLikedRoute,
    libraryHistoryRoute,
    libraryPlaylistDetailRoute,
  ]),
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
