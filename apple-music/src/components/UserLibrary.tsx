import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMusicKit } from "@/contexts/MusicKitContext";
import {
  useLibrarySongs,
  useLibraryAlbums,
  useLibraryPlaylists,
  useLibraryArtists,
  useRecentlyPlayed,
} from "@/hooks/useMusicKitQuery";
import { formatDuration, getArtworkUrl } from "@/lib/utils";

type LibraryTab = "songs" | "albums" | "playlists" | "artists" | "recent";

export function UserLibrary() {
  const { musicKit, isAuthorized, authorize } = useMusicKit();
  const [tab, setTab] = useState<LibraryTab>("songs");

  // Fetch data only for the active tab
  const songsQuery = useLibrarySongs(tab === "songs");
  const albumsQuery = useLibraryAlbums(tab === "albums");
  const playlistsQuery = useLibraryPlaylists(tab === "playlists");
  const artistsQuery = useLibraryArtists(tab === "artists");
  const recentQuery = useRecentlyPlayed(tab === "recent");

  const isLoading =
    (tab === "songs" && songsQuery.isLoading) ||
    (tab === "albums" && albumsQuery.isLoading) ||
    (tab === "playlists" && playlistsQuery.isLoading) ||
    (tab === "artists" && artistsQuery.isLoading) ||
    (tab === "recent" && recentQuery.isLoading);

  const error =
    (tab === "songs" && songsQuery.error) ||
    (tab === "albums" && albumsQuery.error) ||
    (tab === "playlists" && playlistsQuery.error) ||
    (tab === "artists" && artistsQuery.error) ||
    (tab === "recent" && recentQuery.error);

  const refetch = () => {
    if (tab === "songs") songsQuery.refetch();
    if (tab === "albums") albumsQuery.refetch();
    if (tab === "playlists") playlistsQuery.refetch();
    if (tab === "artists") artistsQuery.refetch();
    if (tab === "recent") recentQuery.refetch();
  };

  const songs = songsQuery.data ?? [];
  const albums = albumsQuery.data ?? [];
  const playlists = playlistsQuery.data ?? [];
  const artists = artistsQuery.data ?? [];
  const recentlyPlayed = recentQuery.data ?? [];

  const playSong = async (song: MusicKit.LibrarySong) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ song: song.id });
      await musicKit.play();
    } catch (err) {
      console.error("[UserLibrary] Play failed:", err);
    }
  };

  const playAlbum = async (album: MusicKit.LibraryAlbum) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ album: album.id });
      await musicKit.play();
    } catch (err) {
      console.error("[UserLibrary] Play album failed:", err);
    }
  };

  const playPlaylist = async (playlist: MusicKit.LibraryPlaylist) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id });
      await musicKit.play();
    } catch (err) {
      console.error("[UserLibrary] Play playlist failed:", err);
    }
  };

  const tabs: { tab: LibraryTab; label: string; icon: string }[] = [
    { tab: "songs", label: "Songs", icon: "🎵" },
    { tab: "albums", label: "Albums", icon: "💿" },
    { tab: "playlists", label: "Playlists", icon: "📋" },
    { tab: "artists", label: "Artists", icon: "🎤" },
    { tab: "recent", label: "Recent", icon: "🕐" },
  ];

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="text-6xl">🔐</div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Authorization Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            To access your Apple Music library, playlists, and recently played,
            you need to authorize this app with your Apple Music account.
          </p>
          <Button
            onClick={authorize}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            Authorize with Apple Music
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ tab: t, label, icon }) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${tab === t
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }
            `}
          >
            <span className="mr-1">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error instanceof Error ? error.message : "Failed to load library"}
          <button
            onClick={refetch}
            className="ml-4 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Library Songs */}
      {!isLoading && tab === "songs" && (
        <div className="space-y-1">
          {songs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">🎵</div>
              <p>No songs in your library</p>
            </div>
          ) : (
            songs.map((song, idx) => (
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
                <div className="text-sm text-muted-foreground w-12 text-right">
                  {formatDuration(song.attributes.durationInMillis)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Library Albums */}
      {!isLoading && tab === "albums" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">💿</div>
              <p>No albums in your library</p>
            </div>
          ) : (
            albums.map((album) => (
              <div
                key={album.id}
                onClick={() => playAlbum(album)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square mb-2">
                  {album.attributes.artwork ? (
                    <img
                      src={getArtworkUrl(album.attributes.artwork, 200)}
                      alt={album.attributes.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center text-4xl">
                      💿
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl">▶</span>
                  </div>
                </div>
                <p className="font-medium text-foreground text-sm truncate">{album.attributes.name}</p>
                <p className="text-xs text-muted-foreground truncate">{album.attributes.artistName}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Library Playlists */}
      {!isLoading && tab === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">📋</div>
              <p>No playlists in your library</p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => playPlaylist(playlist)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square mb-2">
                  {playlist.attributes.artwork ? (
                    <img
                      src={getArtworkUrl(playlist.attributes.artwork, 200)}
                      alt={playlist.attributes.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl">
                      📋
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl">▶</span>
                  </div>
                  {playlist.attributes.canEdit && (
                    <span className="absolute top-2 right-2 text-xs bg-background/80 px-2 py-0.5 rounded">
                      ✏️
                    </span>
                  )}
                </div>
                <p className="font-medium text-foreground text-sm truncate">{playlist.attributes.name}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Library Artists */}
      {!isLoading && tab === "artists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">🎤</div>
              <p>No artists in your library</p>
            </div>
          ) : (
            artists.map((artist) => (
              <div key={artist.id} className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-secondary flex items-center justify-center text-3xl mb-2">
                  🎤
                </div>
                <p className="font-medium text-foreground text-sm truncate">{artist.attributes.name}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recently Played */}
      {!isLoading && tab === "recent" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {recentlyPlayed.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">🕐</div>
              <p>No recently played items</p>
            </div>
          ) : (
            recentlyPlayed.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative aspect-square mb-2">
                  {item.attributes.artwork ? (
                    <img
                      src={getArtworkUrl(item.attributes.artwork, 200)}
                      alt={item.attributes.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center text-4xl">
                      🎵
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl">▶</span>
                  </div>
                  <span className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-0.5 rounded capitalize">
                    {item.type.replace("s", "")}
                  </span>
                </div>
                <p className="font-medium text-foreground text-sm truncate">{item.attributes.name}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
