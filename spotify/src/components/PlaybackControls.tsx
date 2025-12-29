import { useState, useEffect, useCallback } from "react";
import { useSpotify } from "@/contexts/SpotifyContext";
import { useSpotifyPlaybackState } from "@/hooks/useSpotifyPlaybackState";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";

export function PlaybackControls() {
  const { isPremium, isPlayerReady, fetchSpotify, deviceId } = useSpotify();
  const {
    isPlaying,
    currentTrack,
    positionMs,
    durationMs,
    volume,
    shuffle,
    repeatMode,
    previousTracks,
    nextTracks,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
  } = useSpotifyPlaybackState();

  // Local position for smooth slider updates
  const [localPosition, setLocalPosition] = useState(positionMs);
  const [isSeeking, setIsSeeking] = useState(false);

  // Update local position from SDK state
  useEffect(() => {
    if (!isSeeking) {
      setLocalPosition(positionMs);
    }
  }, [positionMs, isSeeking]);

  // Progress timer for smooth playback position updates
  useEffect(() => {
    if (!isPlaying || isSeeking) return;

    const interval = setInterval(() => {
      setLocalPosition((prev) => Math.min(prev + 1000, durationMs));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isSeeking, durationMs]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekChange = useCallback((values: number[]) => {
    setLocalPosition(values[0] ?? 0);
  }, []);

  const handleSeekEnd = useCallback(
    async (values: number[]) => {
      const seekPosition = values[0] ?? 0;
      await seek(seekPosition);
      setIsSeeking(false);
    },
    [seek]
  );

  const handleVolumeChange = useCallback(
    async (values: number[]) => {
      const newVolume = values[0] ?? 0.5;
      await setVolume(newVolume);
    },
    [setVolume]
  );

  const toggleShuffle = useCallback(async () => {
    if (!deviceId) return;
    await fetchSpotify(`/v1/me/player/shuffle?state=${!shuffle}&device_id=${deviceId}`, {
      method: "PUT",
    });
  }, [fetchSpotify, deviceId, shuffle]);

  const cycleRepeat = useCallback(async () => {
    if (!deviceId) return;
    // 0 -> context (1), 1 -> track (2), 2 -> off (0)
    const nextMode = repeatMode === 0 ? "context" : repeatMode === 1 ? "track" : "off";
    await fetchSpotify(`/v1/me/player/repeat?state=${nextMode}&device_id=${deviceId}`, {
      method: "PUT",
    });
  }, [fetchSpotify, deviceId, repeatMode]);

  const playQueueTrack = useCallback(
    async (uri: string) => {
      if (!deviceId) return;
      await fetchSpotify(`/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        body: JSON.stringify({ uris: [uri] }),
      });
    },
    [fetchSpotify, deviceId]
  );

  // Combine previous, current, and next tracks for queue display
  const queueTracks = [
    ...previousTracks,
    ...(currentTrack ? [currentTrack] : []),
    ...nextTracks,
  ];
  const currentIndex = previousTracks.length;

  const getRepeatIcon = () => {
    if (repeatMode === 2) return <Repeat1 className="h-4 w-4" />;
    return <Repeat className="h-4 w-4" />;
  };

  const getRepeatLabel = () => {
    if (repeatMode === 0) return "Repeat off";
    if (repeatMode === 1) return "Repeat context";
    return "Repeat track";
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
          <AlertDescription>
            <strong>Spotify Premium Required</strong>
            <p className="mt-1">
              Full playback control requires a Spotify Premium subscription.
              The Web Playback SDK is only available for Premium users.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isPlayerReady) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Connecting to Spotify...</p>
              <p className="text-sm mt-1">Initializing Web Playback SDK</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <Card>
        <CardHeader>
          <CardTitle>Now Playing</CardTitle>
        </CardHeader>
        <CardContent>
          {currentTrack ? (
            <div className="flex gap-6">
              {/* Artwork */}
              <div className="shrink-0">
                {currentTrack.imageUrl ? (
                  <img
                    src={currentTrack.imageUrl}
                    alt={currentTrack.name}
                    className="w-40 h-40 rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-xl bg-secondary flex items-center justify-center">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info & Controls */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <p className="text-xl font-bold text-foreground truncate">
                    {currentTrack.name}
                  </p>
                  <p className="text-muted-foreground truncate">
                    {currentTrack.artistName}
                  </p>
                  <p className="text-muted-foreground/60 text-sm truncate">
                    {currentTrack.albumName}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[localPosition]}
                    onPointerDown={handleSeekStart}
                    onValueChange={handleSeekChange}
                    onValueCommit={handleSeekEnd}
                    min={0}
                    max={durationMs || 1}
                    step={1000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(localPosition)}</span>
                    <span>{formatDuration(durationMs)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={`h-8 w-8 rounded-full ${
                      shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={shuffle ? "Shuffle on" : "Shuffle off"}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipPrevious}
                    className="h-10 w-10 rounded-full hover:bg-foreground/10"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="h-12 w-12 rounded-full hover:bg-foreground/10 bg-primary/10"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipNext}
                    className="h-10 w-10 rounded-full hover:bg-foreground/10"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cycleRepeat}
                    className={`h-8 w-8 rounded-full ${
                      repeatMode > 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={getRepeatLabel()}
                  >
                    {getRepeatIcon()}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-2" />
              <p>No track playing</p>
              <p className="text-sm mt-1">Search for music and start playing</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume & State */}
      <div className="grid grid-cols-2 gap-4">
        {/* Volume */}
        <Card className="justify-center">
          <CardContent className="py-0">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm w-10">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Playback State */}
        <Card className="justify-center">
          <CardContent className="py-0">
            <div className="flex items-center gap-3">
              <span
                className={`
                w-3 h-3 rounded-full
                ${isPlaying ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}
              `}
              />
              <span className="text-muted-foreground">
                State:{" "}
                <span className="text-foreground">
                  {isPlaying ? "Playing" : "Paused"}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      {queueTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Queue ({queueTracks.length} tracks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {queueTracks.map((track, idx) => (
                <div
                  key={`${track.uri}-${idx}`}
                  onClick={() => playQueueTrack(track.uri)}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${
                      idx === currentIndex
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-muted/50"
                    }
                  `}
                >
                  <span
                    className={`
                    w-6 flex justify-center text-sm
                    ${idx === currentIndex ? "text-primary" : "text-muted-foreground"}
                  `}
                  >
                    {idx === currentIndex ? (
                      <Play className="h-3 w-3" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  {track.imageUrl ? (
                    <img
                      src={track.imageUrl}
                      alt={track.name}
                      className="w-10 h-10 rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                      <Music className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        idx === currentIndex
                          ? "text-foreground font-medium"
                          : "text-foreground/80"
                      }`}
                    >
                      {track.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artistName}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(track.durationMs)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
