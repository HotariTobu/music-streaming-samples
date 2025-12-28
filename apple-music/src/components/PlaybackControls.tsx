import { useCallback } from "react";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useMusicKitEvents } from "@/hooks/useMusicKitEvents";
import { formatDuration, getArtworkUrl, getPlaybackStateLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from "lucide-react";

export function PlaybackControls() {
  const { musicKit, isAuthorized } = useMusicKit();
  const {
    playbackState,
    nowPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    queue,
    queuePosition,
  } = useMusicKitEvents();

  const togglePlayPause = useCallback(async () => {
    if (!musicKit) return;

    const { PlaybackStates } = MusicKit;

    // If playing, pause
    if (playbackState === PlaybackStates.playing) {
      musicKit.pause();
      return;
    }

    // Only call play() in valid states (paused, stopped, completed, none)
    // Avoid calling play() during loading, seeking, waiting, or stalled
    const canPlay = [
      PlaybackStates.none,
      PlaybackStates.paused,
      PlaybackStates.stopped,
      PlaybackStates.completed,
      PlaybackStates.ended,
    ].includes(playbackState);

    if (canPlay) {
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
    (values: number[]) => {
      if (!musicKit || duration === 0) return;
      const seekTime = values[0] ?? 0;
      musicKit.seekToTime(seekTime);
    },
    [musicKit, duration]
  );

  const handleVolumeChange = useCallback(
    (values: number[]) => {
      const newVolume = values[0] ?? 1;
      setVolume(newVolume);
      if (musicKit) {
        musicKit.volume = newVolume;
      }
    },
    [musicKit, setVolume]
  );

  const playQueueItem = useCallback(
    async (index: number) => {
      if (!musicKit) return;
      await musicKit.changeToMediaAtIndex(index);
    },
    [musicKit]
  );

  const isPlaying = playbackState === MusicKit.PlaybackStates.playing;

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <Card>
        <CardHeader>
          <CardTitle>Now Playing</CardTitle>
        </CardHeader>
        <CardContent>
        {nowPlaying ? (
          <div className="flex gap-6">
            {/* Artwork */}
            <div className="shrink-0">
              {nowPlaying.attributes.artwork ? (
                <img
                  src={getArtworkUrl(nowPlaying.attributes.artwork, 160)}
                  alt={nowPlaying.attributes.name}
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
                  {nowPlaying.attributes.name}
                </p>
                <p className="text-muted-foreground truncate">
                  {nowPlaying.attributes.artistName}
                </p>
                <p className="text-muted-foreground/60 text-sm truncate">
                  {nowPlaying.attributes.albumName}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  min={0}
                  max={duration || 1}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(currentTime * 1000)}</span>
                  <span>{formatDuration(duration * 1000)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
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
                  onClick={togglePlayPause}
                  className="h-10 w-10 rounded-full hover:bg-foreground/10"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipNext}
                  className="h-10 w-10 rounded-full hover:bg-foreground/10"
                >
                  <SkipForward className="h-5 w-5" />
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
                value={[volume ?? 1]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm w-10">
                {Math.round((volume ?? 1) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Playback State */}
        <Card className="justify-center">
          <CardContent className="py-0">
            <div className="flex items-center gap-3">
              <span className={`
                w-3 h-3 rounded-full
                ${isPlaying ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}
              `} />
              <span className="text-muted-foreground">
                State: <span className="text-foreground">{getPlaybackStateLabel(playbackState)}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Queue ({queue.length} tracks)</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {queue.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => playQueueItem(idx)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                  ${idx === queuePosition
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-muted/50"
                  }
                `}
              >
                <span className={`
                  w-6 flex justify-center text-sm
                  ${idx === queuePosition ? "text-primary" : "text-muted-foreground"}
                `}>
                  {idx === queuePosition ? <Play className="h-3 w-3" /> : idx + 1}
                </span>
                {item.attributes.artwork ? (
                  <img
                    src={getArtworkUrl(item.attributes.artwork, 40)}
                    alt={item.attributes.name}
                    className="w-10 h-10 rounded-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                    <Music className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${idx === queuePosition ? "text-foreground font-medium" : "text-foreground/80"}`}>
                    {item.attributes.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.attributes.artistName}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDuration(item.attributes.durationInMillis)}
                </span>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Authorization Notice */}
      {!isAuthorized && (
        <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
          <AlertDescription>
            <strong>Note:</strong> Full playback requires Apple Music subscription.
            Without authorization, only 30-second previews are available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
