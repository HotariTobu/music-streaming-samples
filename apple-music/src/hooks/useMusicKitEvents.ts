import { useState, useEffect } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";

interface MusicKitEventState {
  playbackState: MusicKit.PlaybackStates;
  nowPlaying: MusicKit.MediaItem | undefined;
  currentTime: number;
  duration: number;
  volume: number;
  queue: MusicKit.MediaItem[];
  queuePosition: number;
}

/**
 * Hook for subscribing to MusicKit playback events
 * Consolidates 7 event listeners into a single reusable hook
 */
export function useMusicKitEvents(): MusicKitEventState {
  const { musicKit } = useMusicKit();

  const [playbackState, setPlaybackState] = useState<MusicKit.PlaybackStates>(0);
  const [nowPlaying, setNowPlaying] = useState<MusicKit.MediaItem | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<MusicKit.MediaItem[]>([]);
  const [queuePosition, setQueuePosition] = useState(0);

  useEffect(() => {
    if (!musicKit) return;

    // Initialize with current state
    setPlaybackState(musicKit.playbackState);
    setNowPlaying(musicKit.nowPlayingItem);
    setCurrentTime(musicKit.currentPlaybackTime);
    setDuration(musicKit.currentPlaybackDuration);
    setVolume(musicKit.volume);
    setQueue(musicKit.queue.items);
    setQueuePosition(musicKit.queue.position);

    // Event handlers
    const handlePlaybackState = (e: { state: MusicKit.PlaybackStates }) => {
      setPlaybackState(e.state);
    };

    const handleNowPlaying = (e: { item: MusicKit.MediaItem | undefined }) => {
      setNowPlaying(e.item);
    };

    const handleTimeChange = (e: { currentPlaybackTime: number }) => {
      setCurrentTime(e.currentPlaybackTime);
    };

    const handleDurationChange = (e: { duration: number }) => {
      setDuration(e.duration);
    };

    const handleVolumeChange = (e: { volume: number }) => {
      setVolume(e.volume);
    };

    const handleQueueChange = (e: { items: MusicKit.MediaItem[] }) => {
      setQueue(e.items);
    };

    const handleQueuePosition = (e: { position: number }) => {
      setQueuePosition(e.position);
    };

    // Subscribe to events
    musicKit.addEventListener("playbackStateDidChange", handlePlaybackState);
    musicKit.addEventListener("nowPlayingItemDidChange", handleNowPlaying);
    musicKit.addEventListener("playbackTimeDidChange", handleTimeChange);
    musicKit.addEventListener("playbackDurationDidChange", handleDurationChange);
    musicKit.addEventListener("playbackVolumeDidChange", handleVolumeChange);
    musicKit.addEventListener("queueItemsDidChange", handleQueueChange);
    musicKit.addEventListener("queuePositionDidChange", handleQueuePosition);

    // Cleanup
    return () => {
      musicKit.removeEventListener("playbackStateDidChange", handlePlaybackState);
      musicKit.removeEventListener("nowPlayingItemDidChange", handleNowPlaying);
      musicKit.removeEventListener("playbackTimeDidChange", handleTimeChange);
      musicKit.removeEventListener("playbackDurationDidChange", handleDurationChange);
      musicKit.removeEventListener("playbackVolumeDidChange", handleVolumeChange);
      musicKit.removeEventListener("queueItemsDidChange", handleQueueChange);
      musicKit.removeEventListener("queuePositionDidChange", handleQueuePosition);
    };
  }, [musicKit]);

  return {
    playbackState,
    nowPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queuePosition,
  };
}
