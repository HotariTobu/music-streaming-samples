import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useArtist, useArtistTopTracks, useArtistAlbums } from "@/hooks/useArtist";
import { usePlayTracks, usePlayAlbum } from "@/hooks/usePlayback";
import { TrackList, type Track } from "./TrackList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl, getArtistNames, formatReleaseDate } from "@/lib/utils";
import { ArrowLeft, Play, Mic2, Disc3, AlertTriangle } from "lucide-react";

interface ArtistDetailPageProps {
  artistId: string;
  backTo: string;
  backToParams?: Record<string, string>;
}

export function ArtistDetailPage({
  artistId,
  backTo,
  backToParams,
}: ArtistDetailPageProps) {
  const { data: artist, isLoading, isError, error } = useArtist(artistId);
  const { data: topTracks } = useArtistTopTracks(artistId);
  const { data: albums } = useArtistAlbums(artistId);
  const playTracks = usePlayTracks();
  const playAlbum = usePlayAlbum();

  const tracks: Track[] = useMemo(() => {
    if (!topTracks) return [];
    return topTracks.map((track) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artistName: getArtistNames(track.artists),
      albumName: track.album.name,
      durationMs: track.duration_ms,
      images: track.album.images,
      explicit: track.explicit,
    }));
  }, [topTracks]);

  const handlePlayTopTracks = async (index: number = 0) => {
    if (topTracks) {
      const uris = topTracks.map((t) => t.uri);
      await playTracks(uris, index);
    }
  };

  const handlePlayAlbum = async (albumUri: string) => {
    await playAlbum(albumUri);
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
        <p>{error instanceof Error ? error.message : "Failed to load artist"}</p>
      </div>
    );
  }

  if (!artist) return null;

  const imageUrl = getImageUrl(artist.images, 300);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link to={backTo} params={backToParams}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      {/* Artist header */}
      <div className="flex gap-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artist.name}
            className="w-48 h-48 rounded-full shadow-lg object-cover"
          />
        ) : (
          <div className="w-48 h-48 rounded-full bg-secondary flex items-center justify-center">
            <Mic2 className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col justify-end">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Artist
          </p>
          <h1 className="text-3xl font-bold text-foreground">{artist.name}</h1>
          {artist.genres && artist.genres.length > 0 && (
            <p className="text-muted-foreground mt-2">
              {artist.genres.slice(0, 3).join(", ")}
            </p>
          )}
          {artist.followers && (
            <p className="text-sm text-muted-foreground">
              {artist.followers.total.toLocaleString()} followers
            </p>
          )}
          <div className="mt-4">
            <Button
              onClick={() => handlePlayTopTracks()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Play Top Tracks
            </Button>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      {tracks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Popular</h2>
          <TrackList
            tracks={tracks.slice(0, 5)}
            onPlay={handlePlayTopTracks}
            showAlbum
            className="h-auto"
          />
        </div>
      )}

      {/* Albums */}
      {albums && albums.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Discography</h2>
          <div className="grid grid-cols-4 gap-4">
            {albums.slice(0, 8).map((album) => {
              const albumImageUrl = getImageUrl(album.images, 200);
              return (
                <Card
                  key={album.id}
                  className="hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => handlePlayAlbum(album.uri)}
                >
                  <CardContent className="p-4">
                    {albumImageUrl ? (
                      <img
                        src={albumImageUrl}
                        alt={album.name}
                        className="w-full aspect-square object-cover rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-secondary rounded-md mb-3 flex items-center justify-center">
                        <Disc3 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <p className="font-medium text-foreground truncate">
                      {album.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatReleaseDate(album.release_date, album.release_date_precision)} • {album.album_type}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
