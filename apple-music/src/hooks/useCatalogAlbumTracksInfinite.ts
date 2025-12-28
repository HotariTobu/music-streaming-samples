import { useInfiniteQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { CatalogSongResultsSchema } from "@/schemas";

const TRACKS_PAGE_SIZE = 100;

export function useCatalogAlbumTracksInfinite(albumId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["catalog", "album", albumId, "tracks", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}/tracks`,
        { limit: TRACKS_PAGE_SIZE, offset: pageParam }
      );
      const validated = CatalogSongResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + TRACKS_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && !!albumId,
  });
}
