import { useMemo } from "react";
import { useCategoriesInfinite } from "@/hooks/useBrowse";
import { VirtualGrid } from "./VirtualGrid";
import { useSpotify } from "@/contexts/SpotifyContext";
import { AlertTriangle, Lock, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyCategory } from "@/schemas";

export function BrowseCategories() {
  const { isAuthenticated, login } = useSpotify();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCategoriesInfinite();

  const categories: SpotifyCategory[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.categories?.items ?? []);
  }, [data]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Log in to browse</p>
        <Button
          onClick={login}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          Log in with Spotify
        </Button>
      </div>
    );
  }

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

  return (
    <VirtualGrid
      items={categories}
      hasNextPage={hasNextPage ?? false}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      columns={4}
      rowHeight={180}
      className="h-[600px]"
      renderItem={(category) => {
        const imageUrl = category.icons[0]?.url;
        return (
          <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="w-full aspect-square object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full aspect-square bg-secondary rounded-md mb-3 flex items-center justify-center">
                  <Grid3X3 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <p className="font-medium text-foreground truncate text-center">
                {category.name}
              </p>
            </CardContent>
          </Card>
        );
      }}
    />
  );
}
