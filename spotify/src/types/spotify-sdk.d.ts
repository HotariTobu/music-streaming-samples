/**
 * Type definitions for Spotify Web Playback SDK
 * @see https://developer.spotify.com/documentation/web-playback-sdk/reference
 */

declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

declare global {
  namespace Spotify {
    interface Player {
    /** Connect to Spotify's servers */
    connect(): Promise<boolean>;

    /** Disconnect from Spotify's servers */
    disconnect(): void;

    /** Add an event listener */
    addListener(
      event: "ready" | "not_ready",
      callback: (data: { device_id: string }) => void
    ): boolean;
    addListener(
      event:
        | "initialization_error"
        | "authentication_error"
        | "account_error"
        | "playback_error",
      callback: (data: { message: string }) => void
    ): boolean;
    addListener(
      event: "player_state_changed",
      callback: (state: PlaybackState | null) => void
    ): boolean;
    addListener(event: "autoplay_failed", callback: () => void): boolean;

    /** Remove an event listener */
    removeListener(
      event: string,
      callback?: (...args: unknown[]) => void
    ): boolean;

    /** Get the current playback state */
    getCurrentState(): Promise<PlaybackState | null>;

    /** Set the player name */
    setName(name: string): Promise<void>;

    /** Get the current volume (0-1) */
    getVolume(): Promise<number>;

    /** Set the volume (0-1) */
    setVolume(volume: number): Promise<void>;

    /** Pause playback */
    pause(): Promise<void>;

    /** Resume playback */
    resume(): Promise<void>;

    /** Toggle play/pause */
    togglePlay(): Promise<void>;

    /** Seek to a position in milliseconds */
    seek(position_ms: number): Promise<void>;

    /** Skip to previous track */
    previousTrack(): Promise<void>;

    /** Skip to next track */
    nextTrack(): Promise<void>;

    /** Activate this device for playback */
    activateElement(): Promise<void>;
  }

  interface PlayerInit {
    /** Name to display in Spotify Connect */
    name: string;

    /** Callback to get OAuth token */
    getOAuthToken: (callback: (token: string) => void) => void;

    /** Initial volume (0-1), default 1 */
    volume?: number;

    /** Enable Media Session API, default true */
    enableMediaSession?: boolean;
  }

  /** Create a new player instance */
  const Player: {
    new (init: PlayerInit): Player;
  };

  interface PlaybackState {
    /** The playback context (album, playlist, etc.) */
    context: {
      uri: string;
      metadata: Record<string, unknown>;
    };

    /** Actions that are disallowed in the current state */
    disallows: {
      pausing?: boolean;
      peeking_next?: boolean;
      peeking_prev?: boolean;
      resuming?: boolean;
      seeking?: boolean;
      skipping_next?: boolean;
      skipping_prev?: boolean;
    };

    /** Track duration in milliseconds */
    duration: number;

    /** Whether playback is paused */
    paused: boolean;

    /** Current playback position in milliseconds */
    position: number;

    /** Repeat mode: 0=off, 1=context, 2=track */
    repeat_mode: 0 | 1 | 2;

    /** Whether shuffle is enabled */
    shuffle: boolean;

    /** Timestamp of when this state was retrieved */
    timestamp: number;

    /** The current, previous, and next tracks */
    track_window: {
      current_track: Track;
      previous_tracks: Track[];
      next_tracks: Track[];
    };
  }

  interface Track {
    /** Spotify URI */
    uri: string;

    /** Spotify ID */
    id: string | null;

    /** Track type (track, episode, ad) */
    type: "track" | "episode" | "ad";

    /** Media type (audio, video) */
    media_type: "audio" | "video";

    /** Track name */
    name: string;

    /** Whether this is a podcast */
    is_playable: boolean;

    /** Album info */
    album: {
      uri: string;
      name: string;
      images: Image[];
    };

    /** Artist info */
    artists: {
      uri: string;
      name: string;
    }[];

    /** Track duration in milliseconds */
    duration_ms: number;
  }

  interface Image {
    url: string;
    height: number;
    width: number;
  }
  }
}

export {};
