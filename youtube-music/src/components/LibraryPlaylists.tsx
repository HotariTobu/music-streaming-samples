import { Link } from "@tanstack/react-router";
import { useMyPlaylists } from "@/hooks/useMyPlaylists";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ListMusic, Plus } from "lucide-react";

export function LibraryPlaylists() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMyPlaylists();

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
        <CardContent className="py-12 text-center">
          <ListMusic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first playlist on YouTube
          </p>
          <Button asChild>
            <a
              href="https://www.youtube.com/view_all_playlists"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((playlist) => (
          <Link
            key={playlist.id}
            to="/library/playlists/$playlistId"
            params={{ playlistId: playlist.id }}
          >
            <Card className="overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <div className="aspect-video relative bg-muted">
                {playlist.thumbnail ? (
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ListMusic className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-2">{playlist.title}</h3>
                {playlist.itemCount !== undefined && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {playlist.itemCount} videos
                  </p>
                )}
              </div>
            </Card>
          </Link>
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
