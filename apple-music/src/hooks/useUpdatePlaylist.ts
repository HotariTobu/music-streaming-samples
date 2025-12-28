import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function useUpdatePlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      name,
      description,
    }: {
      playlistId: string;
      name?: string;
      description?: string;
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const body: { attributes: { name?: string; description?: string } } = {
        attributes: {},
      };

      if (name !== undefined) {
        body.attributes.name = name;
      }
      if (description !== undefined) {
        body.attributes.description = description;
      }

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}`, {}, {
        fetchOptions: {
          method: "PATCH",
          body: JSON.stringify(body),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}
