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
import { CatalogSearchSongs } from "./components/CatalogSearchSongs";
import { CatalogSearchAlbums } from "./components/CatalogSearchAlbums";
import { CatalogSearchArtists } from "./components/CatalogSearchArtists";
import { CatalogSearchPlaylists } from "./components/CatalogSearchPlaylists";
import { Charts } from "./components/Charts";
import { UserLibrary } from "./components/UserLibrary";
import { PlaybackControls } from "./components/PlaybackControls";
import { CatalogAlbumDetailPage } from "./components/CatalogAlbumDetailPage";
import { LibraryAlbumDetailPage } from "./components/LibraryAlbumDetailPage";
import { CatalogPlaylistDetailPage } from "./components/CatalogPlaylistDetailPage";
import { LibraryPlaylistDetailPage } from "./components/LibraryPlaylistDetailPage";

// Search params schemas
const searchQuerySchema = z.object({
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

// Index route - redirect to /search/songs
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/search/songs" });
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
const searchSongsRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/songs",
  component: CatalogSearchSongs,
});

const searchAlbumsRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/albums",
  component: CatalogSearchAlbums,
});

const searchArtistsRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/artists",
  component: CatalogSearchArtists,
});

const searchPlaylistsRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/playlists",
  component: CatalogSearchPlaylists,
});

// Search album detail route
const searchAlbumDetailRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/albums/$albumId",
  validateSearch: searchQuerySchema,
  component: function SearchAlbumRoute() {
    const { albumId } = getRouteApi("/search/albums/$albumId").useParams();
    const { q } = getRouteApi("/search/albums/$albumId").useSearch();
    const backTo = q ? `/search/albums?q=${encodeURIComponent(q)}` : "/search/albums";
    return <CatalogAlbumDetailPage albumId={albumId} backTo={backTo} />;
  },
});

// Search playlist detail route
const searchPlaylistDetailRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/playlists/$playlistId",
  validateSearch: searchQuerySchema,
  component: function SearchPlaylistRoute() {
    const { playlistId } = getRouteApi("/search/playlists/$playlistId").useParams();
    const { q } = getRouteApi("/search/playlists/$playlistId").useSearch();
    const backTo = q ? `/search/playlists?q=${encodeURIComponent(q)}` : "/search/playlists";
    return <CatalogPlaylistDetailPage playlistId={playlistId} backTo={backTo} />;
  },
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

// Charts album/playlist detail routes
const chartsAlbumDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charts/albums/$albumId",
  component: function ChartsAlbumRoute() {
    const { albumId } = getRouteApi("/charts/albums/$albumId").useParams();
    return <CatalogAlbumDetailPage albumId={albumId} backTo="/charts?tab=albums" />;
  },
});

const chartsPlaylistDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charts/playlists/$playlistId",
  component: function ChartsPlaylistRoute() {
    const { playlistId } = getRouteApi("/charts/playlists/$playlistId").useParams();
    return <CatalogPlaylistDetailPage playlistId={playlistId} backTo="/charts?tab=playlists" />;
  },
});

// Library detail routes
const recentAlbumDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library/recent/albums/$albumId",
  component: function RecentAlbumRoute() {
    const { albumId } = getRouteApi("/library/recent/albums/$albumId").useParams();
    return <CatalogAlbumDetailPage albumId={albumId} backTo="/library?tab=recent" />;
  },
});

const recentPlaylistDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library/recent/playlists/$playlistId",
  component: function RecentPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/recent/playlists/$playlistId").useParams();
    return <CatalogPlaylistDetailPage playlistId={playlistId} backTo="/library?tab=recent" />;
  },
});

const libraryAlbumDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library/albums/$albumId",
  component: function LibraryAlbumRoute() {
    const { albumId } = getRouteApi("/library/albums/$albumId").useParams();
    return <LibraryAlbumDetailPage albumId={albumId} backTo="/library?tab=albums" />;
  },
});

const libraryPlaylistDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library/playlists/$playlistId",
  component: function LibraryPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/playlists/$playlistId").useParams();
    return <LibraryPlaylistDetailPage playlistId={playlistId} backTo="/library?tab=playlists" />;
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
    searchSongsRoute,
    searchAlbumsRoute,
    searchArtistsRoute,
    searchPlaylistsRoute,
    searchAlbumDetailRoute,
    searchPlaylistDetailRoute,
  ]),
  chartsRoute,
  libraryRoute,
  chartsAlbumDetailRoute,
  chartsPlaylistDetailRoute,
  recentAlbumDetailRoute,
  recentPlaylistDetailRoute,
  libraryAlbumDetailRoute,
  libraryPlaylistDetailRoute,
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
