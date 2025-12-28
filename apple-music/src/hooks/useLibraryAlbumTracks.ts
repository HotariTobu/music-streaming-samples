import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibrarySongResultsSchema } from "@/schemas";

export function useLibraryAlbumTracks(albumId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "album", albumId, "tracks"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/me/library/albums/${albumId}/tracks`,
        { limit: 100 }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return validated.data;
    },
    enabled: !!musicKit && isAuthorized && !!albumId,
  });
}
