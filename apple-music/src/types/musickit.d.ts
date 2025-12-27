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
    readonly volume: number;

    authorize(): Promise<string>;
    unauthorize(): Promise<void>;

    // Queue and Playback
    setQueue(options: SetQueueOptions): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    skipToNextItem(): Promise<void>;
    skipToPreviousItem(): Promise<void>;
    seekToTime(time: number): Promise<void>;
    changeToMediaAtIndex(index: number): Promise<void>;
    setVolume(volume: number): Promise<void>;

    readonly nowPlayingItem: MediaItem | undefined;
    readonly currentPlaybackTime: number;
    readonly currentPlaybackDuration: number;
    readonly queue: Queue;

    // API for catalog/library access
    readonly api: MusicKitAPI;

    addEventListener<K extends keyof Events>(
      name: K,
      callback: (event: Events[K]) => void
    ): void;
    removeEventListener<K extends keyof Events>(
      name: K,
      callback: (event: Events[K]) => void
    ): void;
  }

  interface MusicKitAPI {
    music<T = unknown>(
      path: string,
      queryParameters?: Record<string, string | number | string[]>,
      options?: { fetchOptions?: RequestInit }
    ): Promise<MusicKitAPIResponse<T>>;
  }

  interface MusicKitAPIResponse<T> {
    data: T;
  }

  interface SetQueueOptions {
    song?: string;
    songs?: string[];
    album?: string;
    playlist?: string;
    url?: string;
    startPosition?: number;
  }

  interface MediaItem {
    id: string;
    type: string;
    attributes: {
      name: string;
      artistName: string;
      albumName: string;
      artwork?: Artwork;
      durationInMillis: number;
      playParams?: {
        id: string;
        kind: string;
      };
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
    playbackDurationDidChange: { duration: number };
    queueItemsDidChange: { items: MediaItem[] };
    queuePositionDidChange: { position: number };
    playbackVolumeDidChange: { volume: number };
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
    waiting = 8,
    stalled = 9,
    completed = 10,
  }

  function configure(options: ConfigureOptions): Promise<MusicKitInstance>;
  function getInstance(): MusicKitInstance | undefined;

  // ===== API Response Types =====

  // Search
  interface SearchResults {
    results: {
      songs?: { data: Song[]; next?: string };
      albums?: { data: Album[]; next?: string };
      artists?: { data: Artist[]; next?: string };
      playlists?: { data: Playlist[]; next?: string };
    };
  }

  // Charts
  interface ChartsResults {
    results: {
      songs?: ChartData<Song>[];
      albums?: ChartData<Album>[];
      playlists?: ChartData<Playlist>[];
    };
  }

  interface ChartData<T> {
    chart: string;
    name: string;
    data: T[];
    next?: string;
  }

  // Genres
  interface GenresResults {
    data: Genre[];
  }

  // Library
  interface LibraryResults<T> {
    data: T[];
    next?: string;
  }

  // Recommendations
  interface RecommendationsResults {
    data: Recommendation[];
  }

  interface Recommendation {
    id: string;
    type: "personal-recommendation";
    attributes: {
      title: { stringForDisplay: string };
      reason?: { stringForDisplay: string };
    };
    relationships?: {
      contents?: { data: (Album | Playlist | Station)[] };
    };
  }

  // Recently Played
  interface RecentlyPlayedResults {
    data: (Album | Playlist | Station)[];
    next?: string;
  }

  // ===== Resource Types =====

  interface Song {
    id: string;
    type: "songs";
    attributes: {
      name: string;
      artistName: string;
      albumName: string;
      durationInMillis: number;
      artwork?: Artwork;
      previews?: { url: string }[];
      trackNumber?: number;
      discNumber?: number;
      releaseDate?: string;
      genreNames?: string[];
      isrc?: string;
      playParams?: { id: string; kind: string };
    };
  }

  interface Album {
    id: string;
    type: "albums";
    attributes: {
      name: string;
      artistName: string;
      trackCount: number;
      artwork?: Artwork;
      releaseDate?: string;
      genreNames?: string[];
      recordLabel?: string;
      copyright?: string;
      editorialNotes?: { short?: string; standard?: string };
      playParams?: { id: string; kind: string };
    };
    relationships?: {
      tracks?: { data: Song[] };
    };
  }

  interface Artist {
    id: string;
    type: "artists";
    attributes: {
      name: string;
      artwork?: Artwork;
      genreNames?: string[];
      url?: string;
      editorialNotes?: { short?: string; standard?: string };
    };
    relationships?: {
      albums?: { data: Album[] };
    };
  }

  interface Playlist {
    id: string;
    type: "playlists";
    attributes: {
      name: string;
      curatorName?: string;
      description?: { short?: string; standard?: string };
      artwork?: Artwork;
      playParams?: { id: string; kind: string };
      lastModifiedDate?: string;
      trackCount?: number;
    };
    relationships?: {
      tracks?: { data: Song[] };
    };
  }

  interface Station {
    id: string;
    type: "stations";
    attributes: {
      name: string;
      artwork?: Artwork;
      isLive?: boolean;
    };
  }

  interface Genre {
    id: string;
    type: "genres";
    attributes: {
      name: string;
      parentId?: string;
      parentName?: string;
    };
  }

  // Library-specific types (may have different structure)
  interface LibrarySong {
    id: string;
    type: "library-songs";
    attributes: {
      name: string;
      artistName: string;
      albumName: string;
      durationInMillis: number;
      artwork?: Artwork;
      trackNumber?: number;
      playParams?: { id: string; kind: string; isLibrary: boolean };
    };
  }

  interface LibraryAlbum {
    id: string;
    type: "library-albums";
    attributes: {
      name: string;
      artistName: string;
      trackCount: number;
      artwork?: Artwork;
      playParams?: { id: string; kind: string; isLibrary: boolean };
    };
  }

  interface LibraryPlaylist {
    id: string;
    type: "library-playlists";
    attributes: {
      name: string;
      description?: { standard?: string };
      artwork?: Artwork;
      canEdit: boolean;
      dateAdded?: string;
      playParams?: { id: string; kind: string; isLibrary: boolean };
    };
  }

  interface LibraryArtist {
    id: string;
    type: "library-artists";
    attributes: {
      name: string;
    };
  }

  interface Artwork {
    url: string;
    width: number;
    height: number;
    bgColor?: string;
    textColor1?: string;
    textColor2?: string;
    textColor3?: string;
    textColor4?: string;
  }
}

interface Window {
  MusicKit: typeof MusicKit;
}
