import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { usePlaylist, usePlaylistTracksInfinite } from "@/hooks/usePlaylist";
import { usePlayPlaylist, usePlayTracks } from "@/hooks/usePlayback";
import { TrackList, type Track } from "./TrackList";
import { Button } from "@/components/ui/button";
import { getImageUrl, getArtistNames } from "@/lib/utils";
import { ArrowLeft, Play, ListMusic, Edit, AlertTriangle } from "lucide-react";

interface PlaylistDetailPageProps {
  playlistId: string;
  backTo: string;
  backToParams?: Record<string, string>;
  isEditable?: boolean;
}

export function PlaylistDetailPage({
  playlistId,
  backTo,
  backToParams,
  isEditable = false,
}: PlaylistDetailPageProps) {
  const { data: playlist, isLoading, isError, error } = usePlaylist(playlistId);
  const {
    data: tracksData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePlaylistTracksInfinite(playlistId);
  const playPlaylist = usePlayPlaylist();
  const playTracks = usePlayTracks();

  const tracks: Track[] = useMemo(() => {
    if (!tracksData?.pages) return [];
    return tracksData.pages
      .flatMap((page) => page.items)
      .filter((item) => item.track !== null)
      .map((item) => ({
        id: item.track!.id,
        uri: item.track!.uri,
        name: item.track!.name,
        artistName: getArtistNames(item.track!.artists),
        albumName: item.track!.album.name,
        durationMs: item.track!.duration_ms,
        images: item.track!.album.images,
        explicit: item.track!.explicit,
      }));
  }, [tracksData]);

  const handlePlay = async (index: number = 0) => {
    if (playlist) {
      // If starting from beginning, use context_uri for better queue behavior
      if (index === 0) {
        await playPlaylist(playlist.uri);
      } else {
        // For specific track, use track URIs
        const uris = tracks.map((t) => t.uri);
        await playTracks(uris, index);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error instanceof Error ? error.message : "Failed to load playlist"}</p>
      </div>
    );
  }

  if (!playlist) return null;

  const imageUrl = getImageUrl(playlist.images, 300);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link to={backTo} params={backToParams}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      {/* Playlist header */}
      <div className="flex gap-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={playlist.name}
            className="w-48 h-48 rounded-lg shadow-lg object-cover"
          />
        ) : (
          <div className="w-48 h-48 rounded-lg bg-secondary flex items-center justify-center">
            <ListMusic className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Playlist
          </p>
          <h1 className="text-3xl font-bold text-foreground">{playlist.name}</h1>
          {playlist.description && (
            <p
              className="text-muted-foreground mt-2 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: playlist.description }}
            />
          )}
          <p className="text-sm text-muted-foreground">
            by {playlist.owner.display_name} • {playlist.tracks.total} tracks
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => handlePlay()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            {isEditable && (
              <Button variant="outline" asChild>
                <Link
                  to="/library/playlists/$playlistId/edit"
                  params={{ playlistId }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Track list */}
      <TrackList
        tracks={tracks}
        onPlay={handlePlay}
        showAlbum
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        className="h-auto max-h-[600px]"
      />
    </div>
  );
}
