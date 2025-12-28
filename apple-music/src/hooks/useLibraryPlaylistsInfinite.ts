import { useInfiniteQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibraryPlaylistResultsSchema } from "@/schemas";

const LIBRARY_PAGE_SIZE = 50;

export function useLibraryPlaylistsInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "playlists", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/playlists",
        { limit: LIBRARY_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + LIBRARY_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}
