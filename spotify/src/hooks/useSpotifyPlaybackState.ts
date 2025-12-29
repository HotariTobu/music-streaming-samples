/// <reference path="../types/spotify-sdk.d.ts" />
import { useState, useEffect, useCallback } from "react";
import { useSpotify } from "@/contexts/SpotifyContext";

interface PlaybackTrack {
  id: string | null;
  uri: string;
  name: string;
  artistName: string;
  albumName: string;
  durationMs: number;
  imageUrl: string | undefined;
}

interface PlaybackStateData {
  isPlaying: boolean;
  isPaused: boolean;
  currentTrack: PlaybackTrack | null;
  positionMs: number;
  durationMs: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 0 | 1 | 2; // 0: off, 1: context, 2: track
  previousTracks: PlaybackTrack[];
  nextTracks: PlaybackTrack[];
}

const initialState: PlaybackStateData = {
  isPlaying: false,
  isPaused: true,
  currentTrack: null,
  positionMs: 0,
  durationMs: 0,
  volume: 0.5,
  shuffle: false,
  repeatMode: 0,
  previousTracks: [],
  nextTracks: [],
};

function convertTrack(track: Spotify.Track): PlaybackTrack {
  return {
    id: track.id,
    uri: track.uri,
    name: track.name,
    artistName: track.artists.map((a: { uri: string; name: string }) => a.name).join(", "),
    albumName: track.album.name,
    durationMs: track.duration_ms,
    imageUrl: track.album.images[0]?.url,
  };
}

/**
 * Hook to track Spotify Web Playback SDK state.
 */
export function useSpotifyPlaybackState() {
  const { player, isPlayerReady } = useSpotify();
  const [state, setState] = useState<PlaybackStateData>(initialState);

  // Update state from SDK playback state
  const updateFromPlaybackState = useCallback((sdkState: Spotify.PlaybackState | null) => {
    if (!sdkState) {
      setState(initialState);
      return;
    }

    setState({
      isPlaying: !sdkState.paused,
      isPaused: sdkState.paused,
      currentTrack: convertTrack(sdkState.track_window.current_track),
      positionMs: sdkState.position,
      durationMs: sdkState.duration,
      volume: state.volume, // Volume is managed separately
      shuffle: sdkState.shuffle,
      repeatMode: sdkState.repeat_mode,
      previousTracks: sdkState.track_window.previous_tracks.map(convertTrack),
      nextTracks: sdkState.track_window.next_tracks.map(convertTrack),
    });
  }, [state.volume]);

  // Listen for player state changes
  useEffect(() => {
    if (!player || !isPlayerReady) return;

    const handleStateChange = (sdkState: Spotify.PlaybackState | null) => {
      updateFromPlaybackState(sdkState);
    };

    player.addListener("player_state_changed", handleStateChange);

    // Get initial state
    player.getCurrentState().then((sdkState: Spotify.PlaybackState | null) => {
      updateFromPlaybackState(sdkState);
    });

    // Get initial volume
    player.getVolume().then((vol: number) => {
      setState((prev) => ({ ...prev, volume: vol }));
    });

    return () => {
      player.removeListener("player_state_changed");
    };
  }, [player, isPlayerReady, updateFromPlaybackState]);

  // Playback controls
  const togglePlay = useCallback(async () => {
    if (!player) return;
    await player.togglePlay();
  }, [player]);

  const pause = useCallback(async () => {
    if (!player) return;
    await player.pause();
  }, [player]);

  const resume = useCallback(async () => {
    if (!player) return;
    await player.resume();
  }, [player]);

  const skipNext = useCallback(async () => {
    if (!player) return;
    await player.nextTrack();
  }, [player]);

  const skipPrevious = useCallback(async () => {
    if (!player) return;
    await player.previousTrack();
  }, [player]);

  const seek = useCallback(async (positionMs: number) => {
    if (!player) return;
    await player.seek(positionMs);
  }, [player]);

  const setVolume = useCallback(async (volume: number) => {
    if (!player) return;
    await player.setVolume(volume);
    setState((prev) => ({ ...prev, volume }));
  }, [player]);

  return {
    ...state,
    togglePlay,
    pause,
    resume,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
  };
}
