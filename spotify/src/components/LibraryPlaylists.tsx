import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useLibraryPlaylistsInfinite } from "@/hooks/useLibrary";
import { VirtualGrid } from "./VirtualGrid";
import { getImageUrl } from "@/lib/utils";
import { AlertTriangle, ListMusic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyPlaylistSimplified } from "@/schemas";

export function LibraryPlaylists() {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useLibraryPlaylistsInfinite();

  const playlists: SpotifyPlaylistSimplified[] = useMemo(() => {
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

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ListMusic className="h-10 w-10 mx-auto mb-2" />
        <p>No playlists</p>
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
            to="/library/playlists/$playlistId"
            params={{ playlistId: playlist.id }}
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
