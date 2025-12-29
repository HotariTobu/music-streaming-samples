import { useSearch } from "@tanstack/react-router";
import { useSearchVideos } from "@/hooks/useSearchVideos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useYouTube, type QueueItem } from "@/contexts/YouTubeContext";
import { Play, Loader2 } from "lucide-react";

export function SearchVideos() {
  const { q } = useSearch({ strict: false }) as { q?: string };
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchVideos(q);
  const { playQueue } = useYouTube();

  if (!q) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error: {error.message}
        </CardContent>
      </Card>
    );
  }

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No videos found for "{q}"
        </CardContent>
      </Card>
    );
  }

  const handlePlay = (index: number) => {
    // Add all videos to queue and start from clicked position
    const queueItems: QueueItem[] = items.map((video) => ({
      videoId: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
    }));
    playQueue(queueItems, index);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {items.map((video, index) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-40 h-24 bg-muted rounded-lg overflow-hidden group">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => handlePlay(index)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="h-10 w-10 text-white" fill="white" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{video.channelTitle}</p>
                {video.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePlay(index)}
                  className="text-primary hover:text-primary/80"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
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
    </div>
  );
}
