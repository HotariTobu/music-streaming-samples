import { useMemo, useCallback } from "react";
import { useLibraryArtistsInfinite } from "@/hooks/useMusicKitQuery";
import type { LibraryArtist } from "@/schemas";
import { Mic2 } from "lucide-react";
import { VirtualGrid } from "./VirtualList";

export function LibraryArtists() {
  const query = useLibraryArtistsInfinite();

  const artists = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  const renderArtist = useCallback(
    (artist: LibraryArtist) => (
      <div key={artist.id} className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-secondary flex items-center justify-center mb-2">
          <Mic2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground text-sm truncate">{artist.attributes.name}</p>
      </div>
    ),
    []
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
        {query.error instanceof Error ? query.error.message : "Failed to load artists"}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mic2 className="h-10 w-10 mx-auto mb-2" />
        <p>No artists in your library</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={artists}
      hasNextPage={!!query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => query.fetchNextPage()}
      renderItem={renderArtist}
      columns={4}
      rowHeight={160}
      className="h-[600px]"
    />
  );
}
