import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useCatalogSearch } from "@/hooks/useMusicKitQuery";
import { formatDuration, getArtworkUrl } from "@/lib/utils";

type SearchType = "songs" | "albums" | "artists" | "playlists";

export function CatalogSearch() {
  const { musicKit } = useMusicKit();
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState<SearchType>("songs");

  const { data: results = [], isLoading, error } = useCatalogSearch(searchQuery, type);

  const handleSearch = () => {
    if (inputQuery.trim()) {
      setSearchQuery(inputQuery.trim());
    }
  };

  const handleTypeChange = (newType: SearchType) => {
    setType(newType);
    if (searchQuery) {
      // Re-search with new type
      setSearchQuery(inputQuery.trim());
    }
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

  const searchTypes: { type: SearchType; label: string; icon: string }[] = [
    { type: "songs", label: "Songs", icon: "♫" },
    { type: "albums", label: "Albums", icon: "💿" },
    { type: "artists", label: "Artists", icon: "🎤" },
    { type: "playlists", label: "Playlists", icon: "📋" },
  ];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            🔍
          </span>
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
            className="rounded-full"
          >
            <span className="mr-1">{icon}</span>
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

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1">
          {type === "songs" &&
            (results as MusicKit.Song[]).map((song, idx) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
              >
                <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
                  {idx + 1}
                </span>
                <span className="w-6 text-center hidden group-hover:block text-foreground">
                  ▶
                </span>
                {song.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(song.attributes.artwork, 48)}
                    alt={song.attributes.name}
                    className="w-12 h-12 rounded shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                    ♫
                  </div>
                )}
                <div className="flex-1 min-w-0">
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
                    className="w-16 h-16 rounded shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center text-2xl">
                    💿
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
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">▶</span>
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
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl">
                    🎤
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
                    className="w-16 h-16 rounded shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center text-2xl">
                    📋
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
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">▶</span>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && searchQuery && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-2">🔍</div>
          <p>No results found for "{searchQuery}"</p>
        </div>
      )}

      {/* Initial State */}
      {!inputQuery && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-2">🎵</div>
          <p>Search for songs, albums, artists, or playlists</p>
        </div>
      )}
    </div>
  );
}
