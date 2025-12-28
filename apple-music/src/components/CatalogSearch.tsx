import { useState, useEffect, useMemo, useCallback } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { usePlaySongs } from "@/hooks/usePlaySongs";
import { useCatalogSearchInfinite } from "@/hooks/useCatalogSearchInfinite";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { Song, Album, Artist, Playlist } from "@/schemas";
import { Music, Disc3, Mic2, ListMusic, Search, Play, Plus } from "lucide-react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { CreatePlaylistForm } from "./CreatePlaylistForm";
import { VirtualList } from "./VirtualList";

type SearchType = "songs" | "albums" | "artists" | "playlists";

const routeApi = getRouteApi("/");

export function CatalogSearch() {
  const { isAuthorized } = useMusicKit();
  const playSongs = usePlaySongs();
  const { tab, q } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const type = tab;
  const urlQuery = q ?? "";

  const [inputQuery, setInputQuery] = useState(urlQuery);
  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState<string | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  // Sync input with URL query on mount
  useEffect(() => {
    setInputQuery(urlQuery);
  }, [urlQuery]);

  const searchQuery = useCatalogSearchInfinite(urlQuery, type);

  // Flatten paginated data
  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [searchQuery.data]
  );

  const handleSearch = () => {
    if (inputQuery.trim()) {
      navigate({ search: { tab: type, q: inputQuery.trim() } });
    }
  };

  const handleTypeChange = (newType: SearchType) => {
    navigate({ search: { tab: newType, q: urlQuery || undefined } });
  };

  const handlePlaySongs = useCallback(
    (idx: number) => {
      const songIds = (results as Song[]).map((s) => s.id);
      playSongs(songIds, idx);
    },
    [results, playSongs]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const searchTypes: { type: SearchType; label: string; icon: React.ReactNode }[] = [
    { type: "songs", label: "Songs", icon: <Music className="h-4 w-4" /> },
    { type: "albums", label: "Albums", icon: <Disc3 className="h-4 w-4" /> },
    { type: "artists", label: "Artists", icon: <Mic2 className="h-4 w-4" /> },
    { type: "playlists", label: "Playlists", icon: <ListMusic className="h-4 w-4" /> },
  ];

  // Render functions for virtual lists
  const renderSong = useCallback(
    (song: Song, idx: number) => (
      <div
        key={song.id}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 group transition-colors relative"
      >
        <span
          className="w-6 text-center text-muted-foreground text-sm group-hover:hidden cursor-pointer"
          onClick={() => handlePlaySongs(idx)}
        >
          {idx + 1}
        </span>
        <span
          className="w-6 text-center hidden group-hover:flex justify-center text-foreground cursor-pointer"
          onClick={() => handlePlaySongs(idx)}
        >
          <Play className="h-4 w-4" />
        </span>
        <div className="cursor-pointer" onClick={() => handlePlaySongs(idx)}>
          {song.attributes.artwork ? (
            <img
              src={getArtworkUrl(song.attributes.artwork, 48)}
              alt={song.attributes.name}
              className="w-12 h-12 rounded-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePlaySongs(idx)}>
          <p className="font-medium text-foreground truncate">{song.attributes.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {song.attributes.artistName}
          </p>
        </div>
        <div className="text-sm text-muted-foreground hidden sm:block">
          {song.attributes.albumName}
        </div>
        <div className="text-sm text-muted-foreground w-12 text-right">
          {formatDuration(song.attributes.durationInMillis)}
        </div>
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
      </div>
    ),
    [handlePlaySongs, isAuthorized, addToPlaylistSongId]
  );

  const renderAlbum = useCallback(
    (album: Album) => (
      <Link
        key={album.id}
        to="/albums/$albumId"
        params={{ albumId: album.id }}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
      >
        {album.attributes.artwork ? (
          <img
            src={getArtworkUrl(album.attributes.artwork, 64)}
            alt={album.attributes.name}
            className="w-16 h-16 rounded-lg shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
            <Disc3 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{album.attributes.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {album.attributes.artistName}
          </p>
          <p className="text-xs text-muted-foreground">
            {album.attributes.trackCount} tracks
            {album.attributes.releaseDate && ` • ${album.attributes.releaseDate.slice(0, 4)}`}
          </p>
        </div>
      </Link>
    ),
    []
  );

  const renderArtist = useCallback(
    (artist: Artist) => (
      <div
        key={artist.id}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
      >
        {artist.attributes.artwork ? (
          <img
            src={getArtworkUrl(artist.attributes.artwork, 64)}
            alt={artist.attributes.name}
            className="w-16 h-16 rounded-full shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Mic2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{artist.attributes.name}</p>
          {artist.attributes.genreNames && artist.attributes.genreNames.length > 0 && (
            <p className="text-sm text-muted-foreground truncate">
              {artist.attributes.genreNames.join(", ")}
            </p>
          )}
        </div>
      </div>
    ),
    []
  );

  const renderPlaylist = useCallback(
    (playlist: Playlist) => (
      <Link
        key={playlist.id}
        to="/playlists/$playlistId"
        params={{ playlistId: playlist.id }}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
      >
        {playlist.attributes.artwork ? (
          <img
            src={getArtworkUrl(playlist.attributes.artwork, 64)}
            alt={playlist.attributes.name}
            className="w-16 h-16 rounded-lg shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
            <ListMusic className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{playlist.attributes.name}</p>
          {playlist.attributes.curatorName && (
            <p className="text-sm text-muted-foreground truncate">
              by {playlist.attributes.curatorName}
            </p>
          )}
        </div>
      </Link>
    ),
    []
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Apple Music catalog..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-12"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={searchQuery.isLoading || !inputQuery.trim()}
          className="h-12 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        >
          {searchQuery.isLoading ? "..." : "Search"}
        </Button>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2">
        {searchTypes.map(({ type: t, label, icon }) => (
          <Button
            key={t}
            variant={type === t ? "default" : "secondary"}
            onClick={() => handleTypeChange(t)}
            className="rounded-md"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      {/* Error */}
      {searchQuery.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {searchQuery.error instanceof Error ? searchQuery.error.message : "Search failed"}
          </AlertDescription>
        </Alert>
      )}

      {/* Create Playlist Form (shown when triggered from AddToPlaylistMenu) */}
      {showCreatePlaylist && (
        <CreatePlaylistForm
          onClose={() => setShowCreatePlaylist(false)}
          onSuccess={() => {
            setShowCreatePlaylist(false);
            setAddToPlaylistSongId(null);
          }}
        />
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1">
          {type === "songs" && (
            <VirtualList
              items={results as Song[]}
              hasNextPage={!!searchQuery.hasNextPage}
              isFetchingNextPage={searchQuery.isFetchingNextPage}
              fetchNextPage={() => searchQuery.fetchNextPage()}
              renderItem={renderSong}
              estimateSize={72}
              className="h-[600px]"
            />
          )}

          {type === "albums" && (
            <VirtualList
              items={results as Album[]}
              hasNextPage={!!searchQuery.hasNextPage}
              isFetchingNextPage={searchQuery.isFetchingNextPage}
              fetchNextPage={() => searchQuery.fetchNextPage()}
              renderItem={renderAlbum}
              estimateSize={88}
              className="h-[600px]"
            />
          )}

          {type === "artists" && (
            <VirtualList
              items={results as Artist[]}
              hasNextPage={!!searchQuery.hasNextPage}
              isFetchingNextPage={searchQuery.isFetchingNextPage}
              fetchNextPage={() => searchQuery.fetchNextPage()}
              renderItem={renderArtist}
              estimateSize={88}
              className="h-[600px]"
            />
          )}

          {type === "playlists" && (
            <VirtualList
              items={results as Playlist[]}
              hasNextPage={!!searchQuery.hasNextPage}
              isFetchingNextPage={searchQuery.isFetchingNextPage}
              fetchNextPage={() => searchQuery.fetchNextPage()}
              renderItem={renderPlaylist}
              estimateSize={88}
              className="h-[600px]"
            />
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchQuery.isLoading && results.length === 0 && urlQuery && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-2" />
          <p>No results found for "{urlQuery}"</p>
        </div>
      )}

      {/* Initial State */}
      {!inputQuery && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-2" />
          <p>Search for songs, albums, artists, or playlists</p>
        </div>
      )}
    </div>
  );
}
