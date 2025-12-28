import { useCallback } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function usePlaySongs() {
  const { musicKit } = useMusicKit();

  return useCallback(
    async (songIds: string[], startIndex: number = 0) => {
      if (!musicKit || songIds.length === 0) return;
      if (musicKit.playbackState === MusicKit.PlaybackStates.playing) {
        await musicKit.stop();
      }
      await musicKit.setQueue({
        songs: songIds,
        startWith: startIndex,
        startPlaying: true,
      });
    },
    [musicKit]
  );
}
