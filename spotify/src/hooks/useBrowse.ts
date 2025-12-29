import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSpotify } from "@/contexts/SpotifyContext";
import type {
  SpotifyFeaturedPlaylistsResponse,
  SpotifyNewReleasesResponse,
  SpotifyCategoriesResponse,
} from "@/schemas";

export function useFeaturedPlaylists(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["browse", "featured", limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      return fetchSpotify<SpotifyFeaturedPlaylistsResponse>(
        `/v1/browse/featured-playlists?${params}`
      );
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedPlaylistsInfinite(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["browse", "featured", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifyFeaturedPlaylistsResponse>(
        `/v1/browse/featured-playlists?${params}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.playlists.next) return undefined;
      return lastPage.playlists.offset + lastPage.playlists.limit;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewReleases(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["browse", "new-releases", limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      return fetchSpotify<SpotifyNewReleasesResponse>(
        `/v1/browse/new-releases?${params}`
      );
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewReleasesInfinite(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["browse", "new-releases", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifyNewReleasesResponse>(
        `/v1/browse/new-releases?${params}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.albums.next) return undefined;
      return lastPage.albums.offset + lastPage.albums.limit;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["browse", "categories", limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      return fetchSpotify<SpotifyCategoriesResponse>(
        `/v1/browse/categories?${params}`
      );
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoriesInfinite(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["browse", "categories", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifyCategoriesResponse>(
        `/v1/browse/categories?${params}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.categories.next) return undefined;
      return lastPage.categories.offset + lastPage.categories.limit;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
