import { useCallback } from "react";
import { useYouTube } from "@/contexts/YouTubeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from "lucide-react";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getPlaybackStateLabel(state: number): string {
  switch (state) {
    case -1:
      return "Unstarted";
    case 0:
      return "Ended";
    case 1:
      return "Playing";
    case 2:
      return "Paused";
    case 3:
      return "Buffering";
    case 5:
      return "Cued";
    default:
      return "Unknown";
  }
}

export function PlaybackControls() {
  const {
    playerState,
    currentVideoId,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queuePosition,
    pause,
    resume,
    seekTo,
    setVolume,
    toggleMute,
    skipNext,
    skipPrevious,
    playQueueItem,
  } = useYouTube();

  const isPlaying = playerState === 1;
  const hasVideo = currentVideoId !== null;
  const currentItem = queue[queuePosition];

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  const handleSeek = useCallback(
    (values: number[]) => {
      const seekTime = values[0] ?? 0;
      seekTo(seekTime);
    },
    [seekTo]
  );

  const handleVolumeChange = useCallback(
    (values: number[]) => {
      const newVolume = values[0] ?? 100;
      setVolume(newVolume);
    },
    [setVolume]
  );

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      <Card>
        <CardHeader>
          <CardTitle>Now Playing</CardTitle>
        </CardHeader>
        <CardContent>
          {hasVideo ? (
            <div className="flex gap-6">
              {/* Artwork */}
              <div className="shrink-0">
                {currentItem?.thumbnail ? (
                  <img
                    src={currentItem.thumbnail}
                    alt={currentItem.title}
                    className="w-40 h-40 rounded-xl shadow-lg object-cover"
                  />
                ) : (
                  <img
                    src={`https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`}
                    alt="Current video"
                    className="w-40 h-40 rounded-xl shadow-lg object-cover"
                  />
                )}
              </div>

              {/* Info & Controls */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <p className="text-xl font-bold text-foreground truncate">
                    {currentItem?.title || `Video: ${currentVideoId}`}
                  </p>
                  <p className="text-muted-foreground truncate">
                    {currentItem?.channelTitle || (
                      <a
                        href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        View on YouTube
                      </a>
                    )}
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
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipPrevious}
                    disabled={queuePosition <= 0}
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
                    disabled={queuePosition >= queue.length - 1}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8"
              >
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm w-10">
                {isMuted ? 0 : volume}%
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
                State: <span className="text-foreground">{getPlaybackStateLabel(playerState)}</span>
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
                  key={`${item.videoId}-${idx}`}
                  onClick={() => playQueueItem(idx)}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${
                      idx === queuePosition
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-muted/50"
                    }
                  `}
                >
                  <span
                    className={`
                    w-6 flex justify-center text-sm
                    ${idx === queuePosition ? "text-primary" : "text-muted-foreground"}
                  `}
                  >
                    {idx === queuePosition ? <Play className="h-3 w-3" /> : idx + 1}
                  </span>
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                      <Music className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${idx === queuePosition ? "text-foreground font-medium" : "text-foreground/80"}`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.channelTitle}
                    </p>
                  </div>
                  {item.duration && (
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(item.duration)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This player uses the YouTube IFrame Player API. Audio plays from
            YouTube servers. Some videos may have playback restrictions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
