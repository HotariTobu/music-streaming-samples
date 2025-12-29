import { useMemo } from "react";
import { useSearch, Link } from "@tanstack/react-router";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearch";
import { VirtualGrid } from "./VirtualGrid";
import { useSpotify } from "@/contexts/SpotifyContext";
import { getImageUrl } from "@/lib/utils";
import { AlertTriangle, Lock, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyArtist } from "@/schemas";

export function CatalogSearchArtists() {
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
  } = useCatalogSearchInfinite(q ?? "", "artist");

  const artists: SpotifyArtist[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.artists?.items ?? []);
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

  if (artists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No artists found for "{q}"</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={artists}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      columns={4}
      rowHeight={280}
      className="h-[600px]"
      renderItem={(artist) => {
        const imageUrl = getImageUrl(artist.images, 200);
        return (
          <Link
            to="/search/artists/$artistId"
            params={{ artistId: artist.id }}
            search={{ q }}
          >
            <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={artist.name}
                    className="w-full aspect-square object-cover rounded-full mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-full mb-3 flex items-center justify-center">
                    <Mic2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <p className="font-medium text-foreground truncate text-center">
                  {artist.name}
                </p>
                <p className="text-sm text-muted-foreground truncate text-center">
                  {artist.genres?.slice(0, 2).join(", ") || "Artist"}
                </p>
                {artist.followers && (
                  <p className="text-xs text-muted-foreground text-center">
                    {artist.followers.total.toLocaleString()} followers
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      }}
    />
  );
}
