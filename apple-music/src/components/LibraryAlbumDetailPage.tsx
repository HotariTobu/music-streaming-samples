import { useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useLibraryAlbum } from "@/hooks/useLibraryAlbum";
import { useLibraryAlbumTracksInfinite } from "@/hooks/useLibraryAlbumTracksInfinite";
import { usePlayAlbum } from "@/hooks/usePlayAlbum";
import {
  transformLibraryAlbum,
  transformLibrarySongs,
} from "@/lib/media-transforms";
import { MediaDetailView } from "@/components/media-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Lock } from "lucide-react";

const routeApi = getRouteApi("/library/albums/$albumId");

export function LibraryAlbumDetailPage() {
  const { isAuthorized, authorize } = useMusicKit();
  const { albumId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: album, isLoading } = useLibraryAlbum(albumId);
  const tracksQuery = useLibraryAlbumTracksInfinite(albumId);
  const playAlbum = usePlayAlbum();

  const tracks = useMemo(
    () =>
      transformLibrarySongs(
        tracksQuery.data?.pages.flatMap((p) => p.data) ?? []
      ),
    [tracksQuery.data]
  );

  const handleBack = () => {
    navigate({ to: "/library", search: { tab: "albums" } });
  };

  const handlePlay = () => {
    if (album) playAlbum(album.id);
  };

  const handlePlayTrack = (index: number) => {
    if (album) playAlbum(album.id, index);
  };

  // Authorization required
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Authorization Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            To view your albums, you need to authorize this app with your Apple
            Music account.
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
  if (isLoading) {
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
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Album not found</h2>
        </div>
      </div>
    );
  }

  return (
    <MediaDetailView
      media={transformLibraryAlbum(album)}
      tracks={tracks}
      mediaType="album"
      onBack={handleBack}
      onPlayTrack={handlePlayTrack}
      isLoadingTracks={tracksQuery.isLoading}
      hasNextPage={!!tracksQuery.hasNextPage}
      isFetchingNextPage={tracksQuery.isFetchingNextPage}
      fetchNextPage={() => tracksQuery.fetchNextPage()}
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
