import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useCatalogAlbum } from "@/hooks/useCatalogAlbum";
import { useCatalogAlbumTracksInfinite } from "@/hooks/useCatalogAlbumTracksInfinite";
import { usePlayAlbum } from "@/hooks/usePlayAlbum";
import {
  transformCatalogAlbum,
  transformCatalogSongs,
} from "@/lib/media-transforms";
import { MediaDetailView } from "@/components/media-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

interface CatalogAlbumDetailPageProps {
  albumId: string;
  backTo: string;
}

export function CatalogAlbumDetailPage({ albumId, backTo }: CatalogAlbumDetailPageProps) {
  const { isReady } = useMusicKit();

  const { data: album, isLoading } = useCatalogAlbum(albumId);
  const tracksQuery = useCatalogAlbumTracksInfinite(albumId);
  const playAlbum = usePlayAlbum();

  const tracks = useMemo(
    () =>
      transformCatalogSongs(
        tracksQuery.data?.pages.flatMap((p) => p.data) ?? []
      ),
    [tracksQuery.data]
  );

  const handlePlay = () => {
    if (album) playAlbum(album.id);
  };

  const handlePlayTrack = (index: number) => {
    if (album) playAlbum(album.id, index);
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
  if (!album) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={backTo}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">Album not found</h2>
        </div>
      </div>
    );
  }

  return (
    <MediaDetailView
      media={transformCatalogAlbum(album)}
      tracks={tracks}
      mediaType="album"
      backTo={backTo}
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
