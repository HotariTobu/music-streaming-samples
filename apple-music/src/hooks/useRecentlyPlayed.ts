import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { RecentlyPlayedResultsSchema, type Album, type Playlist, type Station } from "@/schemas";

export function useRecentlyPlayed(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "recent"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/recent/played",
        { limit: 10 }
      );
      const validated = RecentlyPlayedResultsSchema.parse(res.data);
      return validated.data as (Album | Playlist | Station)[];
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}
