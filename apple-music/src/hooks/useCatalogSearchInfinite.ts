import { useInfiniteQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { SearchResultsSchema, type Song, type Album, type Artist, type Playlist } from "@/schemas";

type SearchType = "songs" | "albums" | "artists" | "playlists";

const SEARCH_PAGE_SIZE = 25;

export function useCatalogSearchInfinite(query: string, type: SearchType) {
  const { musicKit } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["catalog", "search", "infinite", query, type],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/search",
        {
          term: query,
          types: type,
          limit: SEARCH_PAGE_SIZE,
          offset: pageParam,
        }
      );

      const validated = SearchResultsSchema.parse(response.data);
      const resultsData = validated.results;
      let data: (Song | Album | Artist | Playlist)[] = [];
      let hasNext = false;

      if (type === "songs" && resultsData.songs) {
        data = resultsData.songs.data || [];
        hasNext = !!resultsData.songs.next;
      } else if (type === "albums" && resultsData.albums) {
        data = resultsData.albums.data || [];
        hasNext = !!resultsData.albums.next;
      } else if (type === "artists" && resultsData.artists) {
        data = resultsData.artists.data || [];
        hasNext = !!resultsData.artists.next;
      } else if (type === "playlists" && resultsData.playlists) {
        data = resultsData.playlists.data || [];
        hasNext = !!resultsData.playlists.next;
      }

      return {
        data,
        nextOffset: hasNext ? pageParam + SEARCH_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && !!query.trim(),
  });
}
