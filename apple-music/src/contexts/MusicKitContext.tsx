import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface TokenInfo {
  token: string;
  expiresAt: Date;
}

interface MusicKitContextValue {
  isConfigured: boolean;
  isReady: boolean;
  isAuthorized: boolean;
  error: string | null;
  musicKit: MusicKit.MusicKitInstance | null;
  authorize: () => Promise<void>;
  checkCredentials: () => Promise<void>;
}

const MusicKitContext = createContext<MusicKitContextValue | null>(null);

const TOKEN_REFRESH_THRESHOLD = 0.8; // Refresh at 80% of lifetime
const APP_NAME = "Apple Music Sample";
const APP_BUILD = "1.0.0";

export function MusicKitProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musicKit, setMusicKit] = useState<MusicKit.MusicKitInstance | null>(null);

  const tokenInfoRef = useRef<TokenInfo | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch token from server
  const fetchToken = useCallback(async (): Promise<TokenInfo> => {
    const res = await fetch("/api/token");
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to fetch token");
    }
    const data = await res.json();
    return {
      token: data.token,
      expiresAt: new Date(data.expiresAt),
    };
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
          console.log("[MusicKit] Refreshing token...");
          const newTokenInfo = await fetchToken();
          tokenInfoRef.current = newTokenInfo;

          // Re-configure MusicKit with new token
          if (window.MusicKit) {
            await window.MusicKit.configure({
              developerToken: newTokenInfo.token,
              app: { name: APP_NAME, build: APP_BUILD },
            });
            const instance = window.MusicKit.getInstance();
            setMusicKit(instance);
            setIsAuthorized(instance.isAuthorized);
            console.log("[MusicKit] Token refreshed successfully");
            scheduleTokenRefresh(newTokenInfo);
          }
        } catch (err) {
          console.error("[MusicKit] Token refresh failed:", err);
          setError(err instanceof Error ? err.message : "Token refresh failed");
        }
      }, refreshAt);
    }
  }, [fetchToken]);

  // Check if credentials are configured
  const checkCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      setIsConfigured(data.configured);

      if (data.configured) {
        setError(null);
      }
    } catch {
      setError("Failed to check credentials");
    }
  }, []);

  // Initialize MusicKit
  const initializeMusicKit = useCallback(async () => {
    if (!isConfigured) return;

    try {
      // Fetch developer token first
      const tokenInfo = await fetchToken();
      tokenInfoRef.current = tokenInfo;

      // Set meta tags for MusicKit configuration (before it loads)
      const setMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      setMetaTag("apple-music-developer-token", tokenInfo.token);
      setMetaTag("apple-music-app-name", APP_NAME);
      setMetaTag("apple-music-app-build", APP_BUILD);

      // Wait for MusicKit to load via musickitloaded event
      if (!window.MusicKit) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("MusicKit failed to load"));
          }, 10000);

          document.addEventListener("musickitloaded", () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });

          // Also check if already loaded
          if (window.MusicKit) {
            clearTimeout(timeout);
            resolve();
          }
        });
      }

      // Configure MusicKit (meta tags alone won't work if MusicKit already loaded)
      await window.MusicKit.configure({
        developerToken: tokenInfo.token,
        app: { name: APP_NAME, build: APP_BUILD },
      });

      const instance = window.MusicKit.getInstance();
      setMusicKit(instance);
      setIsReady(true);
      setIsAuthorized(instance.isAuthorized);

      // Schedule token refresh
      scheduleTokenRefresh(tokenInfo);

      // Listen for authorization changes
      instance.addEventListener("authorizationStatusDidChange", () => {
        // Use the isAuthorized property directly as per v3 docs
        setIsAuthorized(instance.isAuthorized);
      });

      console.log("[MusicKit] Initialized successfully");
    } catch (err) {
      console.error("[MusicKit] Initialization failed:", err);
      setError(err instanceof Error ? err.message : "MusicKit initialization failed");
    }
  }, [isConfigured, fetchToken, scheduleTokenRefresh]);

  // Authorize user
  const authorize = useCallback(async () => {
    if (!musicKit) {
      throw new Error("MusicKit not initialized");
    }

    try {
      await musicKit.authorize();
      setIsAuthorized(true);
    } catch (err) {
      console.error("[MusicKit] Authorization failed:", err);
      throw err;
    }
  }, [musicKit]);

  // Check credentials on mount
  useEffect(() => {
    checkCredentials();
  }, [checkCredentials]);

  // Initialize MusicKit when configured
  useEffect(() => {
    if (isConfigured && !isReady) {
      initializeMusicKit();
    }
  }, [isConfigured, isReady, initializeMusicKit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const value: MusicKitContextValue = {
    isConfigured,
    isReady,
    isAuthorized,
    error,
    musicKit,
    authorize,
    checkCredentials,
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
