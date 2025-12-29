import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSpotify } from "@/contexts/SpotifyContext";
import type { SpotifySearchResponse } from "@/schemas";

type SearchType = "track" | "album" | "artist" | "playlist";

export function useCatalogSearch(
  query: string,
  type: SearchType,
  limit: number = 20
) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["catalog", "search", query, type, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString(),
      });
      return fetchSpotify<SpotifySearchResponse>(`/v1/search?${params}`);
    },
    enabled: !!query.trim() && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useCatalogSearchInfinite(
  query: string,
  type: SearchType,
  limit: number = 20
) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["catalog", "search", "infinite", query, type, limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifySearchResponse>(`/v1/search?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // Get the appropriate paging object based on type
      const paging =
        lastPage.tracks ||
        lastPage.albums ||
        lastPage.artists ||
        lastPage.playlists;
      if (!paging || !paging.next) return undefined;
      return paging.offset + paging.limit;
    },
    enabled: !!query.trim() && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
