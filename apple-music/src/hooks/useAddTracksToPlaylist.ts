import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function useAddTracksToPlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      trackIds,
    }: {
      playlistId: string;
      trackIds: string[];
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const body = {
        data: trackIds.map((id) => ({ id, type: "songs" })),
      };

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}/tracks`, {}, {
        fetchOptions: {
          method: "POST",
          body: JSON.stringify(body),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}
