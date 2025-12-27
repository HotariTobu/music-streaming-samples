/**
 * MusicKit JS v3 Type Definitions
 * @see https://developer.apple.com/documentation/musickitjs
 */

declare namespace MusicKit {
  interface ConfigureOptions {
    developerToken: string;
    app: {
      name: string;
      build: string;
    };
  }

  interface MusicKitInstance {
    readonly isAuthorized: boolean;
    readonly musicUserToken: string;
    readonly storefrontId: string;
    readonly playbackState: PlaybackStates;

    authorize(): Promise<string>;
    unauthorize(): Promise<void>;

    setQueue(options: SetQueueOptions): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    skipToNextItem(): Promise<void>;
    skipToPreviousItem(): Promise<void>;
    seekToTime(time: number): Promise<void>;

    readonly nowPlayingItem: MediaItem | undefined;
    readonly currentPlaybackTime: number;
    readonly currentPlaybackDuration: number;
    readonly queue: Queue;

    addEventListener<K extends keyof Events>(
      name: K,
      callback: (event: Events[K]) => void
    ): void;
    removeEventListener<K extends keyof Events>(
      name: K,
      callback: (event: Events[K]) => void
    ): void;
  }

  interface SetQueueOptions {
    song?: string;
    songs?: string[];
    album?: string;
    playlist?: string;
    url?: string;
  }

  interface MediaItem {
    id: string;
    type: string;
    attributes: {
      name: string;
      artistName: string;
      albumName: string;
      artwork?: {
        url: string;
        width: number;
        height: number;
      };
      durationInMillis: number;
    };
  }

  interface Queue {
    readonly items: MediaItem[];
    readonly position: number;
    readonly length: number;
  }

  interface Events {
    authorizationStatusDidChange: { authorizationStatus: AuthorizationStatus };
    playbackStateDidChange: { state: PlaybackStates };
    nowPlayingItemDidChange: { item: MediaItem | undefined };
    playbackTimeDidChange: { currentPlaybackTime: number };
    queueItemsDidChange: { items: MediaItem[] };
  }

  enum AuthorizationStatus {
    AUTHORIZED = 2,
    DENIED = 1,
    NOT_DETERMINED = 0,
    RESTRICTED = 3,
  }

  enum PlaybackStates {
    none = 0,
    loading = 1,
    playing = 2,
    paused = 3,
    stopped = 4,
    ended = 5,
    seeking = 6,
    waiting = 7,
    stalled = 8,
    completed = 9,
  }

  function configure(options: ConfigureOptions): Promise<MusicKitInstance>;
  function getInstance(): MusicKitInstance | undefined;

  interface API {
    music(path: string, options?: RequestInit): Promise<Response>;
  }
}

interface Window {
  MusicKit: typeof MusicKit;
}
