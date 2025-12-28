import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function useDeletePlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistId: string) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}`, {}, {
        fetchOptions: {
          method: "DELETE",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}
