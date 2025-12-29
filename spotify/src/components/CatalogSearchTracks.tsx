import { useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearch";
import { usePlayTracks } from "@/hooks/usePlayback";
import { TrackList, type Track } from "./TrackList";
import { useSpotify } from "@/contexts/SpotifyContext";
import { getArtistNames } from "@/lib/utils";
import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatalogSearchTracks() {
  const { q } = useSearch({ strict: false }) as { q?: string };
  const { isAuthenticated, login } = useSpotify();
  const playTracks = usePlayTracks();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCatalogSearchInfinite(q ?? "", "track");

  const tracks: Track[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      (page.tracks?.items ?? []).map((track) => ({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artistName: getArtistNames(track.artists),
        albumName: track.album.name,
        durationMs: track.duration_ms,
        images: track.album.images,
        explicit: track.explicit,
      }))
    );
  }, [data]);

  const handlePlay = async (index: number) => {
    const uris = tracks.map((t) => t.uri);
    await playTracks(uris, index);
  };

  if (!q) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Log in to search</p>
        <Button
          onClick={login}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          Log in with Spotify
        </Button>
      </div>
    );
  }

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
        <p>{error instanceof Error ? error.message : "Failed to search"}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tracks found for "{q}"</p>
      </div>
    );
  }

  return (
    <TrackList
      tracks={tracks}
      onPlay={handlePlay}
      showAlbum
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
