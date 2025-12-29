import { useCallback } from "react";
import { useSpotify } from "@/contexts/SpotifyContext";

/**
 * Hook to play tracks on the Spotify Web Playback SDK device.
 */
export function usePlayTracks() {
  const { fetchSpotify, deviceId, isPlayerReady } = useSpotify();

  return useCallback(
    async (uris: string[], startIndex: number = 0) => {
      if (!deviceId || !isPlayerReady) {
        console.warn("[Playback] No device available");
        return;
      }

      await fetchSpotify("/v1/me/player/play", {
        method: "PUT",
        body: JSON.stringify({
          device_id: deviceId,
          uris,
          offset: { position: startIndex },
        }),
      });
    },
    [fetchSpotify, deviceId, isPlayerReady]
  );
}

/**
 * Hook to play an album on the Spotify Web Playback SDK device.
 */
export function usePlayAlbum() {
  const { fetchSpotify, deviceId, isPlayerReady } = useSpotify();

  return useCallback(
    async (albumUri: string, startIndex: number = 0) => {
      if (!deviceId || !isPlayerReady) {
        console.warn("[Playback] No device available");
        return;
      }

      await fetchSpotify("/v1/me/player/play", {
        method: "PUT",
        body: JSON.stringify({
          device_id: deviceId,
          context_uri: albumUri,
          offset: { position: startIndex },
        }),
      });
    },
    [fetchSpotify, deviceId, isPlayerReady]
  );
}

/**
 * Hook to play a playlist on the Spotify Web Playback SDK device.
 */
export function usePlayPlaylist() {
  const { fetchSpotify, deviceId, isPlayerReady } = useSpotify();

  return useCallback(
    async (playlistUri: string, startIndex: number = 0) => {
      if (!deviceId || !isPlayerReady) {
        console.warn("[Playback] No device available");
        return;
      }

      await fetchSpotify("/v1/me/player/play", {
        method: "PUT",
        body: JSON.stringify({
          device_id: deviceId,
          context_uri: playlistUri,
          offset: { position: startIndex },
        }),
      });
    },
    [fetchSpotify, deviceId, isPlayerReady]
  );
}

/**
 * Hook to play an artist's top tracks on the Spotify Web Playback SDK device.
 */
export function usePlayArtist() {
  const { fetchSpotify, deviceId, isPlayerReady } = useSpotify();

  return useCallback(
    async (artistUri: string) => {
      if (!deviceId || !isPlayerReady) {
        console.warn("[Playback] No device available");
        return;
      }

      await fetchSpotify("/v1/me/player/play", {
        method: "PUT",
        body: JSON.stringify({
          device_id: deviceId,
          context_uri: artistUri,
        }),
      });
    },
    [fetchSpotify, deviceId, isPlayerReady]
  );
}
