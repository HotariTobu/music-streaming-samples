import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSpotify } from "@/contexts/SpotifyContext";
import type { SpotifyPlaylist, SpotifyPlaylistTrack } from "@/schemas";

export function usePlaylist(playlistId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      return fetchSpotify<SpotifyPlaylist>(`/v1/playlists/${playlistId}`);
    },
    enabled: !!playlistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaylistTracks(playlistId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["playlist", playlistId, "tracks"],
    queryFn: async () => {
      const response = await fetchSpotify<{
        items: SpotifyPlaylistTrack[];
        total: number;
      }>(`/v1/playlists/${playlistId}/tracks?limit=50`);
      return response.items;
    },
    enabled: !!playlistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaylistTracksInfinite(playlistId: string, limit: number = 50) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useInfiniteQuery({
    queryKey: ["playlist", playlistId, "tracks", "infinite", limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: pageParam.toString(),
      });
      return fetchSpotify<{
        items: SpotifyPlaylistTrack[];
        total: number;
        next: string | null;
        offset: number;
        limit: number;
      }>(`/v1/playlists/${playlistId}/tracks?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      return lastPage.offset + lastPage.limit;
    },
    enabled: !!playlistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddTracksToPlaylist() {
  const { fetchSpotify } = useSpotify();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      uris,
    }: {
      playlistId: string;
      uris: string[];
    }) => {
      await fetchSpotify(`/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({ uris }),
      });
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
}

export function useRemoveTracksFromPlaylist() {
  const { fetchSpotify } = useSpotify();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      uris,
    }: {
      playlistId: string;
      uris: string[];
    }) => {
      await fetchSpotify(`/v1/playlists/${playlistId}/tracks`, {
        method: "DELETE",
        body: JSON.stringify({
          tracks: uris.map((uri) => ({ uri })),
        }),
      });
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
    },
  });
}

export function useCreatePlaylist() {
  const { fetchSpotify, user } = useSpotify();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      isPublic = false,
    }: {
      name: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      return fetchSpotify<SpotifyPlaylist>(`/v1/users/${user.id}/playlists`, {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          public: isPublic,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

export function useUpdatePlaylist() {
  const { fetchSpotify } = useSpotify();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      name,
      description,
      isPublic,
    }: {
      playlistId: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      await fetchSpotify(`/v1/playlists/${playlistId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          description,
          public: isPublic,
        }),
      });
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}
