import { useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useChartsInfinite } from "@/hooks/useChartsInfinite";
import { getArtworkUrl } from "@/lib/utils";
import type { Album } from "@/schemas";
import { Disc3 } from "lucide-react";
import { VirtualGrid } from "./VirtualGrid";

export function ChartAlbums() {
  const query = useChartsInfinite("albums");

  const albums = useMemo(
    () => (query.data?.pages.flatMap((p) => p.data) ?? []) as Album[],
    [query.data]
  );

  const renderAlbum = useCallback(
    (album: Album, idx: number) => (
      <Link
        key={album.id}
        to="/charts/albums/$albumId"
        params={{ albumId: album.id }}
        className="group cursor-pointer block"
      >
        <div className="relative aspect-square mb-2">
          <span className={`
            absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${idx < 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}
          `}>
            {idx + 1}
          </span>
          {album.attributes.artwork ? (
            <img
              src={getArtworkUrl(album.attributes.artwork, 200)}
              alt={album.attributes.name}
              className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center">
              <Disc3 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="font-medium text-foreground text-sm truncate">{album.attributes.name}</p>
        <p className="text-xs text-muted-foreground truncate">{album.attributes.artistName}</p>
      </Link>
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
        {query.error instanceof Error ? query.error.message : "Failed to load albums chart"}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Disc3 className="h-10 w-10 mx-auto mb-2" />
        <p>No albums available</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={albums}
      hasNextPage={!!query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => query.fetchNextPage()}
      renderItem={renderAlbum}
      columns={4}
      rowHeight={240}
      className="h-[600px]"
    />
  );
}
