import { useSearch } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSearchPlaylists } from "@/hooks/useSearchPlaylists";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ListMusic } from "lucide-react";

export function SearchPlaylists() {
  const { q } = useSearch({ strict: false }) as { q?: string };
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchPlaylists(q);

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
          No playlists found for "{q}"
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
            to="/search/playlists/$playlistId"
            params={{ playlistId: playlist.id }}
            search={{ q }}
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
                <p className="text-sm text-muted-foreground mt-1">{playlist.channelTitle}</p>
                {playlist.itemCount !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
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
