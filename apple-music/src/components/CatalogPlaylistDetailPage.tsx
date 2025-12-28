import { useMemo, useCallback } from "react";
import { getRouteApi, Link, useRouter } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { usePlayPlaylist } from "@/hooks/usePlayPlaylist";
import { useCatalogPlaylist } from "@/hooks/useCatalogPlaylist";
import { useCatalogPlaylistTracksInfinite } from "@/hooks/useCatalogPlaylistTracksInfinite";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { Song } from "@/schemas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Music, ListMusic } from "lucide-react";
import { VirtualList } from "./VirtualList";

const routeApi = getRouteApi("/playlists/$playlistId");

export function CatalogPlaylistDetailPage() {
  const { isAuthorized, authorize } = useMusicKit();
  const playPlaylist = usePlayPlaylist();
  const { playlistId } = routeApi.useParams();
  const router = useRouter();

  const { data: playlist, isLoading: isLoadingPlaylist } =
    useCatalogPlaylist(playlistId);
  const tracksQuery = useCatalogPlaylistTracksInfinite(playlistId);

  // Flatten paginated data
  const tracks = useMemo(
    () => tracksQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [tracksQuery.data]
  );

  const handlePlayPlaylist = () => {
    if (!playlist) return;
    playPlaylist(playlist.id);
  };

  const handlePlaySong = (startIndex: number) => {
    if (!playlist) return;
    playPlaylist(playlist.id, startIndex);
  };

  const handleBack = () => {
    router.history.back();
  };

  // Render function for virtual list
  const renderTrack = useCallback(
    (track: Song, idx: number) => (
      <div
        key={track.id}
        onClick={() => handlePlaySong(idx)}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
      >
        <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
          {idx + 1}
        </span>
        <span className="w-6 text-center hidden group-hover:flex justify-center text-foreground">
          <Play className="h-4 w-4" />
        </span>
        {track.attributes.artwork ? (
          <img
            src={getArtworkUrl(track.attributes.artwork, 48)}
            alt={track.attributes.name}
            className="w-12 h-12 rounded-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
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
    [handlePlaySong]
  );

  // Loading
  if (isLoadingPlaylist) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not found
  if (!playlist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Playlist not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Playlist</h2>
      </div>

      {/* Playlist info */}
      <div className="flex gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          {playlist.attributes.artwork ? (
            <img
              src={getArtworkUrl(playlist.attributes.artwork, 200)}
              alt={playlist.attributes.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <ListMusic className="h-16 w-16 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {playlist.attributes.name}
            </h1>
            {playlist.attributes.curatorName && (
              <p className="text-muted-foreground mt-1">
                by {playlist.attributes.curatorName}
              </p>
            )}
            {playlist.attributes.description?.standard && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {playlist.attributes.description.standard}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {playlist.attributes.trackCount ?? tracks.length}{" "}
              {(playlist.attributes.trackCount ?? tracks.length) === 1
                ? "song"
                : "songs"}
            </p>
          </div>
          <div className="flex gap-2">
            {isAuthorized ? (
              <Button
                onClick={handlePlayPlaylist}
                disabled={tracks.length === 0 && !playlist.attributes.trackCount}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
            ) : (
              <Button
                onClick={authorize}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              >
                Authorize to Play
              </Button>
            )}
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
          <p>No songs in this playlist</p>
        </div>
      ) : (
        <VirtualList
          items={tracks}
          hasNextPage={!!tracksQuery.hasNextPage}
          isFetchingNextPage={tracksQuery.isFetchingNextPage}
          fetchNextPage={() => tracksQuery.fetchNextPage()}
          renderItem={renderTrack}
          estimateSize={72}
          className="h-[500px]"
        />
      )}
    </div>
  );
}
