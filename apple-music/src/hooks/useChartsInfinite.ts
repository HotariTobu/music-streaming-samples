import { useInfiniteQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { ChartsResultsSchema, type Song, type Album, type Playlist } from "@/schemas";

export function useChartsInfinite(chartType: "songs" | "albums" | "playlists") {
  const { musicKit } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["catalog", "charts", "infinite", chartType],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/charts",
        {
          types: chartType,
          limit: 20,
          offset: pageParam,
        }
      );

      const validated = ChartsResultsSchema.parse(response.data);
      const results = validated.results;
      let data: (Song | Album | Playlist)[] = [];
      let hasNext = false;

      if (chartType === "songs" && results.songs?.[0]) {
        data = results.songs[0].data || [];
        hasNext = !!results.songs[0].next;
      } else if (chartType === "albums" && results.albums?.[0]) {
        data = results.albums[0].data || [];
        hasNext = !!results.albums[0].next;
      } else if (chartType === "playlists" && results.playlists?.[0]) {
        data = results.playlists[0].data || [];
        hasNext = !!results.playlists[0].next;
      }

      return {
        data,
        nextOffset: hasNext ? pageParam + 20 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit,
  });
}
