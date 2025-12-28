import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibraryPlaylistResultsSchema } from "@/schemas";

export function useLibraryPlaylist(playlistId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "playlist", playlistId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!playlistId) throw new Error("Playlist ID is required");

      const res = await musicKit.api.music(
        `/v1/me/library/playlists/${playlistId}`
      );
      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return validated.data[0];
    },
    enabled: !!musicKit && isAuthorized && !!playlistId,
  });
}
