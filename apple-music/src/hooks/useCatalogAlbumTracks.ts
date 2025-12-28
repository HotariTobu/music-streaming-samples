import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { CatalogSongResultsSchema } from "@/schemas";

export function useCatalogAlbumTracks(albumId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "album", albumId, "tracks"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}/tracks`,
        { limit: 100 }
      );
      const validated = CatalogSongResultsSchema.parse(res.data);
      return validated.data;
    },
    enabled: !!musicKit && !!albumId,
  });
}
