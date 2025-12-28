import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { Artwork } from "@/schemas";
import { Music, Play } from "lucide-react";

export interface Song {
  id: string;
  name: string;
  artistName: string;
  durationInMillis: number;
  artwork?: Artwork;
}

interface SongListProps {
  songs: Song[];
  onPlay: (index: number) => void;
  showArtwork?: boolean;
  renderExtra?: (song: Song, index: number) => ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
}

export function SongList({
  songs,
  onPlay,
  showArtwork = true,
  renderExtra,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
}: SongListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (showArtwork ? 72 : 64),
    onChange: (instance) => {
      const lastItem = instance.getVirtualItems().at(-1);
      if (
        lastItem &&
        lastItem.index >= songs.length - 1 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage?.();
      }
    },
  });

  return (
    <div ref={parentRef} className={`overflow-auto ${className ?? "h-[600px]"}`}>
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const song = songs[virtualItem.index];
          if (!song) return null;

          return (
            <div
              key={song.id}
              className="absolute top-0 left-0 w-full"
              style={{
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div
                onClick={() => onPlay(virtualItem.index)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
              >
                <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
                  {virtualItem.index + 1}
                </span>
                <span className="w-6 text-center hidden group-hover:flex justify-center text-foreground">
                  <Play className="h-4 w-4" />
                </span>
                {showArtwork &&
                  (song.artwork ? (
                    <img
                      src={getArtworkUrl(song.artwork, 48)}
                      alt={song.name}
                      className="w-12 h-12 rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {song.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artistName}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground w-12 text-right">
                  {formatDuration(song.durationInMillis)}
                </div>
                {renderExtra?.(song, virtualItem.index)}
              </div>
            </div>
          );
        })}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
