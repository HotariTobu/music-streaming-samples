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
import { BrowseLayout } from "./layouts/BrowseLayout";
import { LibraryLayout } from "./layouts/LibraryLayout";
import { CatalogSearchTracks } from "./components/CatalogSearchTracks";
import { CatalogSearchAlbums } from "./components/CatalogSearchAlbums";
import { CatalogSearchArtists } from "./components/CatalogSearchArtists";
import { CatalogSearchPlaylists } from "./components/CatalogSearchPlaylists";
import { BrowseFeatured } from "./components/BrowseFeatured";
import { BrowseNewReleases } from "./components/BrowseNewReleases";
import { BrowseCategories } from "./components/BrowseCategories";
import { LibraryTracks } from "./components/LibraryTracks";
import { LibraryAlbums } from "./components/LibraryAlbums";
import { LibraryPlaylists } from "./components/LibraryPlaylists";
import { LibraryArtists } from "./components/LibraryArtists";
import { LibraryRecent } from "./components/LibraryRecent";
import { PlaybackControls } from "./components/PlaybackControls";
import { AlbumDetailPage } from "./components/AlbumDetailPage";
import { PlaylistDetailPage } from "./components/PlaylistDetailPage";
import { ArtistDetailPage } from "./components/ArtistDetailPage";
import { PlaylistDetailEditPage } from "./components/PlaylistDetailEditPage";

// Search params schemas
const searchQuerySchema = z.object({
  q: z.string().optional(),
});

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Index route - redirect to /search/tracks
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/search/tracks" });
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
const searchTracksRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/tracks",
  component: CatalogSearchTracks,
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
    return <AlbumDetailPage albumId={albumId} backTo="/search/albums" />;
  },
});

const searchArtistDetailRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/artists/$artistId",
  validateSearch: searchQuerySchema,
  component: function SearchArtistRoute() {
    const { artistId } = getRouteApi("/search/artists/$artistId").useParams();
    return <ArtistDetailPage artistId={artistId} backTo="/search/artists" />;
  },
});

const searchPlaylistDetailRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: "/playlists/$playlistId",
  validateSearch: searchQuerySchema,
  component: function SearchPlaylistRoute() {
    const { playlistId } = getRouteApi("/search/playlists/$playlistId").useParams();
    return <PlaylistDetailPage playlistId={playlistId} backTo="/search/playlists" />;
  },
});

// Browse layout route (equivalent to Charts in Apple Music)
const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  component: BrowseLayout,
});

const browseFeaturedRoute = createRoute({
  getParentRoute: () => browseRoute,
  path: "/featured",
  component: BrowseFeatured,
});

const browseNewReleasesRoute = createRoute({
  getParentRoute: () => browseRoute,
  path: "/releases",
  component: BrowseNewReleases,
});

const browseCategoriesRoute = createRoute({
  getParentRoute: () => browseRoute,
  path: "/categories",
  component: BrowseCategories,
});

const browseAlbumDetailRoute = createRoute({
  getParentRoute: () => browseRoute,
  path: "/albums/$albumId",
  component: function BrowseAlbumRoute() {
    const { albumId } = getRouteApi("/browse/albums/$albumId").useParams();
    return <AlbumDetailPage albumId={albumId} backTo="/browse/releases" />;
  },
});

const browsePlaylistDetailRoute = createRoute({
  getParentRoute: () => browseRoute,
  path: "/playlists/$playlistId",
  component: function BrowsePlaylistRoute() {
    const { playlistId } = getRouteApi("/browse/playlists/$playlistId").useParams();
    return <PlaylistDetailPage playlistId={playlistId} backTo="/browse/featured" />;
  },
});

// Library layout route
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/library",
  component: LibraryLayout,
});

const libraryTracksRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/tracks",
  component: LibraryTracks,
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
    return <AlbumDetailPage albumId={albumId} backTo="/library/albums" />;
  },
});

const libraryPlaylistDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/playlists/$playlistId",
  component: function LibraryPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/playlists/$playlistId").useParams();
    return <PlaylistDetailPage playlistId={playlistId} backTo="/library/playlists" isEditable />;
  },
});

const libraryPlaylistEditRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/playlists/$playlistId/edit",
  component: function LibraryPlaylistEditRoute() {
    const { playlistId } = getRouteApi("/library/playlists/$playlistId/edit").useParams();
    return (
      <PlaylistDetailEditPage
        playlistId={playlistId}
        backTo="/library/playlists/$playlistId"
        backToParams={{ playlistId }}
      />
    );
  },
});

const libraryArtistDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/artists/$artistId",
  component: function LibraryArtistRoute() {
    const { artistId } = getRouteApi("/library/artists/$artistId").useParams();
    return <ArtistDetailPage artistId={artistId} backTo="/library/artists" />;
  },
});

const recentAlbumDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/recent/albums/$albumId",
  component: function RecentAlbumRoute() {
    const { albumId } = getRouteApi("/library/recent/albums/$albumId").useParams();
    return <AlbumDetailPage albumId={albumId} backTo="/library/recent" />;
  },
});

const recentPlaylistDetailRoute = createRoute({
  getParentRoute: () => libraryRoute,
  path: "/recent/playlists/$playlistId",
  component: function RecentPlaylistRoute() {
    const { playlistId } = getRouteApi("/library/recent/playlists/$playlistId").useParams();
    return <PlaylistDetailPage playlistId={playlistId} backTo="/library/recent" />;
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
    searchTracksRoute,
    searchAlbumsRoute,
    searchArtistsRoute,
    searchPlaylistsRoute,
    searchAlbumDetailRoute,
    searchArtistDetailRoute,
    searchPlaylistDetailRoute,
  ]),
  browseRoute.addChildren([
    browseFeaturedRoute,
    browseNewReleasesRoute,
    browseCategoriesRoute,
    browseAlbumDetailRoute,
    browsePlaylistDetailRoute,
  ]),
  libraryRoute.addChildren([
    libraryTracksRoute,
    libraryAlbumsRoute,
    libraryPlaylistsRoute,
    libraryArtistsRoute,
    libraryRecentRoute,
    libraryAlbumDetailRoute,
    libraryPlaylistDetailRoute,
    libraryPlaylistEditRoute,
    libraryArtistDetailRoute,
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
