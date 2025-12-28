import { useQuery } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { SearchResultsSchema } from "@/schemas";

type SearchType = "songs" | "albums" | "artists" | "playlists";

export function useCatalogSearch(query: string, type: SearchType) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "search", query, type],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/search",
        {
          term: query,
          types: type,
          limit: 25,
        }
      );

      const validated = SearchResultsSchema.parse(response.data);
      const resultsData = validated.results;

      if (type === "songs" && resultsData.songs?.data) {
        return resultsData.songs.data;
      } else if (type === "albums" && resultsData.albums?.data) {
        return resultsData.albums.data;
      } else if (type === "artists" && resultsData.artists?.data) {
        return resultsData.artists.data;
      } else if (type === "playlists" && resultsData.playlists?.data) {
        return resultsData.playlists.data;
      }

      return [];
    },
    enabled: !!musicKit && !!query.trim(),
  });
}
