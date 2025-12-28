import { useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useLibraryAlbumsInfinite } from "@/hooks/useMusicKitQuery";
import { getArtworkUrl } from "@/lib/utils";
import type { LibraryAlbum } from "@/schemas";
import { Disc3 } from "lucide-react";
import { VirtualGrid } from "./VirtualList";

// rowHeight=240, gap=16 → cell height = 224px
// text area ≈ 40px → image size = 184px
const IMAGE_SIZE = 184;

export function LibraryAlbums() {
  const query = useLibraryAlbumsInfinite();

  const albums = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  const renderAlbum = useCallback(
    (album: LibraryAlbum) => (
      <Link
        key={album.id}
        to="/library/albums/$albumId"
        params={{ albumId: album.id }}
        className="group cursor-pointer block"
      >
        <div className="relative w-full pb-[100%] mb-2">
          {album.attributes.artwork ? (
            <img
              src={getArtworkUrl(album.attributes.artwork, 200)}
              alt={album.attributes.name}
              className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full rounded-lg bg-secondary flex items-center justify-center">
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
        {query.error instanceof Error ? query.error.message : "Failed to load albums"}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Disc3 className="h-10 w-10 mx-auto mb-2" />
        <p>No albums in your library</p>
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
      rowHeight={280}
      className="h-[600px]"
    />
  );
}
