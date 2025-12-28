import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibrarySongResultsSchema } from "@/schemas";

export function usePlaylistTracks(playlistId: string | null) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "playlist", playlistId, "tracks"],
    queryFn: async () => {
      if (!musicKit || !playlistId) throw new Error("MusicKit not initialized or no playlist ID");

      const res = await musicKit.api.music(
        `/v1/me/library/playlists/${playlistId}/tracks`,
        { limit: 100 }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return validated.data;
    },
    enabled: !!musicKit && isAuthorized && !!playlistId,
  });
}
