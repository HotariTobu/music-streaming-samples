import { Link } from "@tanstack/react-router";
import { usePlaylistDetail } from "@/hooks/usePlaylistDetail";
import { usePlaylistItems } from "@/hooks/usePlaylistItems";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useYouTube, type QueueItem } from "@/contexts/YouTubeContext";
import { ArrowLeft, Play, Loader2, ListMusic } from "lucide-react";

interface PlaylistDetailPageProps {
  playlistId: string;
  backTo: string;
}

export function PlaylistDetailPage({ playlistId, backTo }: PlaylistDetailPageProps) {
  const { data: playlist, isLoading: isLoadingPlaylist } = usePlaylistDetail(playlistId);
  const { data: items, isLoading: isLoadingItems, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePlaylistItems(playlistId);
  const { playVideo, playQueue } = useYouTube();

  const videos = items?.pages.flatMap((page) => page.items) ?? [];

  const playAll = () => {
    if (videos.length > 0) {
      const queueItems: QueueItem[] = videos.map((video) => ({
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        channelTitle: video.channelTitle,
      }));
      playQueue(queueItems, 0);
    }
  };

  const handlePlayVideo = (video: (typeof videos)[0], index: number) => {
    // Play from this position in the playlist
    const queueItems: QueueItem[] = videos.map((v) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      channelTitle: v.channelTitle,
    }));
    playQueue(queueItems, index);
  };

  if (isLoadingPlaylist) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to={backTo}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      {/* Playlist Header */}
      {playlist && (
        <Card>
          <div className="flex gap-6 p-6">
            {/* Thumbnail */}
            <div className="w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {playlist.thumbnail ? (
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{playlist.title}</h1>
              <p className="text-muted-foreground mt-1">{playlist.channelTitle}</p>
              {playlist.description && (
                <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
                  {playlist.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {playlist.itemCount} videos
              </p>

              <div className="mt-4">
                <Button
                  onClick={playAll}
                  disabled={videos.length === 0}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Play className="h-4 w-4 mr-2" fill="currentColor" />
                  Play All
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Video List */}
      <div className="space-y-2">
        {isLoadingItems ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {videos.map((video, index) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-3">
                  {/* Index */}
                  <span className="w-8 text-center text-muted-foreground text-sm">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative w-24 h-14 flex-shrink-0 bg-muted rounded overflow-hidden group">
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => handlePlayVideo(video, index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-6 w-6 text-white" fill="white" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                  </div>

                  {/* Play Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlayVideo(video, index)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
