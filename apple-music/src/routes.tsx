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
import { ChartsLayout } from "./layouts/ChartsLayout";
import { LibraryLayout } from "./layouts/LibraryLayout";
import { CatalogSearchSongs } from "./components/CatalogSearchSongs";
import { CatalogSearchAlbums } from "./components/CatalogSearchAlbums";
import { CatalogSearchArtists } from "./components/CatalogSearchArtists";
import { CatalogSearchPlaylists } from "./components/CatalogSearchPlaylists";
import { SongsChart } from "./components/SongsChart";
import { AlbumsChart } from "./components/AlbumsChart";
import { PlaylistsChart } from "./components/PlaylistsChart";
import { LibrarySongs } from "./components/LibrarySongs";
import { LibraryAlbums } from "./components/LibraryAlbums";
import { LibraryPlaylists } from "./components/LibraryPlaylists";
import { LibraryArtists } from "./components/LibraryArtists";
import { LibraryRecent } from "./components/LibraryRecent";
import { PlaybackControls } from "./components/PlaybackControls";
import { CatalogAlbumDetailPage } from "./components/CatalogAlbumDetailPage";
import { LibraryAlbumDetailPage } from "./components/LibraryAlbumDetailPage";
import { CatalogPlaylistDetailPage } from "./components/CatalogPlaylistDetailPage";
import { LibraryPlaylistDetailPage } from "./components/LibraryPlaylistDetailPage";

// Search params schemas
const searchQuerySchema = z.object({
  q: z.string().optional(),
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

// Charts layout route
const chartsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charts",
  component: ChartsLayout,
});

const chartsSongsRoute = createRoute({
  getParentRoute: () => chartsRoute,
  path: "/songs",
  component: SongsChart,
});

const chartsAlbumsRoute = createRoute({
  getParentRoute: () => chartsRoute,
  path: "/albums",
  component: AlbumsChart,
});

const chartsPlaylistsRoute = createRoute({
  getParentRoute: () => chartsRoute,
  path: "/playlists",
  component: PlaylistsChart,
});

const chartsAlbumDetailRoute = createRoute({
  getParentRoute: () => chartsRoute,
  path: "/albums/$albumId",
  component: function ChartsAlbumRoute() {
    const { albumId } = getRouteApi("/charts/albums/$albumId").useParams();
    return <CatalogAlbumDetailPage albumId={albumId} backTo="/charts/albums" />;
  },
});

const chartsPlaylistDetailRoute = createRoute({
  getParentRoute: () => chartsRoute,
  path: "/playlists/$playlistId",
  component: function ChartsPlaylistRoute() {
    const { playlistId } = getRouteApi("/charts/playlists/$playlistId").useParams();
    return <CatalogPlaylistDetailPage playlistId={playlistId} backTo="/charts/playlists" />;
  },
});

// Library layout route
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: LibraryLayout,
});

const librarySongsRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/songs",
  component: LibrarySongs,
});

const libraryAlbumsRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/albums",
  component: LibraryAlbums,
});

const libraryPlaylistsRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/playlists",
  component: LibraryPlaylists,
});

const libraryArtistsRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/artists",
  component: LibraryArtists,
});

const libraryRecentRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/recent",
  component: LibraryRecent,
});

const libraryAlbumDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/albums/$albumId",
  component: function LibraryAlbumRoute() {
    const { albumId } = getRouteApi("/library/albums/$albumId").useParams();
    return <LibraryAlbumDetailPage albumId={albumId} backTo="/library/albums" />;
  },
});

const libraryPlaylistDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/playlists/$playlistId",
  component: function LibraryPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/playlists/$playlistId").useParams();
    return <LibraryPlaylistDetailPage playlistId={playlistId} backTo="/library/playlists" />;
  },
});

const recentAlbumDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/recent/albums/$albumId",
  component: function RecentAlbumRoute() {
    const { albumId } = getRouteApi("/library/recent/albums/$albumId").useParams();
    return <CatalogAlbumDetailPage albumId={albumId} backTo="/library/recent" />;
  },
});

const recentPlaylistDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/recent/playlists/$playlistId",
  component: function RecentPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/recent/playlists/$playlistId").useParams();
    return <CatalogPlaylistDetailPage playlistId={playlistId} backTo="/library/recent" />;
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
  chartsRoute.addChildren([
    chartsSongsRoute,
    chartsAlbumsRoute,
    chartsPlaylistsRoute,
    chartsAlbumDetailRoute,
    chartsPlaylistDetailRoute,
  ]),
  libraryRoute.addChildren([
    librarySongsRoute,
    libraryAlbumsRoute,
    libraryPlaylistsRoute,
    libraryArtistsRoute,
    libraryRecentRoute,
    libraryAlbumDetailRoute,
    libraryPlaylistDetailRoute,
    recentAlbumDetailRoute,
    recentPlaylistDetailRoute,
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
