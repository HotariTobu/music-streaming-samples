import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SongList, type Song } from "@/components/SongList";
import { getArtworkUrl } from "@/lib/utils";
import type { MediaDetailData, TrackData } from "@/lib/media-transforms";
import { ArrowLeft, Music, Disc, ListMusic } from "lucide-react";

interface MediaDetailViewProps {
  media: MediaDetailData;
  tracks: TrackData[];
  mediaType: "album" | "playlist";
  backTo: string;
  onPlayTrack: (index: number) => void;
  isLoadingTracks: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  actions: ReactNode;
  showTrackArtwork?: boolean;
}

export function MediaDetailView({
  media,
  tracks,
  mediaType,
  backTo,
  onPlayTrack,
  isLoadingTracks,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  actions,
  showTrackArtwork = false,
}: MediaDetailViewProps) {
  const FallbackIcon = mediaType === "album" ? Disc : ListMusic;
  const title = mediaType === "album" ? "Album" : "Playlist";

  const trackCount = media.trackCount ?? tracks.length;
  const stats = buildStats(trackCount, media.releaseYear, media.genre);

  // Transform tracks to Song type for SongList
  const songs: Song[] = tracks.map((track) => ({
    id: track.id,
    name: track.name,
    artistName: track.artistName,
    durationInMillis: track.durationInMillis,
    artwork: track.artwork,
  }));

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {/* Media info */}
      <div className="flex gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          {media.artwork ? (
            <img
              src={getArtworkUrl(media.artwork, 200)}
              alt={media.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <FallbackIcon className="h-16 w-16 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-3 flex-1 min-w-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{media.name}</h1>
            {media.subtitle && (
              <p className="text-lg text-muted-foreground">{media.subtitle}</p>
            )}
            {media.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {media.description}
              </p>
            )}
            {stats && (
              <p className="text-sm text-muted-foreground mt-2">{stats}</p>
            )}
          </div>
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>

      {/* Track list */}
      {isLoadingTracks ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-2" />
          <p>No tracks available</p>
        </div>
      ) : (
        <SongList
          songs={songs}
          onPlay={onPlayTrack}
          showArtwork={showTrackArtwork}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          className="h-[500px]"
        />
      )}
    </div>
  );
}

function buildStats(
  trackCount: number,
  releaseYear?: number,
  genre?: string
): string {
  const parts: string[] = [];
  parts.push(`${trackCount} ${trackCount === 1 ? "song" : "songs"}`);
  if (releaseYear) parts.push(String(releaseYear));
  if (genre) parts.push(genre);
  return parts.join(" \u2022 ");
}
