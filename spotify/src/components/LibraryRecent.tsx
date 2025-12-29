import { useMemo } from "react";
import { useRecentlyPlayed } from "@/hooks/useLibrary";
import { usePlayTracks } from "@/hooks/usePlayback";
import { TrackList, type Track } from "./TrackList";
import { getArtistNames, formatDate } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

export function LibraryRecent() {
  const { data, isLoading, isError, error } = useRecentlyPlayed(50);
  const playTracks = usePlayTracks();

  const tracks: Track[] = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((item) => ({
      id: item.track.id,
      uri: item.track.uri,
      name: item.track.name,
      artistName: getArtistNames(item.track.artists),
      albumName: item.track.album.name,
      durationMs: item.track.duration_ms,
      images: item.track.album.images,
      explicit: item.track.explicit,
    }));
  }, [data]);

  const handlePlay = async (index: number) => {
    const uris = tracks.map((t) => t.uri);
    await playTracks(uris, index);
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
        <p>{error instanceof Error ? error.message : "Failed to load"}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-2" />
        <p>No recently played tracks</p>
      </div>
    );
  }

  return (
    <TrackList
      tracks={tracks}
      onPlay={handlePlay}
      showAlbum
      className="h-auto max-h-[600px]"
    />
  );
}
