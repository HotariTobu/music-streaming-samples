import { useQuery } from "@tanstack/react-query";
import { useSpotify } from "@/contexts/SpotifyContext";
import type { SpotifyAlbum, SpotifyTrackSimplified } from "@/schemas";

export function useAlbum(albumId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["album", albumId],
    queryFn: async () => {
      return fetchSpotify<SpotifyAlbum>(`/v1/albums/${albumId}`);
    },
    enabled: !!albumId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlbumTracks(albumId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["album", albumId, "tracks"],
    queryFn: async () => {
      const response = await fetchSpotify<{
        items: SpotifyTrackSimplified[];
        total: number;
      }>(`/v1/albums/${albumId}/tracks?limit=50`);
      return response.items;
    },
    enabled: !!albumId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
