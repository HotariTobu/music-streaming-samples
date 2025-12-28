import { useCallback } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";

export function usePlayAlbum() {
  const { musicKit } = useMusicKit();

  return useCallback(
    async (albumId: string, startIndex?: number) => {
      if (!musicKit) return;
      if (musicKit.playbackState === MusicKit.PlaybackStates.playing) {
        await musicKit.stop();
      }
      await musicKit.setQueue({
        album: albumId,
        startWith: startIndex,
        startPlaying: true,
      });
    },
    [musicKit]
  );
}
