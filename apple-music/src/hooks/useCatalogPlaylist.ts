import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { CatalogPlaylistResultsSchema } from "@/schemas";

export function useCatalogPlaylist(playlistId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "playlist", playlistId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!playlistId) throw new Error("Playlist ID is required");

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/playlists/${playlistId}`
      );
      const validated = CatalogPlaylistResultsSchema.parse(res.data);
      return validated.data[0];
    },
    enabled: !!musicKit && !!playlistId,
  });
}
