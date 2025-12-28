import { useMemo, useCallback } from "react";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { useChartsInfinite } from "@/hooks/useChartsInfinite";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { Song } from "@/schemas";
import { Music, Play } from "lucide-react";
import { VirtualList } from "./VirtualList";

export function SongsChart() {
  const playSongs = usePlaySongs();
  const query = useChartsInfinite("songs");

  const songs = useMemo(
    () => (query.data?.pages.flatMap((p) => p.data) ?? []) as Song[],
    [query.data]
  );

  const handlePlay = useCallback(
    (idx: number) => {
      const songIds = songs.map((s) => s.id);
      playSongs(songIds, idx);
    },
    [songs, playSongs]
  );

  const renderSong = useCallback(
    (song: Song, idx: number) => (
      <div
        key={song.id}
        onClick={() => handlePlay(idx)}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
      >
        <span className={`
          w-8 text-center font-bold text-lg
          ${idx < 3 ? "text-primary" : "text-muted-foreground"}
        `}>
          {idx + 1}
        </span>
        {song.attributes.artwork ? (
          <img
            src={getArtworkUrl(song.attributes.artwork, 48)}
            alt={song.attributes.name}
            className="w-12 h-12 rounded-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{song.attributes.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {song.attributes.artistName}
          </p>
        </div>
        <div className="text-sm text-muted-foreground w-12 text-right">
          {formatDuration(song.attributes.durationInMillis)}
        </div>
        <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    ),
    [handlePlay]
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
    <VirtualList
      items={songs}
      hasNextPage={!!query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => query.fetchNextPage()}
      renderItem={renderSong}
      estimateSize={72}
      className="h-[600px]"
    />
  );
}
