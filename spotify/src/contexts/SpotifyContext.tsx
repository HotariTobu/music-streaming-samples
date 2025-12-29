/// <reference path="../types/spotify-sdk.d.ts" />
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  buildAuthorizationUrl,
} from "@/lib/spotify/pkce";

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  images: { url: string; width: number; height: number }[];
  product: "premium" | "free" | "open";
  country: string;
}

interface SpotifyContextValue {
  // Configuration state
  isConfigured: boolean;
  clientId: string | null;

  // Auth state
  isAuthenticated: boolean;
  isPremium: boolean;
  error: string | null;

  // User info
  user: SpotifyUser | null;

  // Auth actions
  login: () => Promise<void>;
  logout: () => void;
  checkCredentials: () => Promise<void>;

  // API helper
  fetchSpotify: <T>(endpoint: string, options?: RequestInit) => Promise<T>;

  // Playback SDK
  player: Spotify.Player | null;
  deviceId: string | null;
  isPlayerReady: boolean;
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

const TOKEN_REFRESH_THRESHOLD = 0.83; // Refresh at 83% of lifetime (~50 min for 1 hour token)
const PKCE_VERIFIER_KEY = "spotify_pkce_verifier";
const PKCE_STATE_KEY = "spotify_pkce_state";
const TOKEN_STORAGE_KEY = "spotify_tokens";

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const tokenInfoRef = useRef<TokenInfo | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get redirect URI based on current location
  const getRedirectUri = useCallback(() => {
    return `${window.location.origin}/callback`;
  }, []);

