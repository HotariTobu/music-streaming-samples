import { useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useRecentlyPlayedInfinite } from "@/hooks/useRecentlyPlayedInfinite";
import { getArtworkUrl } from "@/lib/utils";
import type { Album, Playlist, Station } from "@/schemas";
import { Clock, Music, Radio } from "lucide-react";
import { VirtualGrid } from "./VirtualGrid";

function getItemLink(item: Album | Playlist | Station): { to: string; params: Record<string, string> } | null {
  switch (item.type) {
    case "albums":
      return { to: "/library/recent/albums/$albumId", params: { albumId: item.id } };
    case "playlists":
      return { to: "/library/recent/playlists/$playlistId", params: { playlistId: item.id } };
    case "stations":
      return null;
    default:
      return null;
  }
}

export function LibraryRecent() {
  const query = useRecentlyPlayedInfinite();

  const recentlyPlayed = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  const renderRecentItem = useCallback((item: Album | Playlist | Station) => {
    const link = getItemLink(item);

    const content = (
      <>
        <div className="relative aspect-square mb-2">
          {item.attributes.artwork ? (
            <img
              src={getArtworkUrl(item.attributes.artwork, 200)}
              alt={item.attributes.name}
              className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center">
              {item.type === "stations" ? (
                <Radio className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Music className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-0.5 rounded capitalize">
            {item.type.replace(/s$/, "")}
          </span>
        </div>
        <p className="font-medium text-foreground text-sm truncate">{item.attributes.name}</p>
      </>
    );

    if (link) {
      return (
        <Link
          key={item.id}
          to={link.to}
          params={link.params}
          className="group cursor-pointer block"
        >
          {content}
        </Link>
      );
    }

    return (
      <div key={item.id} className="group cursor-pointer">
        {content}
      </div>
    );
  }, []);

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
        {query.error instanceof Error ? query.error.message : "Failed to load recently played"}
      </div>
    );
  }

  if (recentlyPlayed.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-2" />
        <p>No recently played items</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={recentlyPlayed}
      hasNextPage={!!query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => query.fetchNextPage()}
      renderItem={renderRecentItem}
      columns={4}
      rowHeight={240}
      className="h-[600px]"
    />
  );
}
