import { useMemo, useRef } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearchInfinite";
import { getArtworkUrl } from "@/lib/utils";
import type { Playlist } from "@/schemas";
import { ListMusic, Search } from "lucide-react";

export function CatalogSearchPlaylists() {
  const parentRef = useRef<HTMLDivElement>(null);
  const { q } = useSearch({ strict: false }) as { q?: string };
  const query = q ?? "";

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useCatalogSearchInfinite(query, "playlists");

  const playlists = useMemo(
    () => (data?.pages.flatMap((p) => p.data) ?? []) as Playlist[],
    [data]
  );

  const virtualizer = useVirtualizer({
    count: playlists.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    onChange: (instance) => {
      const lastItem = instance.getVirtualItems().at(-1);
      if (
        lastItem &&
        lastItem.index >= playlists.length - 1 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
  });

  if (!query) {
    return null;
  }

  if (!isLoading && playlists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="h-10 w-10 mx-auto mb-2" />
        <p>No playlists found for "{query}"</p>
      </div>
    );
  }

  if (playlists.length === 0) {
    return null;
  }

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const playlist = playlists[virtualItem.index];
          if (!playlist) return null;

          return (
            <div
              key={playlist.id}
              className="absolute top-0 left-0 w-full"
              style={{
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Link
                to="/search/playlists/$playlistId"
                params={{ playlistId: playlist.id }}
                search={{ q: query }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
              >
                {playlist.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(playlist.attributes.artwork, 64)}
                    alt={playlist.attributes.name}
                    className="w-16 h-16 rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                    <ListMusic className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {playlist.attributes.name}
                  </p>
                  {playlist.attributes.curatorName && (
                    <p className="text-sm text-muted-foreground truncate">
                      by {playlist.attributes.curatorName}
                    </p>
                  )}
                </div>
              </Link>
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
