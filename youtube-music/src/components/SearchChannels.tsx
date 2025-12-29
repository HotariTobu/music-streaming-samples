import { useSearch } from "@tanstack/react-router";
import { useSearchChannels } from "@/hooks/useSearchChannels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

export function SearchChannels() {
  const { q } = useSearch({ strict: false }) as { q?: string };
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchChannels(q);

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
          No channels found for "{q}"
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((channel) => (
          <Card key={channel.id} className="overflow-hidden">
            <div className="p-4 text-center">
              {/* Thumbnail */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                {channel.thumbnail && (
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <h3 className="font-medium text-foreground line-clamp-1">{channel.title}</h3>
              {channel.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {channel.description}
                </p>
              )}

              {/* Actions */}
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <a
                    href={`https://www.youtube.com/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Channel
                  </a>
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
