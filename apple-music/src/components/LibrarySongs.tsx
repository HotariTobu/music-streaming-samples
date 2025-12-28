import { useMemo, useCallback } from "react";
import { useLibrarySongsInfinite } from "@/hooks/useLibrarySongsInfinite";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { LibrarySong } from "@/schemas";
import { Music, Play } from "lucide-react";
import { VirtualList } from "./VirtualList";

export function LibrarySongs() {
  const playSongs = usePlaySongs();
  const query = useLibrarySongsInfinite();

  const songs = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
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
    (song: LibrarySong, idx: number) => (
      <div
        key={song.id}
        onClick={() => handlePlay(idx)}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
      >
        <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
          {idx + 1}
        </span>
        <span className="w-6 text-center hidden group-hover:flex justify-center text-foreground">
          <Play className="h-4 w-4" />
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
        {query.error instanceof Error ? query.error.message : "Failed to load songs"}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Music className="h-10 w-10 mx-auto mb-2" />
        <p>No songs in your library</p>
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
