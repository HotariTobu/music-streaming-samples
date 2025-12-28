import { useInfiniteQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { RecentlyPlayedResultsSchema, type Album, type Playlist, type Station } from "@/schemas";

export function useRecentlyPlayedInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "recent", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/recent/played",
        { limit: 10, offset: pageParam }
      );
      const validated = RecentlyPlayedResultsSchema.parse(res.data);
      return {
        data: validated.data as (Album | Playlist | Station)[],
        nextOffset: validated.next ? pageParam + 10 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}
