import { useState, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useCatalogSearch } from "@/hooks/useMusicKitQuery";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import { Music, Disc3, Mic2, ListMusic, Search, Play, Plus } from "lucide-react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { CreatePlaylistForm } from "./CreatePlaylistForm";

type SearchType = "songs" | "albums" | "artists" | "playlists";

const routeApi = getRouteApi("/");

export function CatalogSearch() {
  const { musicKit, isAuthorized } = useMusicKit();
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

  const { data: results = [], isLoading, error } = useCatalogSearch(urlQuery, type);

  const handleSearch = () => {
    if (inputQuery.trim()) {
      navigate({ search: { tab: type, q: inputQuery.trim() } });
    }
  };

  const handleTypeChange = (newType: SearchType) => {
    navigate({ search: { tab: newType, q: urlQuery || undefined } });
  };

  const playSong = async (song: MusicKit.Song) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ song: song.id });
      await musicKit.play();
    } catch (err) {
      console.error("[CatalogSearch] Play failed:", err);
    }
  };

  const playAlbum = async (album: MusicKit.Album) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ album: album.id });
      await musicKit.play();
    } catch (err) {
      console.error("[CatalogSearch] Play album failed:", err);
    }
  };

  const playPlaylist = async (playlist: MusicKit.Playlist) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id });
      await musicKit.play();
    } catch (err) {
      console.error("[CatalogSearch] Play playlist failed:", err);
    }
  };

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
          disabled={isLoading || !inputQuery.trim()}
          className="h-12 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        >
          {isLoading ? "..." : "Search"}
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
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Search failed"}
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
          {type === "songs" &&
            (results as MusicKit.Song[]).map((song, idx) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 group transition-colors relative"
              >
                <span
                  className="w-6 text-center text-muted-foreground text-sm group-hover:hidden cursor-pointer"
                  onClick={() => playSong(song)}
                >
                  {idx + 1}
                </span>
                <span
                  className="w-6 text-center hidden group-hover:flex justify-center text-foreground cursor-pointer"
                  onClick={() => playSong(song)}
                >
                  <Play className="h-4 w-4" />
                </span>
                <div className="cursor-pointer" onClick={() => playSong(song)}>
                  {song.attributes.artwork ? (
                    <img
                      src={getArtworkUrl(song.attributes.artwork, 48)}
                      alt={song.attributes.name}
                      className="w-12 h-12 rounded-md shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                      <Music className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(song)}>
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
            ))}

          {type === "albums" &&
            (results as MusicKit.Album[]).map((album) => (
              <div
                key={album.id}
                onClick={() => playAlbum(album)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
              >
                {album.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(album.attributes.artwork, 64)}
                    alt={album.attributes.name}
                    className="w-16 h-16 rounded-lg shadow-lg"
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
                <Play className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            ))}

          {type === "artists" &&
            (results as MusicKit.Artist[]).map((artist) => (
              <div
                key={artist.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {artist.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(artist.attributes.artwork, 64)}
                    alt={artist.attributes.name}
                    className="w-16 h-16 rounded-full shadow-lg"
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
            ))}

          {type === "playlists" &&
            (results as MusicKit.Playlist[]).map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => playPlaylist(playlist)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
              >
                {playlist.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(playlist.attributes.artwork, 64)}
                    alt={playlist.attributes.name}
                    className="w-16 h-16 rounded-lg shadow-lg"
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
                <Play className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && urlQuery && (
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
