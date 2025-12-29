import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";

// YouTube Player types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => { video_id: string; title: string; author: string };
  destroy: () => void;
}

interface TokenInfo {
  accessToken: string;
  expiresAt: Date;
}

export interface QueueItem {
  videoId: string;
  title: string;
  thumbnail?: string;
  channelTitle?: string;
  duration?: number;
}

interface YouTubeContextValue {
  isConfigured: boolean;
  isReady: boolean;
  isAuthorized: boolean;
  error: string | null;
  accessToken: string | null;
  player: YTPlayer | null;
  playerState: number;
  currentVideoId: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: QueueItem[];
  queuePosition: number;
  authorize: () => void;
  logout: () => Promise<void>;
  checkCredentials: () => Promise<void>;
  playVideo: (videoId: string, title?: string, thumbnail?: string, channelTitle?: string) => void;
  playQueue: (items: QueueItem[], startIndex?: number) => void;
  addToQueue: (item: QueueItem) => void;
  clearQueue: () => void;
  playQueueItem: (index: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  pause: () => void;
  resume: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const YouTubeContext = createContext<YouTubeContextValue | null>(null);

const TOKEN_REFRESH_THRESHOLD = 0.8;

export function YouTubeProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<YTPlayer | null>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queuePosition, setQueuePosition] = useState(-1);

