import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useAlbum } from "@/hooks/useAlbum";
import { usePlayAlbum } from "@/hooks/usePlayback";
import { TrackList, type Track } from "./TrackList";
import { Button } from "@/components/ui/button";
import { getImageUrl, getArtistNames, formatReleaseDate } from "@/lib/utils";
import { ArrowLeft, Play, Disc3, AlertTriangle } from "lucide-react";

interface AlbumDetailPageProps {
  albumId: string;
  backTo: string;
  backToParams?: Record<string, string>;
}

export function AlbumDetailPage({
  albumId,
  backTo,
  backToParams,
}: AlbumDetailPageProps) {
  const { data: album, isLoading, isError, error } = useAlbum(albumId);
  const playAlbum = usePlayAlbum();

  const tracks: Track[] = useMemo(() => {
    if (!album?.tracks?.items) return [];
    return album.tracks.items.map((track) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artistName: getArtistNames(track.artists),
      durationMs: track.duration_ms,
      explicit: track.explicit,
    }));
  }, [album]);

  const handlePlay = async (index: number = 0) => {
    if (album) {
      await playAlbum(album.uri, index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error instanceof Error ? error.message : "Failed to load album"}</p>
      </div>
    );
  }

  if (!album) return null;

  const imageUrl = getImageUrl(album.images, 300);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link to={backTo} params={backToParams}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      {/* Album header */}
      <div className="flex gap-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={album.name}
            className="w-48 h-48 rounded-lg shadow-lg object-cover"
          />
        ) : (
          <div className="w-48 h-48 rounded-lg bg-secondary flex items-center justify-center">
            <Disc3 className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            {album.album_type}
          </p>
          <h1 className="text-3xl font-bold text-foreground">{album.name}</h1>
          <p className="text-muted-foreground mt-2">
            {getArtistNames(album.artists)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatReleaseDate(album.release_date, album.release_date_precision)} •{" "}
            {album.total_tracks} tracks
          </p>
          <div className="mt-4">
            <Button
              onClick={() => handlePlay()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
        </div>
      </div>

      {/* Track list */}
      <TrackList
        tracks={tracks}
        onPlay={handlePlay}
        showArtwork={false}
        className="h-auto max-h-[600px]"
      />
    </div>
  );
}
