import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibrarySongResultsSchema } from "@/schemas";

export function useLibrarySongs(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "songs"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/songs",
        { limit: 50 }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return validated.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}
