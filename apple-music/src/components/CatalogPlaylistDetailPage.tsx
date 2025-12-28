import { useMemo } from "react";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useCatalogPlaylist } from "@/hooks/useCatalogPlaylist";
import { useCatalogPlaylistTracksInfinite } from "@/hooks/useCatalogPlaylistTracksInfinite";
import { usePlayPlaylist } from "@/hooks/usePlayPlaylist";
import {
  transformCatalogPlaylist,
  transformCatalogSongs,
} from "@/lib/media-transforms";
import { MediaDetailView } from "@/components/media-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

const routeApi = getRouteApi("/playlists/$playlistId");

export function CatalogPlaylistDetailPage() {
  const { isReady } = useMusicKit();
  const { playlistId } = routeApi.useParams();
  const router = useRouter();

  const { data: playlist, isLoading } = useCatalogPlaylist(playlistId);
  const tracksQuery = useCatalogPlaylistTracksInfinite(playlistId);
  const playPlaylist = usePlayPlaylist();

  const tracks = useMemo(
    () =>
      transformCatalogSongs(
        tracksQuery.data?.pages.flatMap((p) => p.data) ?? []
      ),
    [tracksQuery.data]
  );

  const handleBack = () => {
    router.history.back();
  };

  const handlePlay = () => {
    if (playlist) playPlaylist(playlist.id);
  };

  const handlePlayTrack = (index: number) => {
    if (playlist) playPlaylist(playlist.id, index);
  };

  // Loading (including MusicKit initialization)
  if (isLoading || !isReady) {
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
    <MediaDetailView
      media={transformCatalogPlaylist(playlist)}
      tracks={tracks}
      mediaType="playlist"
      onBack={handleBack}
      onPlayTrack={handlePlayTrack}
      isLoadingTracks={tracksQuery.isLoading}
      hasNextPage={!!tracksQuery.hasNextPage}
      isFetchingNextPage={tracksQuery.isFetchingNextPage}
      fetchNextPage={() => tracksQuery.fetchNextPage()}
      showTrackArtwork
      actions={
        <Button
          onClick={handlePlay}
          disabled={tracks.length === 0}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        >
          <Play className="h-4 w-4 mr-2" />
          Play
        </Button>
      }
    />
  );
}
