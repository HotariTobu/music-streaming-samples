import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useLibraryAlbum } from "@/hooks/useLibraryAlbum";
import { useLibraryAlbumTracksInfinite } from "@/hooks/useLibraryAlbumTracksInfinite";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { transformLibraryAlbum, transformLibrarySongs } from "@/lib/media-transforms";
import { MediaDetailView } from "@/components/media-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

interface LibraryAlbumDetailPageProps {
  albumId: string;
  backTo: string;
}

export function LibraryAlbumDetailPage({ albumId, backTo }: LibraryAlbumDetailPageProps) {
  const { data: album, isLoading } = useLibraryAlbum(albumId);
  const tracksQuery = useLibraryAlbumTracksInfinite(albumId);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
      media={transformLibraryAlbum(album)}
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
