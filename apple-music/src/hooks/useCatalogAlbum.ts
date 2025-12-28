import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { CatalogAlbumResultsSchema } from "@/schemas";

export function useCatalogAlbum(albumId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "album", albumId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}`
      );
      const validated = CatalogAlbumResultsSchema.parse(res.data);
      return validated.data[0];
    },
    enabled: !!musicKit && !!albumId,
  });
}
