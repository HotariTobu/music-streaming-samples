import { useCallback } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function usePlayPlaylist() {
  const { musicKit } = useMusicKit();

  return useCallback(
    async (playlistId: string, startIndex?: number) => {
      if (!musicKit) return;
      if (musicKit.playbackState === MusicKit.PlaybackStates.playing) {
        await musicKit.stop();
      }
      await musicKit.setQueue({
        playlist: playlistId,
        startWith: startIndex,
        startPlaying: true,
      });
    },
    [musicKit]
  );
}
