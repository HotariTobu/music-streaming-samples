import { useMemo, useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearchInfinite";
import { getArtworkUrl } from "@/lib/utils";
import type { Artist } from "@/schemas";
import { Mic2, Search } from "lucide-react";

export function CatalogSearchArtists() {
  const parentRef = useRef<HTMLDivElement>(null);
  const { q } = useSearch({ strict: false }) as { q?: string };
  const query = q ?? "";

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useCatalogSearchInfinite(query, "artists");

  const artists = useMemo(
    () => (data?.pages.flatMap((p) => p.data) ?? []) as Artist[],
    [data]
  );

  const virtualizer = useVirtualizer({
    count: artists.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    onChange: (instance) => {
      const lastItem = instance.getVirtualItems().at(-1);
      if (
        lastItem &&
        lastItem.index >= artists.length - 1 &&
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

  if (!isLoading && artists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="h-10 w-10 mx-auto mb-2" />
        <p>No artists found for "{query}"</p>
      </div>
    );
  }

  if (artists.length === 0) {
    return null;
  }

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const artist = artists[virtualItem.index];
          if (!artist) return null;

          return (
            <div
              key={artist.id}
              className="absolute top-0 left-0 w-full"
              style={{
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                {artist.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(artist.attributes.artwork, 64)}
                    alt={artist.attributes.name}
                    className="w-16 h-16 rounded-full shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Mic2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {artist.attributes.name}
                  </p>
                  {artist.attributes.genreNames &&
                    artist.attributes.genreNames.length > 0 && (
                      <p className="text-sm text-muted-foreground truncate">
                        {artist.attributes.genreNames.join(", ")}
                      </p>
                    )}
                </div>
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
