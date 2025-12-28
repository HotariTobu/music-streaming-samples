import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibraryArtistResultsSchema } from "@/schemas";

export function useLibraryArtists(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "artists"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/artists",
        { limit: 50 }
      );
      const validated = LibraryArtistResultsSchema.parse(res.data);
      return validated.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}
