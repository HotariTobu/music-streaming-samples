import { useQuery } from "@tanstack/react-query";
import { useSpotify } from "@/contexts/SpotifyContext";
import type { SpotifyArtist, SpotifyAlbumSimplified, SpotifyTrack } from "@/schemas";

export function useArtist(artistId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      return fetchSpotify<SpotifyArtist>(`/v1/artists/${artistId}`);
    },
    enabled: !!artistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArtistTopTracks(artistId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["artist", artistId, "top-tracks"],
    queryFn: async () => {
      const response = await fetchSpotify<{ tracks: SpotifyTrack[] }>(
        `/v1/artists/${artistId}/top-tracks`
      );
      return response.tracks;
    },
    enabled: !!artistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArtistAlbums(artistId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["artist", artistId, "albums"],
    queryFn: async () => {
      const response = await fetchSpotify<{
        items: SpotifyAlbumSimplified[];
        total: number;
      }>(`/v1/artists/${artistId}/albums?include_groups=album,single&limit=50`);
      return response.items;
    },
    enabled: !!artistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedArtists(artistId: string) {
  const { fetchSpotify, isAuthenticated } = useSpotify();

  return useQuery({
    queryKey: ["artist", artistId, "related"],
    queryFn: async () => {
      const response = await fetchSpotify<{ artists: SpotifyArtist[] }>(
        `/v1/artists/${artistId}/related-artists`
      );
      return response.artists;
    },
    enabled: !!artistId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
