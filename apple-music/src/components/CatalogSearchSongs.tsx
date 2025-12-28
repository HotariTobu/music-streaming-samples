import { useState, useMemo, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearchInfinite";
import type { Song as CatalogSong } from "@/schemas";
import { Plus, Search } from "lucide-react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { CreatePlaylistForm } from "./CreatePlaylistForm";
import { SongList, type Song } from "./SongList";

export function CatalogSearchSongs() {
  const { isAuthorized } = useMusicKit();
  const playSongs = usePlaySongs();
  const { q } = useSearch({ strict: false }) as { q?: string };
  const query = q ?? "";

  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState<string | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useCatalogSearchInfinite(query, "songs");

  const results = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  ) as CatalogSong[];

  const songs: (Song & { albumName?: string })[] = useMemo(
    () =>
      results.map((s) => ({
        id: s.id,
        name: s.attributes.name,
        artistName: s.attributes.artistName,
        durationInMillis: s.attributes.durationInMillis,
        artwork: s.attributes.artwork,
        albumName: s.attributes.albumName,
      })),
    [results]
  );

  const handlePlaySongs = useCallback(
    (idx: number) => {
      const songIds = songs.map((s) => s.id);
      playSongs(songIds, idx);
    },
    [songs, playSongs]
  );

  const renderSongExtra = useCallback(
    (song: Song & { albumName?: string }) => (
      <>
        {song.albumName && (
          <div className="text-sm text-muted-foreground hidden sm:block">
            {song.albumName}
          </div>
        )}
        {isAuthorized && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAddToPlaylistSongId(addToPlaylistSongId === song.id ? null : song.id);
              }}
              className="p-2 rounded-md hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
              title="Add to playlist"
            >
              <Plus className="h-4 w-4" />
            </button>
            {addToPlaylistSongId === song.id && (
              <div className="absolute right-0 top-10 z-50">
                <AddToPlaylistMenu
                  trackIds={[song.id]}
                  onClose={() => setAddToPlaylistSongId(null)}
                  onCreateNew={() => {
                    setAddToPlaylistSongId(null);
                    setShowCreatePlaylist(true);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </>
    ),
    [isAuthorized, addToPlaylistSongId]
  );

  if (!query) {
    return null;
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="h-10 w-10 mx-auto mb-2" />
        <p>No songs found for "{query}"</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      {showCreatePlaylist && (
        <CreatePlaylistForm
          onClose={() => setShowCreatePlaylist(false)}
          onSuccess={() => {
            setShowCreatePlaylist(false);
            setAddToPlaylistSongId(null);
          }}
        />
      )}
      <SongList
        songs={songs}
        onPlay={handlePlaySongs}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        renderExtra={renderSongExtra}
      />
    </>
  );
}
