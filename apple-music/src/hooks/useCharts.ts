import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { ChartsResultsSchema } from "@/schemas";

export function useCharts() {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "charts"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/charts",
        {
          types: "songs,albums,playlists",
          limit: 20,
        }
      );

      const validated = ChartsResultsSchema.parse(response.data);
      const results = validated.results;
      return {
        songs: results.songs?.[0]?.data || [],
        albums: results.albums?.[0]?.data || [],
        playlists: results.playlists?.[0]?.data || [],
      };
    },
    enabled: !!musicKit,
  });
}
