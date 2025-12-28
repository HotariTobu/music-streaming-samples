import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { LibraryPlaylistResultsSchema } from "@/schemas";

export function useCreatePlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      trackIds,
    }: {
      name: string;
      description?: string;
      trackIds?: string[];
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const body: {
        attributes: { name: string; description?: string };
        relationships?: { tracks: { data: { id: string; type: string }[] } };
      } = {
        attributes: { name },
      };

      if (description) {
        body.attributes.description = description;
      }

      if (trackIds && trackIds.length > 0) {
        body.relationships = {
          tracks: {
            data: trackIds.map((id) => ({ id, type: "songs" })),
          },
        };
      }

      const res = await musicKit.api.music("/v1/me/library/playlists", {}, {
        fetchOptions: {
          method: "POST",
          body: JSON.stringify(body),
        },
      });

      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return validated.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}
