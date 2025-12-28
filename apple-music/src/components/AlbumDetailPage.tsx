import { useMemo, useCallback } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import {
  useLibraryAlbum,
  useCatalogAlbum,
  useLibraryAlbumTracksInfinite,
  useCatalogAlbumTracksInfinite,
} from "@/hooks/useMusicKitQuery";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { LibrarySong, Song } from "@/schemas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Music, Disc, Lock } from "lucide-react";
import { VirtualList } from "./VirtualList";

const libraryRouteApi = getRouteApi("/library/albums/$albumId");
const catalogRouteApi = getRouteApi("/albums/$albumId");
const chartsRouteApi = getRouteApi("/charts/albums/$albumId");

type AlbumDetailPageProps = {
  source: "library" | "catalog" | "charts";
};

export function AlbumDetailPage({ source }: AlbumDetailPageProps) {
  const { musicKit, isAuthorized, authorize } = useMusicKit();

  const routeApi = source === "library"
    ? libraryRouteApi
    : source === "charts"
      ? chartsRouteApi
      : catalogRouteApi;
  const { albumId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const isCatalog = source === "catalog" || source === "charts";

  // Fetch album data based on source
  const { data: libraryAlbum, isLoading: isLoadingLibraryAlbum } = useLibraryAlbum(
    source === "library" ? albumId : undefined
  );
  const { data: catalogAlbum, isLoading: isLoadingCatalogAlbum } = useCatalogAlbum(
    isCatalog ? albumId : undefined
  );

  // Fetch tracks with infinite queries based on source
  const libraryTracksQuery = useLibraryAlbumTracksInfinite(
    source === "library" ? albumId : undefined
  );
  const catalogTracksQuery = useCatalogAlbumTracksInfinite(
    isCatalog ? albumId : undefined
  );

  const album = source === "library" ? libraryAlbum : catalogAlbum;
  const tracksQuery = source === "library" ? libraryTracksQuery : catalogTracksQuery;
  const isLoadingAlbum = source === "library" ? isLoadingLibraryAlbum : isLoadingCatalogAlbum;

  // Flatten paginated data
  type TrackType = LibrarySong | Song;
  const tracks = useMemo((): TrackType[] => {
    if (!tracksQuery.data) return [];
    return tracksQuery.data.pages.flatMap(
      (p) => p.data as TrackType[]
    );
  }, [tracksQuery.data]);

  const playAlbum = async () => {
    if (!musicKit || !album) return;
    try {
      await musicKit.setQueue({ album: album.id });
      await musicKit.play();
    } catch (err) {
      console.error("[AlbumDetailPage] Play album failed:", err);
    }
  };

  const playSong = useCallback(
    async (startIndex: number) => {
      if (!musicKit || !album) return;
      try {
        await musicKit.setQueue({ album: album.id });
        await musicKit.changeToMediaAtIndex(startIndex);
        await musicKit.play();
      } catch (err) {
        console.error("[AlbumDetailPage] Play song failed:", err);
      }
    },
    [musicKit, album]
  );

  const goBack = () => {
    if (source === "library") {
      navigate({ to: "/library", search: { tab: "albums" } });
    } else if (source === "charts") {
      navigate({ to: "/charts", search: { tab: "albums" } });
    } else {
      window.history.back();
    }
  };

  // Render function for virtual list
  const renderTrack = useCallback(
    (track: LibrarySong | Song, idx: number) => (
      <div
        key={track.id}
        onClick={() => playSong(idx)}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
      >
        <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
          {track.attributes.trackNumber || idx + 1}
        </span>
        <span className="w-6 text-center hidden group-hover:flex justify-center text-foreground">
          <Play className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {track.attributes.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {track.attributes.artistName}
          </p>
        </div>
        <div className="text-sm text-muted-foreground w-12 text-right">
          {formatDuration(track.attributes.durationInMillis)}
        </div>
      </div>
    ),
    [playSong]
  );

  // Not authorized (only for library source)
  if (source === "library" && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Authorization Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            To view your albums, you need to authorize this app with your
            Apple Music account.
          </p>
          <Button
            onClick={authorize}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            Authorize with Apple Music
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoadingAlbum) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not found
  if (!album) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Album not found</h2>
        </div>
      </div>
    );
  }

  const trackCount = album.attributes.trackCount || tracks.length;
  const releaseYear = album.attributes.releaseDate
    ? new Date(album.attributes.releaseDate).getFullYear()
    : null;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Album</h2>
      </div>

      {/* Album info */}
      <div className="flex gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          {album.attributes.artwork ? (
            <img
              src={getArtworkUrl(album.attributes.artwork, 200)}
              alt={album.attributes.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Disc className="h-16 w-16 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {album.attributes.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {album.attributes.artistName}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {trackCount} {trackCount === 1 ? "song" : "songs"}
              {releaseYear && ` • ${releaseYear}`}
              {album.attributes.genreNames?.[0] && ` • ${album.attributes.genreNames[0]}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={playAlbum}
              disabled={trackCount === 0}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
        </div>
      </div>

      {/* Track list */}
      {tracksQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-2" />
          <p>No tracks available</p>
        </div>
      ) : (
        <VirtualList
          items={tracks}
          hasNextPage={!!tracksQuery.hasNextPage}
          isFetchingNextPage={tracksQuery.isFetchingNextPage}
          fetchNextPage={() => tracksQuery.fetchNextPage()}
          renderItem={renderTrack}
          estimateSize={64}
          className="h-[500px]"
        />
      )}
    </div>
  );
}

export function LibraryAlbumDetailPage() {
  return <AlbumDetailPage source="library" />;
}

export function CatalogAlbumDetailPage() {
  return <AlbumDetailPage source="catalog" />;
}

export function ChartsAlbumDetailPage() {
  return <AlbumDetailPage source="charts" />;
}
