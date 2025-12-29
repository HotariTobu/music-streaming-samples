import { useMemo } from "react";
import { useSearch, Link } from "@tanstack/react-router";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearch";
import { VirtualGrid } from "./VirtualGrid";
import { useSpotify } from "@/contexts/SpotifyContext";
import { getImageUrl } from "@/lib/utils";
import { AlertTriangle, Lock, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyPlaylistSimplified } from "@/schemas";

export function CatalogSearchPlaylists() {
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
  } = useCatalogSearchInfinite(q ?? "", "playlist");

  const playlists: SpotifyPlaylistSimplified[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.playlists?.items ?? []);
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

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No playlists found for "{q}"</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={playlists}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      columns={4}
      rowHeight={280}
      className="h-[600px]"
      renderItem={(playlist) => {
        const imageUrl = getImageUrl(playlist.images, 200);
        return (
          <Link
            to="/search/playlists/$playlistId"
            params={{ playlistId: playlist.id }}
            search={{ q }}
          >
            <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-md mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-md mb-3 flex items-center justify-center">
                    <ListMusic className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <p className="font-medium text-foreground truncate">
                  {playlist.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  by {playlist.owner.display_name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {playlist.tracks.total} tracks
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      }}
    />
  );
}
