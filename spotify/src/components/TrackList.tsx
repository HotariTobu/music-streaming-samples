import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { formatDuration, getImageUrl } from "@/lib/utils";
import type { SpotifyImage } from "@/schemas";
import { Music, Play } from "lucide-react";

export interface Track {
  id: string;
  uri: string;
  name: string;
  artistName: string;
  albumName?: string;
  durationMs: number;
  images?: SpotifyImage[];
  explicit?: boolean;
}

interface TrackListProps {
  tracks: Track[];
  onPlay: (index: number) => void;
  showArtwork?: boolean;
  showAlbum?: boolean;
  renderExtra?: (track: Track, index: number) => ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
}

export function TrackList({
  tracks,
  onPlay,
  showArtwork = true,
  showAlbum = false,
  renderExtra,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  className,
}: TrackListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (showArtwork ? 72 : 64),
    onChange: (instance) => {
      const lastItem = instance.getVirtualItems().at(-1);
      if (
        lastItem &&
        lastItem.index >= tracks.length - 1 &&
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
          const track = tracks[virtualItem.index];
          if (!track) return null;

          const imageUrl = getImageUrl(track.images, 48);

          return (
            <div
              key={track.id}
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
                  (imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={track.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate flex items-center gap-2">
                    {track.name}
                    {track.explicit && (
                      <span className="text-xs px-1 py-0.5 bg-muted rounded text-muted-foreground">
                        E
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artistName}
                    {showAlbum && track.albumName && (
                      <span> • {track.albumName}</span>
                    )}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground w-12 text-right">
                  {formatDuration(track.durationMs)}
                </div>
                {renderExtra?.(track, virtualItem.index)}
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
