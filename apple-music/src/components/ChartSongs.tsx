import { useMemo, useCallback } from "react";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { useChartsInfinite } from "@/hooks/useChartsInfinite";
import type { Song as CatalogSong } from "@/schemas";
import { Music } from "lucide-react";
import { SongList, type Song } from "./SongList";

export function ChartSongs() {
  const playSongs = usePlaySongs();
  const query = useChartsInfinite("songs");

  const songs: Song[] = useMemo(
    () =>
      (query.data?.pages.flatMap((p) => p.data) as CatalogSong[] | undefined)?.map(
        (s) => ({
          id: s.id,
          name: s.attributes.name,
          artistName: s.attributes.artistName,
          durationInMillis: s.attributes.durationInMillis,
          artwork: s.attributes.artwork,
        })
      ) ?? [],
    [query.data]
  );

  const handlePlay = useCallback(
    (idx: number) => {
      const songIds = songs.map((s) => s.id);
      playSongs(songIds, idx);
    },
    [songs, playSongs]
  );

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="text-center py-12 text-destructive">
        {query.error instanceof Error ? query.error.message : "Failed to load songs chart"}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Music className="h-10 w-10 mx-auto mb-2" />
        <p>No songs available</p>
      </div>
    );
  }

  return (
    <SongList
      songs={songs}
      onPlay={handlePlay}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => query.fetchNextPage()}
    />
  );
}
