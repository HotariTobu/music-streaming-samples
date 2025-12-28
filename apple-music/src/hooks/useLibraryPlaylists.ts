import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibraryPlaylistResultsSchema } from "@/schemas";

export function useLibraryPlaylists(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "playlists"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/playlists",
        { limit: 50 }
      );
      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return validated.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}