  // Fetch from Spotify API with automatic token handling
  const fetchSpotify = useCallback(async <T,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const tokenInfo = tokenInfoRef.current;
    if (!tokenInfo) {
      throw new Error("Not authenticated");
    }

    const url = endpoint.startsWith("https://")
      ? endpoint
      : `https://api.spotify.com${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${tokenInfo.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await refreshToken();
        // Retry the request with new token
        return fetchSpotify(endpoint, options);
      } catch {
        // Refresh failed, logout
        logout();
        throw new Error("Session expired");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API error: ${response.status}`
      );
    }

    // Handle empty responses
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
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
          console.log("[Spotify] Refreshing token...");
          await refreshToken();
          console.log("[Spotify] Token refreshed successfully");
        } catch (err) {
          console.error("[Spotify] Token refresh failed:", err);
          setError(err instanceof Error ? err.message : "Token refresh failed");
        }
      }, refreshAt);
    }
  }, []);

  // Refresh access token
  const refreshToken = useCallback(async () => {
    const currentToken = tokenInfoRef.current;
    if (!currentToken?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("/api/token/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentToken.refreshToken }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Token refresh failed");
    }

    const data = await response.json();
    const newTokenInfo: TokenInfo = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: new Date(data.expiresAt),
    };

    tokenInfoRef.current = newTokenInfo;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokenInfo));
    scheduleTokenRefresh(newTokenInfo);
  }, [scheduleTokenRefresh]);

  // Check if credentials are configured
  const checkCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      setIsConfigured(data.configured);
      setClientId(data.clientId);

      if (data.configured) {
        setError(null);
      }
    } catch {
      setError("Failed to check credentials");
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await fetchSpotify<SpotifyUser>("/v1/me");
      setUser({
        id: profile.id,
        displayName: profile.displayName || profile.id,
        email: profile.email,
        images: profile.images,
        product: profile.product,
        country: profile.country,
      });
      setIsPremium(profile.product === "premium");
    } catch (err) {
      console.error("[Spotify] Failed to fetch user profile:", err);
    }
  }, [fetchSpotify]);

  // Initialize Web Playback SDK
  const initializePlayer = useCallback(async () => {
    if (!tokenInfoRef.current || !isPremium) {
      return;
    }

    // Load SDK script if not already loaded
    if (!window.Spotify) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        script.onload = () => {
          // Wait for SDK to be ready
          window.onSpotifyWebPlaybackSDKReady = () => resolve();
        };
        script.onerror = () => reject(new Error("Failed to load Spotify SDK"));
        document.body.appendChild(script);
      });
    }

    const spotifyPlayer = new window.Spotify.Player({
      name: "Spotify Sample Player",
      getOAuthToken: (cb) => {
        cb(tokenInfoRef.current?.accessToken || "");
      },
      volume: 0.5,
    });

    // Error handling
    spotifyPlayer.addListener("initialization_error", ({ message }) => {
      console.error("[Spotify Player] Initialization error:", message);
      setError(`Player initialization error: ${message}`);
    });

    spotifyPlayer.addListener("authentication_error", ({ message }) => {
      console.error("[Spotify Player] Authentication error:", message);
      setError(`Player authentication error: ${message}`);
    });

    spotifyPlayer.addListener("account_error", ({ message }) => {
      console.error("[Spotify Player] Account error:", message);
      setError(`Player account error: ${message}`);
    });

    spotifyPlayer.addListener("playback_error", ({ message }) => {
      console.error("[Spotify Player] Playback error:", message);
    });

    // Ready
    spotifyPlayer.addListener("ready", ({ device_id }) => {
      console.log("[Spotify Player] Ready with device ID:", device_id);
      setDeviceId(device_id);
      setIsPlayerReady(true);
    });

    // Not Ready
    spotifyPlayer.addListener("not_ready", ({ device_id }) => {
      console.log("[Spotify Player] Device went offline:", device_id);
      setIsPlayerReady(false);
    });

    // Connect to the player
    const connected = await spotifyPlayer.connect();
    if (connected) {
      console.log("[Spotify Player] Connected successfully");
      setPlayer(spotifyPlayer);
    } else {
      console.error("[Spotify Player] Failed to connect");
    }
  }, [isPremium]);

  // Login - initiate OAuth flow
  const login = useCallback(async () => {
    if (!clientId) {
      throw new Error("Client ID not configured");
    }

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store for callback
    sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
    sessionStorage.setItem(PKCE_STATE_KEY, state);

    // Build and redirect to authorization URL
    const authUrl = buildAuthorizationUrl({
      clientId,
      redirectUri: getRedirectUri(),
      codeChallenge,
      state,
    });

    window.location.href = authUrl;
  }, [clientId, getRedirectUri]);

  // Logout
  const logout = useCallback(() => {
    // Disconnect player
    if (player) {
      player.disconnect();
    }

    // Clear state
    tokenInfoRef.current = null;
    setIsAuthenticated(false);
    setUser(null);
    setIsPremium(false);
    setPlayer(null);
    setDeviceId(null);
    setIsPlayerReady(false);

    // Clear storage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);

    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, [player]);

  // Handle OAuth callback
  const handleCallback = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("auth_code");
    const authState = params.get("auth_state");
    const authError = params.get("auth_error");

    if (authError) {
      setError(`Authorization failed: ${authError}`);
      // Clean up URL
      window.history.replaceState({}, "", "/");
      return;
    }

    if (!authCode || !authState) {
      return;
    }

    // Verify state
    const storedState = sessionStorage.getItem(PKCE_STATE_KEY);
    if (authState !== storedState) {
      setError("State mismatch - possible CSRF attack");
      window.history.replaceState({}, "", "/");
      return;
    }

    // Get code verifier
    const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    if (!codeVerifier) {
      setError("Code verifier not found");
      window.history.replaceState({}, "", "/");
      return;
    }

    try {
      // Exchange code for tokens
      const response = await fetch("/api/token/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: authCode,
          codeVerifier,
          redirectUri: getRedirectUri(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Token exchange failed");
      }

      const data = await response.json();
      const tokenInfo: TokenInfo = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: new Date(data.expiresAt),
      };

      // Store token info
      tokenInfoRef.current = tokenInfo;
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));

      // Clean up session storage
      sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      sessionStorage.removeItem(PKCE_STATE_KEY);

      // Update state
      setIsAuthenticated(true);
      setError(null);

      // Schedule refresh
      scheduleTokenRefresh(tokenInfo);

      // Fetch user profile
      await fetchUserProfile();

      // Clean up URL
      window.history.replaceState({}, "", "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      window.history.replaceState({}, "", "/");
    }
  }, [getRedirectUri, scheduleTokenRefresh, fetchUserProfile]);

  // Restore session from storage
  const restoreSession = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) return;

    try {
      const tokenInfo: TokenInfo = JSON.parse(stored);
      tokenInfo.expiresAt = new Date(tokenInfo.expiresAt);

      // Check if token is still valid
      if (tokenInfo.expiresAt.getTime() < Date.now()) {
        // Token expired, try to refresh
        tokenInfoRef.current = tokenInfo;
        await refreshToken();
      } else {
        tokenInfoRef.current = tokenInfo;
        scheduleTokenRefresh(tokenInfo);
      }

      setIsAuthenticated(true);
      await fetchUserProfile();
    } catch (err) {
      console.error("[Spotify] Session restore failed:", err);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [refreshToken, scheduleTokenRefresh, fetchUserProfile]);

  // Check credentials on mount
  useEffect(() => {
    checkCredentials();
  }, [checkCredentials]);

  // Handle OAuth callback or restore session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("auth_code") || params.has("auth_error")) {
      handleCallback();
    } else if (isConfigured) {
      restoreSession();
    }
  }, [isConfigured, handleCallback, restoreSession]);

  // Initialize player when authenticated and premium
  useEffect(() => {
    if (isAuthenticated && isPremium && !player) {
      initializePlayer();
    }
  }, [isAuthenticated, isPremium, player, initializePlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (player) {
        player.disconnect();
      }
    };
  }, [player]);

  const value: SpotifyContextValue = {
    isConfigured,
    clientId,
    isAuthenticated,
    isPremium,
    error,
    user,
    login,
    logout,
    checkCredentials,
    fetchSpotify,
    player,
    deviceId,
    isPlayerReady,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
}
