import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useSpotify } from "@/contexts/SpotifyContext";
import type {
  SpotifySavedTracksResponse,
  SpotifySavedAlbumsResponse,
  SpotifyUserPlaylistsResponse,
  SpotifyFollowedArtistsResponse,
  SpotifyRecentlyPlayedResponse,
} from "@/schemas";

export function useLibraryTracks(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["library", "tracks", limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      return fetchSpotify<SpotifySavedTracksResponse>(`/v1/me/tracks?${params}`);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLibraryTracksInfinite(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["library", "tracks", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifySavedTracksResponse>(`/v1/me/tracks?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return lastPage.offset + lastPage.limit;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLibraryAlbums(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["library", "albums", limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      return fetchSpotify<SpotifySavedAlbumsResponse>(`/v1/me/albums?${params}`);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLibraryAlbumsInfinite(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["library", "albums", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifySavedAlbumsResponse>(`/v1/me/albums?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return lastPage.offset + lastPage.limit;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLibraryPlaylists(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["library", "playlists", limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      return fetchSpotify<SpotifyUserPlaylistsResponse>(`/v1/me/playlists?${params}`);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLibraryPlaylistsInfinite(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["library", "playlists", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<SpotifyUserPlaylistsResponse>(`/v1/me/playlists?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return lastPage.offset + lastPage.limit;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFollowedArtists(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["library", "artists", limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: "artist",
        limit: limit.toString(),
      });
      return fetchSpotify<SpotifyFollowedArtistsResponse>(`/v1/me/following?${params}`);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentlyPlayed(limit: number = 20) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["library", "recent", limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: limit.toString() });
      return fetchSpotify<SpotifyRecentlyPlayedResponse>(
        `/v1/me/player/recently-played?${params}`
      );
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute - recently played changes frequently
  });
}
