import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { formatDuration, getArtworkUrl } from "@/lib/utils";

type LibraryTab = "songs" | "albums" | "playlists" | "artists" | "recent";

interface LibraryState {
  tab: LibraryTab;
  songs: MusicKit.LibrarySong[];
  albums: MusicKit.LibraryAlbum[];
  playlists: MusicKit.LibraryPlaylist[];
  artists: MusicKit.LibraryArtist[];
  recentlyPlayed: (MusicKit.Album | MusicKit.Playlist | MusicKit.Station)[];
  loading: boolean;
  error: string | null;
}

export function UserLibrary() {
  const { musicKit, isAuthorized, authorize } = useMusicKit();
  const [state, setState] = useState<LibraryState>({
    tab: "songs",
    songs: [],
    albums: [],
    playlists: [],
    artists: [],
    recentlyPlayed: [],
    loading: false,
    error: null,
  });

  const fetchLibrary = useCallback(async (tab: LibraryTab) => {
    if (!musicKit || !isAuthorized) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let data: unknown[] = [];

      switch (tab) {
        case "songs": {
          const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibrarySong>>(
            "/v1/me/library/songs",
            { limit: 50 }
          );
          data = res.data.data;
          setState((prev) => ({ ...prev, songs: data as MusicKit.LibrarySong[], loading: false }));
          break;
        }
        case "albums": {
          const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryAlbum>>(
            "/v1/me/library/albums",
            { limit: 50 }
          );
          data = res.data.data;
          setState((prev) => ({ ...prev, albums: data as MusicKit.LibraryAlbum[], loading: false }));
          break;
        }
        case "playlists": {
          const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryPlaylist>>(
            "/v1/me/library/playlists",
            { limit: 50 }
          );
          data = res.data.data;
          setState((prev) => ({ ...prev, playlists: data as MusicKit.LibraryPlaylist[], loading: false }));
          break;
        }
        case "artists": {
          const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryArtist>>(
            "/v1/me/library/artists",
            { limit: 50 }
          );
          data = res.data.data;
          setState((prev) => ({ ...prev, artists: data as MusicKit.LibraryArtist[], loading: false }));
          break;
        }
        case "recent": {
          const res = await musicKit.api.music<MusicKit.RecentlyPlayedResults>(
            "/v1/me/recent/played",
            { limit: 20 }
          );
          data = res.data.data;
          setState((prev) => ({
            ...prev,
            recentlyPlayed: data as (MusicKit.Album | MusicKit.Playlist | MusicKit.Station)[],
            loading: false,
          }));
          break;
        }
      }
    } catch (err) {
      console.error("[UserLibrary] Fetch failed:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load library",
      }));
    }
  }, [musicKit, isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      fetchLibrary(state.tab);
    }
  }, [isAuthorized, state.tab, fetchLibrary]);

  const changeTab = (tab: LibraryTab) => {
    setState((prev) => ({ ...prev, tab }));
  };

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
          <h3 className="text-xl font-semibold text-white mb-2">
            Authorization Required
          </h3>
          <p className="text-zinc-400 mb-6 max-w-md">
            To access your Apple Music library, playlists, and recently played,
            you need to authorize this app with your Apple Music account.
          </p>
          <Button
            onClick={authorize}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
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
        {tabs.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => changeTab(tab)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${state.tab === tab
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }
            `}
          >
            <span className="mr-1">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {state.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {state.error}
          <button
            onClick={() => fetchLibrary(state.tab)}
            className="ml-4 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Library Songs */}
      {!state.loading && state.tab === "songs" && (
        <div className="space-y-1">
          {state.songs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <div className="text-4xl mb-2">🎵</div>
              <p>No songs in your library</p>
            </div>
          ) : (
            state.songs.map((song, idx) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer group transition-colors"
              >
                <span className="w-6 text-center text-zinc-500 text-sm group-hover:hidden">
                  {idx + 1}
                </span>
                <span className="w-6 text-center hidden group-hover:block text-white">
                  ▶
                </span>
                {song.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(song.attributes.artwork, 48)}
                    alt={song.attributes.name}
                    className="w-12 h-12 rounded shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-zinc-700 flex items-center justify-center">
                    ♫
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{song.attributes.name}</p>
                  <p className="text-sm text-zinc-400 truncate">
                    {song.attributes.artistName}
                  </p>
                </div>
                <div className="text-sm text-zinc-500 w-12 text-right">
                  {formatDuration(song.attributes.durationInMillis)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Library Albums */}
      {!state.loading && state.tab === "albums" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {state.albums.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              <div className="text-4xl mb-2">💿</div>
              <p>No albums in your library</p>
            </div>
          ) : (
            state.albums.map((album) => (
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
                    <div className="w-full h-full rounded-lg bg-zinc-700 flex items-center justify-center text-4xl">
                      💿
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl">▶</span>
                  </div>
                </div>
                <p className="font-medium text-white text-sm truncate">{album.attributes.name}</p>
                <p className="text-xs text-zinc-400 truncate">{album.attributes.artistName}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Library Playlists */}
      {!state.loading && state.tab === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {state.playlists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No playlists in your library</p>
            </div>
          ) : (
            state.playlists.map((playlist) => (
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
                    <span className="absolute top-2 right-2 text-xs bg-zinc-800/80 px-2 py-0.5 rounded">
                      ✏️
                    </span>
                  )}
                </div>
                <p className="font-medium text-white text-sm truncate">{playlist.attributes.name}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Library Artists */}
      {!state.loading && state.tab === "artists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {state.artists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              <div className="text-4xl mb-2">🎤</div>
              <p>No artists in your library</p>
            </div>
          ) : (
            state.artists.map((artist) => (
              <div key={artist.id} className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-3xl mb-2">
                  🎤
                </div>
                <p className="font-medium text-white text-sm truncate">{artist.attributes.name}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recently Played */}
      {!state.loading && state.tab === "recent" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {state.recentlyPlayed.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              <div className="text-4xl mb-2">🕐</div>
              <p>No recently played items</p>
            </div>
          ) : (
            state.recentlyPlayed.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative aspect-square mb-2">
                  {item.attributes.artwork ? (
                    <img
                      src={getArtworkUrl(item.attributes.artwork, 200)}
                      alt={item.attributes.name}
                      className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-zinc-700 flex items-center justify-center text-4xl">
                      🎵
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-3xl">▶</span>
                  </div>
                  <span className="absolute bottom-2 left-2 text-xs bg-zinc-800/80 px-2 py-0.5 rounded capitalize">
                    {item.type.replace("s", "")}
                  </span>
                </div>
                <p className="font-medium text-white text-sm truncate">{item.attributes.name}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
