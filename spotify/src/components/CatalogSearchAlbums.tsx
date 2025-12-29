import { useMemo } from "react";
import { useSearch, Link } from "@tanstack/react-router";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearch";
import { VirtualGrid } from "./VirtualGrid";
import { useSpotify } from "@/contexts/SpotifyContext";
import { getImageUrl, getArtistNames, formatReleaseDate } from "@/lib/utils";
import { AlertTriangle, Lock, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyAlbumSimplified } from "@/schemas";

export function CatalogSearchAlbums() {
  const { q } = useSearch({ strict: false }) as { q?: string };
  const { isAuthenticated, login } = useSpotify();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCatalogSearchInfinite(q ?? "", "album");

  const albums: SpotifyAlbumSimplified[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.albums?.items ?? []);
  }, [data]);

  if (!q) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Log in to search</p>
        <Button
          onClick={login}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          Log in with Spotify
        </Button>
      </div>
    );
  }

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
        <p>{error instanceof Error ? error.message : "Failed to search"}</p>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No albums found for "{q}"</p>
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
      renderItem={(album) => {
        const imageUrl = getImageUrl(album.images, 200);
        return (
          <Link
            to="/search/albums/$albumId"
            params={{ albumId: album.id }}
            search={{ q }}
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
