import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useLibraryPlaylist } from "@/hooks/useLibraryPlaylist";
import { usePlaylistTracksInfinite } from "@/hooks/usePlaylistTracksInfinite";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { transformLibraryPlaylist, transformLibrarySongs } from "@/lib/media-transforms";
import { MediaDetailView } from "@/components/media-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pencil } from "lucide-react";

interface LibraryPlaylistDetailPageProps {
  playlistId: string;
  backTo: string;
}

export function LibraryPlaylistDetailPage({ playlistId, backTo }: LibraryPlaylistDetailPageProps) {
  const { isReady } = useMusicKit();
  const { data: playlist, isLoading } = useLibraryPlaylist(playlistId);
  const tracksQuery = usePlaylistTracksInfinite(playlistId);
  const playSongs = usePlaySongs();

  const tracks = useMemo(
    () => transformLibrarySongs(tracksQuery.data?.pages.flatMap((p) => p.data) ?? []),
    [tracksQuery.data]
  );

  const handlePlay = () => {
    if (tracks.length > 0) {
      const songIds = tracks.map((t) => t.id);
      playSongs(songIds);
    }
  };

  const handlePlayTrack = (index: number) => {
    if (tracks.length > 0) {
      const songIds = tracks.map((t) => t.id);
      playSongs(songIds, index);
    }
  };

  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={backTo}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">Playlist not found</h2>
        </div>
      </div>
    );
  }

  return (
    <MediaDetailView
      media={transformLibraryPlaylist(playlist)}
      tracks={tracks}
      mediaType="playlist"
      backTo={backTo}
      onPlayTrack={handlePlayTrack}
      isLoadingTracks={tracksQuery.isLoading}
      hasNextPage={!!tracksQuery.hasNextPage}
      isFetchingNextPage={tracksQuery.isFetchingNextPage}
      fetchNextPage={() => tracksQuery.fetchNextPage()}
      showTrackArtwork
      actions={
        <>
          {playlist.attributes.canEdit && (
            <Button variant="outline" size="icon" asChild>
              <Link to={`/library/playlists/${playlistId}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button
            onClick={handlePlay}
            disabled={tracks.length === 0}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Play
          </Button>
        </>
      }
    />
  );
}
