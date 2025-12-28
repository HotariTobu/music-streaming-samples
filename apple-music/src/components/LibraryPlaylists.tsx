import { useState, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLibraryPlaylistsInfinite } from "@/hooks/useLibraryPlaylistsInfinite";
import { getArtworkUrl } from "@/lib/utils";
import type { LibraryPlaylist } from "@/schemas";
import { ListMusic, Plus } from "lucide-react";
import { CreatePlaylistForm } from "./CreatePlaylistForm";
import { VirtualGrid } from "./VirtualGrid";

export function LibraryPlaylists() {
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const query = useLibraryPlaylistsInfinite();

  const playlists = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data]
  );

  const renderPlaylist = useCallback(
    (playlist: LibraryPlaylist) => (
      <li key={playlist.id} className="group">
        <Link
          to="/library/playlists/$playlistId"
          params={{ playlistId: playlist.id }}
          className="block"
        >
          <figure className="relative aspect-square mb-2">
            {playlist.attributes.artwork ? (
              <img
                src={getArtworkUrl(playlist.attributes.artwork, 200)}
                alt=""
                className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
            ) : (
              <span className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <ListMusic className="h-10 w-10 text-white" />
              </span>
            )}
          </figure>
          <figcaption className="font-medium text-foreground text-sm truncate">
            {playlist.attributes.name ?? "Untitled Playlist"}
          </figcaption>
        </Link>
      </li>
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
        {query.error instanceof Error ? query.error.message : "Failed to load playlists"}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {showCreatePlaylist && (
        <CreatePlaylistForm
          onClose={() => setShowCreatePlaylist(false)}
          onSuccess={() => setShowCreatePlaylist(false)}
        />
      )}

      {!showCreatePlaylist && (
        <Button
          onClick={() => setShowCreatePlaylist(true)}
          variant="secondary"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Playlist
        </Button>
      )}

      {playlists.length === 0 && !showCreatePlaylist ? (
        <div className="text-center py-12 text-muted-foreground">
          <ListMusic className="h-10 w-10 mx-auto mb-2" />
          <p>No playlists in your library</p>
        </div>
      ) : (
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
      )}
    </section>
  );
}
