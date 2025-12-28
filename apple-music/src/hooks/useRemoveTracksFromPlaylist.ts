import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function useRemoveTracksFromPlaylist() {
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
          method: "DELETE",
          body: JSON.stringify(body),
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlist", variables.playlistId, "tracks"] });
    },
  });
}
