import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useFollowedArtists } from "@/hooks/useLibrary";
import { getImageUrl } from "@/lib/utils";
import { AlertTriangle, Mic2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyArtist } from "@/schemas";

export function LibraryArtists() {
  const { data, isLoading, isError, error } = useFollowedArtists(50);

  const artists: SpotifyArtist[] = useMemo(() => {
    if (!data?.artists?.items) return [];
    return data.artists.items;
  }, [data]);

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
        <p>{error instanceof Error ? error.message : "Failed to load"}</p>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mic2 className="h-10 w-10 mx-auto mb-2" />
        <p>No followed artists</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {artists.map((artist) => {
        const imageUrl = getImageUrl(artist.images, 200);
        return (
          <Link
            key={artist.id}
            to="/library/artists/$artistId"
            params={{ artistId: artist.id }}
          >
            <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={artist.name}
                    className="w-full aspect-square object-cover rounded-full mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-full mb-3 flex items-center justify-center">
                    <Mic2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <p className="font-medium text-foreground truncate text-center">
                  {artist.name}
                </p>
                <p className="text-sm text-muted-foreground truncate text-center">
                  {artist.genres?.slice(0, 2).join(", ") || "Artist"}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
