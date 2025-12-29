import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useLibraryAlbumsInfinite } from "@/hooks/useLibrary";
import { VirtualGrid } from "./VirtualGrid";
import { getImageUrl, getArtistNames, formatReleaseDate } from "@/lib/utils";
import { AlertTriangle, Disc3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifySavedAlbum } from "@/schemas";

export function LibraryAlbums() {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useLibraryAlbumsInfinite();

  const albums: SpotifySavedAlbum[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error instanceof Error ? error.message : "Failed to load"}</p>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Disc3 className="h-10 w-10 mx-auto mb-2" />
        <p>No saved albums</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={albums}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      columns={4}
      rowHeight={280}
      className="h-[600px]"
      renderItem={(item) => {
        const album = item.album;
        const imageUrl = getImageUrl(album.images, 200);
        return (
          <Link
            to="/library/albums/$albumId"
            params={{ albumId: album.id }}
          >
            <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-md mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-md mb-3 flex items-center justify-center">
                    <Disc3 className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <p className="font-medium text-foreground truncate">
                  {album.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {getArtistNames(album.artists)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatReleaseDate(album.release_date, album.release_date_precision)}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      }}
    />
  );
}
