import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useCharts } from "@/hooks/useMusicKitQuery";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import { Music, Disc3, ListMusic, Play, BarChart3 } from "lucide-react";

type ChartType = "songs" | "albums" | "playlists";

export function Charts() {
  const { musicKit } = useMusicKit();
  const [type, setType] = useState<ChartType>("songs");

  const { data, isLoading, error, refetch } = useCharts();

  const songs = data?.songs ?? [];
  const albums = data?.albums ?? [];
  const playlists = data?.playlists ?? [];

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

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: "songs", label: "Top Songs", icon: <Music className="h-4 w-4" /> },
    { type: "albums", label: "Top Albums", icon: <Disc3 className="h-4 w-4" /> },
    { type: "playlists", label: "Top Playlists", icon: <ListMusic className="h-4 w-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load charts"}
          <Button variant="link" onClick={() => refetch()} className="ml-2 h-auto p-0">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2">
        {chartTypes.map(({ type: t, label, icon }) => (
          <Button
            key={t}
            variant={type === t ? "default" : "secondary"}
            onClick={() => setType(t)}
            className="rounded-full"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      {/* Top Songs */}
      {type === "songs" && (
        <div className="space-y-1">
          {songs.map((song, idx) => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
            >
              <span className={`
                w-8 text-center font-bold text-lg
                ${idx < 3 ? "text-primary" : "text-muted-foreground"}
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
                <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                  <Music className="h-5 w-5 text-muted-foreground" />
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
              <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}

      {/* Top Albums */}
      {type === "albums" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {albums.map((album, idx) => (
            <div
              key={album.id}
              onClick={() => playAlbum(album)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square mb-2">
                <span className={`
                  absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${idx < 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}
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
                  <div className="w-full h-full rounded-lg bg-secondary flex items-center justify-center">
                    <Disc3 className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="font-medium text-foreground text-sm truncate">{album.attributes.name}</p>
              <p className="text-xs text-muted-foreground truncate">{album.attributes.artistName}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top Playlists */}
      {type === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map((playlist, idx) => (
            <div
              key={playlist.id}
              onClick={() => playPlaylist(playlist)}
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
                    className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {songs.length === 0 && albums.length === 0 && playlists.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-10 w-10 mx-auto mb-2" />
          <p>No chart data available</p>
        </div>
      )}
    </div>
  );
}
