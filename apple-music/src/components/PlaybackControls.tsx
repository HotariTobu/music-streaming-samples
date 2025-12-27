import { useState, useEffect, useCallback, useRef } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { formatDuration, getArtworkUrl, getPlaybackStateLabel } from "@/lib/utils";

export function PlaybackControls() {
  const { musicKit, isAuthorized } = useMusicKit();
  const [playbackState, setPlaybackState] = useState<MusicKit.PlaybackStates>(
    MusicKit.PlaybackStates.none
  );
  const [nowPlaying, setNowPlaying] = useState<MusicKit.MediaItem | undefined>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState<MusicKit.MediaItem[]>([]);
  const [queuePosition, setQueuePosition] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!musicKit) return;

    // Initial state
    setPlaybackState(musicKit.playbackState);
    setNowPlaying(musicKit.nowPlayingItem);
    setCurrentTime(musicKit.currentPlaybackTime);
    setDuration(musicKit.currentPlaybackDuration);
    setVolume(musicKit.volume);
    setQueue(musicKit.queue.items);
    setQueuePosition(musicKit.queue.position);

    // Event listeners
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

    musicKit.addEventListener("playbackStateDidChange", handlePlaybackState);
    musicKit.addEventListener("nowPlayingItemDidChange", handleNowPlaying);
    musicKit.addEventListener("playbackTimeDidChange", handleTimeChange);
    musicKit.addEventListener("playbackDurationDidChange", handleDurationChange);
    musicKit.addEventListener("playbackVolumeDidChange", handleVolumeChange);
    musicKit.addEventListener("queueItemsDidChange", handleQueueChange);
    musicKit.addEventListener("queuePositionDidChange", handleQueuePosition);

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

  const togglePlayPause = useCallback(async () => {
    if (!musicKit) return;
    if (playbackState === MusicKit.PlaybackStates.playing) {
      musicKit.pause();
    } else {
      await musicKit.play();
    }
  }, [musicKit, playbackState]);

  const skipNext = useCallback(async () => {
    if (!musicKit) return;
    await musicKit.skipToNextItem();
  }, [musicKit]);

  const skipPrevious = useCallback(async () => {
    if (!musicKit) return;
    await musicKit.skipToPreviousItem();
  }, [musicKit]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!musicKit || !progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const seekTime = percent * duration;
      musicKit.seekToTime(seekTime);
    },
    [musicKit, duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!musicKit) return;
      const newVolume = parseFloat(e.target.value);
      musicKit.setVolume(newVolume);
    },
    [musicKit]
  );

  const playQueueItem = useCallback(
    async (index: number) => {
      if (!musicKit) return;
      await musicKit.changeToMediaAtIndex(index);
    },
    [musicKit]
  );

  const isPlaying = playbackState === MusicKit.PlaybackStates.playing;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Now Playing</h3>

        {nowPlaying ? (
          <div className="flex gap-6">
            {/* Artwork */}
            <div className="shrink-0">
              {nowPlaying.attributes.artwork ? (
                <img
                  src={getArtworkUrl(nowPlaying.attributes.artwork, 160)}
                  alt={nowPlaying.attributes.name}
                  className="w-40 h-40 rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-xl bg-zinc-700 flex items-center justify-center text-5xl">
                  ♫
                </div>
              )}
            </div>

            {/* Info & Controls */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <p className="text-xl font-bold text-white truncate">
                  {nowPlaying.attributes.name}
                </p>
                <p className="text-zinc-400 truncate">
                  {nowPlaying.attributes.artistName}
                </p>
                <p className="text-zinc-500 text-sm truncate">
                  {nowPlaying.attributes.albumName}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div
                  ref={progressRef}
                  onClick={handleSeek}
                  className="h-2 bg-zinc-700 rounded-full cursor-pointer group"
                >
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{formatDuration(currentTime * 1000)}</span>
                  <span>{formatDuration(duration * 1000)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={skipPrevious}
                  className="text-zinc-400 hover:text-white transition-colors text-2xl"
                >
                  ⏮
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-2xl hover:scale-105 transition-transform"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  onClick={skipNext}
                  className="text-zinc-400 hover:text-white transition-colors text-2xl"
                >
                  ⏭
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <div className="text-5xl mb-2">🎵</div>
            <p>No track playing</p>
            <p className="text-sm mt-1">Search for music and start playing</p>
          </div>
        )}
      </div>

      {/* Volume & State */}
      <div className="grid grid-cols-2 gap-4">
        {/* Volume */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-pink-500"
            />
            <span className="text-zinc-400 text-sm w-10">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Playback State */}
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className={`
              w-3 h-3 rounded-full
              ${isPlaying ? "bg-green-500 animate-pulse" : "bg-zinc-500"}
            `} />
            <span className="text-zinc-400">
              State: <span className="text-white">{getPlaybackStateLabel(playbackState)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="bg-zinc-800/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            Queue ({queue.length} tracks)
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {queue.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => playQueueItem(idx)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                  ${idx === queuePosition
                    ? "bg-pink-500/20 border border-pink-500/30"
                    : "hover:bg-zinc-700/50"
                  }
                `}
              >
                <span className={`
                  w-6 text-center text-sm
                  ${idx === queuePosition ? "text-pink-400" : "text-zinc-500"}
                `}>
                  {idx === queuePosition ? "▶" : idx + 1}
                </span>
                {item.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(item.attributes.artwork, 40)}
                    alt={item.attributes.name}
                    className="w-10 h-10 rounded"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center text-sm">
                    ♫
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${idx === queuePosition ? "text-white font-medium" : "text-zinc-300"}`}>
                    {item.attributes.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {item.attributes.artistName}
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {formatDuration(item.attributes.durationInMillis)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authorization Notice */}
      {!isAuthorized && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm">
          <strong>Note:</strong> Full playback requires Apple Music subscription.
          Without authorization, only 30-second previews are available.
        </div>
      )}
    </div>
  );
}
