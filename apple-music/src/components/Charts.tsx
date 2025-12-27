import { useState, useEffect, useCallback } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { formatDuration, getArtworkUrl } from "@/lib/utils";

type ChartType = "songs" | "albums" | "playlists";

interface ChartsState {
  type: ChartType;
  songs: MusicKit.Song[];
  albums: MusicKit.Album[];
  playlists: MusicKit.Playlist[];
  loading: boolean;
  error: string | null;
}

export function Charts() {
  const { musicKit } = useMusicKit();
  const [state, setState] = useState<ChartsState>({
    type: "songs",
    songs: [],
    albums: [],
    playlists: [],
    loading: false,
    error: null,
  });

  const fetchCharts = useCallback(async () => {
    if (!musicKit) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const storefront = musicKit.storefrontId || "us";
      const response = await musicKit.api.music<MusicKit.ChartsResults>(
        `/v1/catalog/${storefront}/charts`,
        {
          types: "songs,albums,playlists",
          limit: 20,
        }
      );

      const results = response.data.results;
      setState((prev) => ({
        ...prev,
        songs: results.songs?.[0]?.data || [],
        albums: results.albums?.[0]?.data || [],
        playlists: results.playlists?.[0]?.data || [],
        loading: false,
      }));
    } catch (err) {
      console.error("[Charts] Fetch failed:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load charts",
      }));
    }
  }, [musicKit]);

  useEffect(() => {
    if (musicKit) {
      fetchCharts();
    }
  }, [musicKit, fetchCharts]);

  const playSong = async (song: MusicKit.Song) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ song: song.id });
      await musicKit.play();
    } catch (err) {
      console.error("[Charts] Play failed:", err);
    }
  };

  const playAlbum = async (album: MusicKit.Album) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ album: album.id });
      await musicKit.play();
    } catch (err) {
      console.error("[Charts] Play album failed:", err);
    }
  };

  const playPlaylist = async (playlist: MusicKit.Playlist) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id });
      await musicKit.play();
    } catch (err) {
      console.error("[Charts] Play playlist failed:", err);
    }
  };

  const chartTypes: { type: ChartType; label: string; icon: string }[] = [
    { type: "songs", label: "Top Songs", icon: "🎵" },
    { type: "albums", label: "Top Albums", icon: "💿" },
    { type: "playlists", label: "Top Playlists", icon: "📋" },
  ];

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
        {state.error}
        <button
          onClick={fetchCharts}
          className="ml-4 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2">
        {chartTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setState((prev) => ({ ...prev, type }))}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${state.type === type
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

      {/* Top Songs */}
      {state.type === "songs" && (
        <div className="space-y-1">
          {state.songs.map((song, idx) => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer group transition-colors"
            >
              <span className={`
                w-8 text-center font-bold text-lg
                ${idx < 3 ? "text-pink-500" : "text-zinc-500"}
              `}>
                {idx + 1}
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
              <span className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                ▶
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Top Albums */}
      {state.type === "albums" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {state.albums.map((album, idx) => (
            <div
              key={album.id}
              onClick={() => playAlbum(album)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square mb-2">
                <span className={`
                  absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${idx < 3 ? "bg-pink-500 text-white" : "bg-zinc-800/80 text-zinc-300"}
                `}>
                  {idx + 1}
                </span>
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
          ))}
        </div>
      )}

      {/* Top Playlists */}
      {state.type === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {state.playlists.map((playlist, idx) => (
            <div
              key={playlist.id}
              onClick={() => playPlaylist(playlist)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square mb-2">
                <span className={`
                  absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${idx < 3 ? "bg-pink-500 text-white" : "bg-zinc-800/80 text-zinc-300"}
                `}>
                  {idx + 1}
                </span>
                {playlist.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(playlist.attributes.artwork, 200)}
                    alt={playlist.attributes.name}
                    className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-zinc-700 flex items-center justify-center text-4xl">
                    📋
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-3xl">▶</span>
                </div>
              </div>
              <p className="font-medium text-white text-sm truncate">{playlist.attributes.name}</p>
              {playlist.attributes.curatorName && (
                <p className="text-xs text-zinc-400 truncate">{playlist.attributes.curatorName}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {state.songs.length === 0 && state.albums.length === 0 && state.playlists.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No chart data available</p>
        </div>
      )}
    </div>
  );
}
