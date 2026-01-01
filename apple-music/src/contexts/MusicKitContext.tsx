import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import z from "zod";

interface MusicKitContextValue {
  musicKit: MusicKit.MusicKitInstance | null;
  isAuthorized: boolean;
  configurationError: Error | null;
}

const MusicKitContext = createContext<MusicKitContextValue | null>(null);

const APP_NAME = "Apple Music Sample";
const APP_BUILD = "1.0.0";
const TOKEN_CHECK_INTERVAL = 1000 * 60;
// const TOKEN_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minute
const TOKEN_THRESHOLD = TOKEN_CHECK_INTERVAL * 2

const getTokenResponseSchema = z.union([
  z.object({
    token: z.string(),
    expiresAt: z.iso.datetime().transform(s => new Date(s))
  }),
  z.object({
    error: z.string()
  })
])

export function MusicKitProvider({ children }: { children: ReactNode }) {
  const [musicKit, setMusicKit] = useState<MusicKit.MusicKitInstance | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [configurationError, setConfigurationError] = useState<Error | null>(null);

  const ref = useRef({
    tokenExpiresAt: new Date(),
    isReconfigurationRequired: false,
    isReconfiguring: false,
  });

  const configure = useCallback(async () => {
    console.log("[MusicKit] Configuring...");
    try {
      const { token, expiresAt } = await fetchToken();
      console.log("[MusicKit] Token fetched, expires:", expiresAt.toISOString());

      const musicKit = await window.MusicKit.configure({
        developerToken: token,
        app: { name: APP_NAME, build: APP_BUILD },
      })

      setMusicKit(musicKit);
      setIsAuthorized(musicKit.isAuthorized);
      setConfigurationError(null)

      ref.current.tokenExpiresAt = expiresAt

      console.log("[MusicKit] Configured successfully");
      return musicKit

    } catch (err) {
      setMusicKit(null)
      setIsAuthorized(false)
      setConfigurationError(err instanceof Error ? err : new Error("Unexpected error"));

      ref.current.tokenExpiresAt = new Date()

      console.error("[MusicKit] Configuration failed:", err);
      throw err
    }
  }, [])

  const reconfigure = useCallback(async () => {
    console.log("[MusicKit] Reconfiguring...");
    if (!musicKit) {
      throw new Error("MusicKit not configured")
    };

    // a. Capture restore data
    const volume = musicKit.volume ?? 1;
    const queueItems = musicKit.queue?.items ?? [];
    const queuePosition = musicKit.queue?.position ?? 0;
    const currentTime = musicKit.currentPlaybackTime ?? 0;

    const songIds = queueItems
      .filter((item) => item.type === "songs" || item.type === "song")
      .map((item) => item.id);

    console.log("[MusicKit] Captured:", { volume, queuePosition, currentTime, queueLength: songIds.length });

    // b. Reconfigure
    await musicKit.stop()
    const newMusicKit = await configure()

    // c. Restore
    newMusicKit.volume = volume;
    await newMusicKit.setQueue({ songs: songIds });
    await newMusicKit.changeToMediaAtIndex(queuePosition);
    await newMusicKit.seekToTime(currentTime);
    console.log("[MusicKit] Restored");
  }, [musicKit]);

  useEffect(() => {
    document.addEventListener("credentialconfigured", configure);
    return () => document.removeEventListener("credentialconfigured", configure)
  }, [configure])

  useEffect(() => {
    console.log("[MusicKit] Reconfigure trigger registration", musicKit)
    if (!musicKit) return

    const triggerReconfigure = async ({ state }: { state: MusicKit.PlaybackStates }) => {
      const { isReconfigurationRequired, isReconfiguring } = ref.current
      if (!isReconfigurationRequired || isReconfiguring) return;

      ref.current.isReconfiguring = true

      switch (state) {
        case MusicKit.PlaybackStates.ended:
          musicKit.pause();
          break;

        case MusicKit.PlaybackStates.loading:
        case MusicKit.PlaybackStates.playing:
        case MusicKit.PlaybackStates.seeking:
        case MusicKit.PlaybackStates.waiting:
        case MusicKit.PlaybackStates.stalled:
          return
      }

      console.log("[MusicKit] Triggering reconfigure, state:", state);
      try {
        await reconfigure();
      } catch (err) {
        console.error("[MusicKit] Reconfiguration failed", err)
      }

      switch (state) {
        case MusicKit.PlaybackStates.ended:
          console.log("[MusicKit] Resuming playback after ended");
          await musicKit.play();
          break;
      }

      ref.current.isReconfigurationRequired = false
      ref.current.isReconfiguring = false
      console.log("[MusicKit] Reconfiguration complete");
    }

    musicKit.addEventListener("playbackStateWillChange", triggerReconfigure);
    return () => musicKit.removeEventListener("playbackStateWillChange", triggerReconfigure)
  }, [musicKit, reconfigure])

  useEffect(() => {
    console.log("[MusicKit] Authorization listener registration", musicKit)
    if (!musicKit) return

    const setAuthorizationStatus = () => {
      console.log("[MusicKit] Authorization changed", musicKit.isAuthorized)
      setIsAuthorized(musicKit.isAuthorized);
    }

    musicKit.addEventListener("authorizationStatusDidChange", setAuthorizationStatus);
    return () => musicKit.removeEventListener("authorizationStatusDidChange", setAuthorizationStatus)
  }, [musicKit])

  useEffect(() => {
    console.log("[MusicKit] Token refresh polling", musicKit, TOKEN_CHECK_INTERVAL)
    if (!musicKit) return

    const checkAndRefresh = async () => {
      const playingStateSet = new Set([
        MusicKit.PlaybackStates.loading,
        MusicKit.PlaybackStates.playing,
        MusicKit.PlaybackStates.seeking,
        MusicKit.PlaybackStates.waiting,
        MusicKit.PlaybackStates.stalled,
      ])

      const { tokenExpiresAt } = ref.current
      const lifetime = tokenExpiresAt.getTime() - new Date().getTime();
      if (lifetime > TOKEN_THRESHOLD) {
        return
      }

      if (playingStateSet.has(musicKit.playbackState)) {
        console.log("[MusicKit] Token refresh queued (playing)");
        ref.current.isReconfigurationRequired = true
      } else {
        console.log("[MusicKit] Token refresh now");
        try {
          await reconfigure();
        } catch (err) {
          console.error("Reconfiguration failed", err)
        }
      }
    };

    const interval = setInterval(checkAndRefresh, TOKEN_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [musicKit, reconfigure]);

  const value: MusicKitContextValue = {
    musicKit,
    isAuthorized,
    configurationError,
  };

  return (
    <MusicKitContext.Provider value={value}>
      {children}
    </MusicKitContext.Provider>
  );
}

export function useMusicKit() {
  const context = useContext(MusicKitContext);
  if (!context) {
    throw new Error("useMusicKit must be used within a MusicKitProvider");
  }
  return context;
}

async function fetchToken() {
  const res = await fetch("/api/token", { cache: "no-store" });

  const rawData = await res.json()
  const parseResult = getTokenResponseSchema.safeParse(rawData)

  if (!parseResult.success) {
    const details = JSON.stringify({
      status: res.status,
      parseError: parseResult.error
    })
    throw new Error(`Failed to fetch token: ${details}`)
  }

  const { data } = parseResult

  if ("error" in data) {
    throw new Error(data.error)
  }

  return data
}