  const tokenInfoRef = useRef<TokenInfo | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const queuePositionRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queuePositionRef.current = queuePosition;
  }, [queuePosition]);

  // Check if credentials are configured
  const checkCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      setIsConfigured(data.configured);

      if (data.configured) {
        setError(null);
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData.authorized && sessionData.accessToken) {
          setAccessToken(sessionData.accessToken);
          setIsAuthorized(true);
          tokenInfoRef.current = {
            accessToken: sessionData.accessToken,
            expiresAt: new Date(sessionData.expiresAt),
          };
        }
      }
    } catch {
      setError("Failed to check credentials");
    }
  }, []);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((tokenInfo: TokenInfo) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const expiresAt = tokenInfo.expiresAt.getTime();
    const lifetime = expiresAt - now;
    const refreshAt = lifetime * TOKEN_REFRESH_THRESHOLD;

    if (refreshAt > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          console.log("[YouTube] Refreshing token...");
          const res = await fetch("/api/auth/refresh", { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            const newTokenInfo: TokenInfo = {
              accessToken: data.accessToken,
              expiresAt: new Date(data.expiresAt),
            };
            tokenInfoRef.current = newTokenInfo;
            setAccessToken(data.accessToken);
            console.log("[YouTube] Token refreshed successfully");
            scheduleTokenRefresh(newTokenInfo);
          }
        } catch (err) {
          console.error("[YouTube] Token refresh failed:", err);
          setError("Token refresh failed");
        }
      }, refreshAt);
    }
  }, []);

  // Play next in queue
  const playNextInQueue = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentPosition = queuePositionRef.current;

    if (currentQueue.length > 0 && currentPosition < currentQueue.length - 1) {
      const nextPosition = currentPosition + 1;
      const nextItem = currentQueue[nextPosition];
      if (nextItem && playerRef.current) {
        playerRef.current.loadVideoById(nextItem.videoId);
        setCurrentVideoId(nextItem.videoId);
        setQueuePosition(nextPosition);
      }
    }
  }, []);

  // Handle player errors (e.g., video not embeddable)
  const handlePlayerError = useCallback((errorCode: number) => {
    console.error("[YouTube] Player error:", errorCode);
    // Error codes 100, 101, 150 = video not available or not embeddable
    // Auto-skip to next track on these errors
    if (errorCode === 100 || errorCode === 101 || errorCode === 150) {
      const currentQueue = queueRef.current;
      const currentPosition = queuePositionRef.current;
      const currentItem = currentQueue[currentPosition];
      const hasNext = currentPosition < currentQueue.length - 1;

      toast.error(
        `"${currentItem?.title || "Video"}" cannot be played (embed restricted)`,
        {
          description: hasNext ? "Skipping to next track..." : undefined,
        }
      );

      if (hasNext) {
        playNextInQueue();
      }
    }
  }, [playNextInQueue]);

  // Create YouTube player
  const createPlayer = useCallback(() => {
    let container = document.getElementById("youtube-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "youtube-player-container";
      container.style.position = "fixed";
      container.style.bottom = "0";
      container.style.left = "0";
      container.style.width = "1px";
      container.style.height = "1px";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }

    let playerElement = document.getElementById("youtube-player");
    if (!playerElement) {
      playerElement = document.createElement("div");
      playerElement.id = "youtube-player";
      container.appendChild(playerElement);
    }

    const newPlayer = new window.YT.Player("youtube-player", {
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          playerRef.current = newPlayer;
          setPlayer(newPlayer);
          setIsReady(true);
          console.log("[YouTube] Player ready");
        },
        onStateChange: (event) => {
          setPlayerState(event.data);
          if (event.data === window.YT.PlayerState.PLAYING) {
            setDuration(newPlayer.getDuration());
          }
          // Auto-play next when video ends
          if (event.data === window.YT.PlayerState.ENDED) {
            playNextInQueue();
          }
        },
        onError: (event) => {
          handlePlayerError(event.data);
        },
      },
    });
  }, [playNextInQueue, handlePlayerError]);

  // Initialize YouTube IFrame API
  const initializePlayer = useCallback(() => {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
  }, [createPlayer]);

  // Authorize
  const authorize = useCallback(() => {
    window.location.href = "/api/auth/login";
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthorized(false);
      setAccessToken(null);
      tokenInfoRef.current = null;
    } catch (err) {
      console.error("[YouTube] Logout failed:", err);
    }
  }, []);

  // Play single video
  const playVideo = useCallback(
    (videoId: string, title?: string, thumbnail?: string, channelTitle?: string) => {
      if (player) {
        player.loadVideoById(videoId);
        setCurrentVideoId(videoId);
        // Add to queue as single item
        const item: QueueItem = { videoId, title: title || videoId, thumbnail, channelTitle };
        setQueue([item]);
        setQueuePosition(0);
      }
    },
    [player]
  );

  // Play queue
  const playQueue = useCallback(
    (items: QueueItem[], startIndex = 0) => {
      if (player && items.length > 0) {
        setQueue(items);
        setQueuePosition(startIndex);
        const item = items[startIndex];
        if (item) {
          player.loadVideoById(item.videoId);
          setCurrentVideoId(item.videoId);
        }
      }
    },
    [player]
  );

  // Add to queue
  const addToQueue = useCallback((item: QueueItem) => {
    setQueue((prev) => [...prev, item]);
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueuePosition(-1);
  }, []);

  // Play specific queue item
  const playQueueItem = useCallback(
    (index: number) => {
      if (player && queue[index]) {
        const item = queue[index];
        player.loadVideoById(item.videoId);
        setCurrentVideoId(item.videoId);
        setQueuePosition(index);
      }
    },
    [player, queue]
  );

  // Skip next
  const skipNext = useCallback(() => {
    if (queue.length > 0 && queuePosition < queue.length - 1) {
      playQueueItem(queuePosition + 1);
    }
  }, [queue.length, queuePosition, playQueueItem]);

  // Skip previous
  const skipPrevious = useCallback(() => {
    if (queue.length > 0 && queuePosition > 0) {
      playQueueItem(queuePosition - 1);
    }
  }, [queue.length, queuePosition, playQueueItem]);

  // Pause
  const pause = useCallback(() => {
    player?.pauseVideo();
  }, [player]);

  // Resume
  const resume = useCallback(() => {
    player?.playVideo();
  }, [player]);

  // Seek
  const seekTo = useCallback(
    (seconds: number) => {
      player?.seekTo(seconds, true);
    },
    [player]
  );

  // Set volume
  const setVolume = useCallback(
    (vol: number) => {
      if (player) {
        player.setVolume(vol);
        setVolumeState(vol);
      }
    },
    [player]
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (player) {
      if (player.isMuted()) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    }
  }, [player]);

  // Check credentials on mount
  useEffect(() => {
    checkCredentials();
  }, [checkCredentials]);

  // Initialize player when configured
  useEffect(() => {
    if (isConfigured) {
      initializePlayer();
    }
  }, [isConfigured, initializePlayer]);

  // Update current time periodically
  useEffect(() => {
    if (playerState === 1) {
      timeUpdateIntervalRef.current = setInterval(() => {
        if (player) {
          setCurrentTime(player.getCurrentTime());
        }
      }, 500);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [playerState, player]);

  // Schedule token refresh when authorized
  useEffect(() => {
    if (tokenInfoRef.current && isAuthorized) {
      scheduleTokenRefresh(tokenInfoRef.current);
    }
  }, [isAuthorized, scheduleTokenRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  const value: YouTubeContextValue = {
    isConfigured,
    isReady,
    isAuthorized,
    error,
    accessToken,
    player,
    playerState,
    currentVideoId,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queuePosition,
    authorize,
    logout,
    checkCredentials,
    playVideo,
    playQueue,
    addToQueue,
    clearQueue,
    playQueueItem,
    skipNext,
    skipPrevious,
    pause,
    resume,
    seekTo,
    setVolume,
    toggleMute,
  };

  return (
    <YouTubeContext.Provider value={value}>{children}</YouTubeContext.Provider>
  );
}

export function useYouTube() {
  const context = useContext(YouTubeContext);
  if (!context) {
    throw new Error("useYouTube must be used within a YouTubeProvider");
  }
  return context;
}
