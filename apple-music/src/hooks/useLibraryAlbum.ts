import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibraryAlbumResultsSchema } from "@/schemas";

export function useLibraryAlbum(albumId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "album", albumId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/me/library/albums/${albumId}`
      );
      const validated = LibraryAlbumResultsSchema.parse(res.data);
      return validated.data[0];
    },
    enabled: !!musicKit && isAuthorized && !!albumId,
  });
}
