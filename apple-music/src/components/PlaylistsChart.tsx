import { useMemo, useCallback } from "react";
import { usePlayPlaylist } from "@/hooks/usePlayPlaylist";
import { useChartsInfinite } from "@/hooks/useChartsInfinite";
import { getArtworkUrl } from "@/lib/utils";
import type { Playlist } from "@/schemas";
import { ListMusic, Play } from "lucide-react";
import { VirtualGrid } from "./VirtualGrid";

export function PlaylistsChart() {
  const playPlaylist = usePlayPlaylist();
  const query = useChartsInfinite("playlists");

  const playlists = useMemo(
    () => (query.data?.pages.flatMap((p) => p.data) ?? []) as Playlist[],
    [query.data]
  );

  const handlePlayPlaylist = (playlist: Playlist) => {
    playPlaylist(playlist.id);
  };

  const renderPlaylist = useCallback(
    (playlist: Playlist, idx: number) => (
      <div
        key={playlist.id}
        onClick={() => handlePlayPlaylist(playlist)}
        className="group cursor-pointer"
      >
        <div className="relative aspect-square mb-2">
          <span className={`
            absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${idx < 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}
          `}>
            {idx + 1}
          </span>
          {playlist.attributes.artwork ? (
            <img
              src={getArtworkUrl(playlist.attributes.artwork, 200)}
              alt={playlist.attributes.name}
              className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center">
              <ListMusic className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-medium text-foreground text-sm truncate">{playlist.attributes.name}</p>
        {playlist.attributes.curatorName && (
          <p className="text-xs text-muted-foreground truncate">{playlist.attributes.curatorName}</p>
        )}
      </div>
    ),
    [handlePlayPlaylist]
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
        {query.error instanceof Error ? query.error.message : "Failed to load playlists chart"}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ListMusic className="h-10 w-10 mx-auto mb-2" />
        <p>No playlists available</p>
      </div>
    );
  }

  return (
    <VirtualGrid
      items={playlists}
      hasNextPage={!!query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => query.fetchNextPage()}
      renderItem={renderPlaylist}
      columns={4}
      rowHeight={240}
      className="h-[600px]"
    />
  );
}
