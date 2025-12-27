/**
 * MusicKit JS v3 Type Definitions
 * Based on official documentation: https://js-cdn.music.apple.com/musickit/v3/docs/
 */

declare namespace MusicKit {
  // ===== Configuration =====

  interface ConfigureOptions {
    developerToken: string;
    app: {
      name: string;
      build: string;
    };
    storefrontId?: string;
  }

  // ===== MusicKit Instance =====

  interface MusicKitInstance {
    // Properties (read-only)
    readonly api: MusicKitAPI;
    readonly currentPlaybackDuration: number;
    readonly currentPlaybackProgress: number;
    readonly currentPlaybackTime: number;
    readonly currentPlaybackTimeRemaining: number;
    readonly isAuthorized: boolean;
    readonly isPlaying: boolean;
    readonly nowPlayingItem: MediaItem | undefined;
    readonly nowPlayingItemIndex: number;
    readonly playbackState: PlaybackStates;
    readonly queue: Queue;
    readonly queueIsEmpty: boolean;
    readonly storefrontCountryCode: string;
    readonly storefrontId: string;
    readonly seekSeconds: SeekSeconds | undefined;
    readonly videoContainerElement: HTMLVideoElement | undefined;

    // Properties (read-write)
    bitrate: PlaybackBitrate;
    playbackRate: number;
    previewOnly: boolean;
    repeatMode: PlayerRepeatMode;
    shuffleMode: PlayerShuffleMode;
    volume: number;

    // Methods - Authorization
    authorize(): Promise<string | void>;
    unauthorize(): Promise<void>;

    // Methods - Playback
    play(): Promise<void>;
    pause(): void;
    stop(): Promise<void>;
    skipToNextItem(): Promise<void>;
    skipToPreviousItem(): Promise<void>;
    seekToTime(time: number): Promise<void>;
    seekBackward(): Promise<void>;
    seekForward(): Promise<void>;
    mute(): void;
    unmute(): void;

    // Methods - Queue
    setQueue(options: QueueOptions): Promise<Queue | void>;
    clearQueue(): Promise<Queue>;
    playAt(position: number, options: QueueOptions): Promise<Queue | void>;
    playLater(options: QueueOptions): Promise<Queue | void>;
    playNext(options: QueueOptions, clear?: boolean): Promise<Queue | void>;
    changeToMediaAtIndex(index: number): Promise<void>;
    changeToMediaItem(descriptor: MediaItem | string): Promise<void>;

    // Methods - Storefront
    changeUserStorefront(storefrontId: string): Promise<void>;

    // Methods - Fullscreen
    requestFullscreen(element: HTMLElement): Promise<void>;
    exitFullscreen(): Promise<void>;

    // Methods - Events
    addEventListener<K extends keyof MusicKitEvents>(
      name: K,
      callback: (event: MusicKitEvents[K]) => void,
      options?: { once?: boolean }
    ): void;
    removeEventListener<K extends keyof MusicKitEvents>(
      name: K,
      callback: (event: MusicKitEvents[K]) => void
    ): void;
  }

  // ===== MusicKit API =====

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

  // ===== Queue =====

  interface Queue {
    readonly currentItem: MediaItem | undefined;
    readonly isEmpty: boolean;
    readonly items: MediaItem[];
    readonly length: number;
    readonly nextPlayableItem: MediaItem | undefined;
    readonly position: number;
    readonly previousPlayableItem: MediaItem | undefined;
  }

  interface QueueOptions {
    // Content options (singular)
    album?: string;
    musicVideo?: string;
    playlist?: string;
    song?: string;
    station?: string;
    url?: string;

    // Content options (plural)
    albums?: string[];
    musicVideos?: string[];
    playlists?: string[];
    songs?: string[];

    // Playback options
    repeatMode?: PlayerRepeatMode;
    startPlaying?: boolean;
    startTime?: number;
  }

  interface SeekSeconds {
    BACK: number;
    FORWARD: number;
  }

  // ===== Media Item =====

  interface MediaItem {
    id: string;
    type: string;
    attributes: MediaItemAttributes;
  }

  interface MediaItemAttributes {
    name: string;
    artistName: string;
    albumName: string;
    artwork?: Artwork;
    durationInMillis: number;
    playParams?: PlayParams;
    [key: string]: unknown;
  }

  interface PlayParams {
    id: string;
    kind: string;
    isLibrary?: boolean;
  }

  // ===== Artwork =====

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

  // ===== Events =====

  interface MusicKitEvents {
    // Authorization
    authorizationStatusDidChange: AuthorizationStatusEvent;
    authorizationStatusWillChange: AuthorizationStatusEvent;

    // Playback State
    playbackStateWillChange: PlaybackStateEvent;
    playbackStateDidChange: PlaybackStateEvent;

    // Now Playing
    nowPlayingItemWillChange: NowPlayingItemEvent;
    nowPlayingItemDidChange: NowPlayingItemEvent;

    // Playback Time
    playbackTimeDidChange: PlaybackTimeEvent;
    playbackDurationDidChange: PlaybackDurationEvent;
    playbackProgressDidChange: PlaybackProgressEvent;

    // Volume
    playbackVolumeDidChange: VolumeEvent;

    // Queue
    queueIsReady: void;
    queueItemsDidChange: QueueItemsEvent;
    queuePositionDidChange: QueuePositionEvent;

    // Shuffle/Repeat
    shuffleModeDidChange: ShuffleModeEvent;
    repeatModeDidChange: RepeatModeEvent;

    // Other
    configured: void;
    loaded: void;
    mediaCanPlay: void;
    mediaPlaybackError: MediaPlaybackErrorEvent;
    storefrontCountryCodeDidChange: StorefrontEvent;
    storefrontIdentifierDidChange: StorefrontEvent;
    playbackBitrateDidChange: BitrateEvent;
    playbackRateDidChange: PlaybackRateEvent;
    capabilitiesChanged: void;
    primaryPlayerDidChange: void;
    playerTypeDidChange: void;
    drmUnsupported: void;
    eligibleForSubscribeView: void;
    bufferedProgressDidChange: BufferedProgressEvent;
    mediaElementCreated: MediaElementEvent;
    mediaItemStateDidChange: MediaItemStateEvent;
    mediaItemStateWillChange: MediaItemStateEvent;
    metadataDidChange: void;
    playbackTargetAvailableDidChange: void;
    timedMetadataDidChange: void;
    mediaUpNext: void;
    mediaSkipAvailable: void;

    // Audio/Text tracks
    audioTrackAdded: void;
    audioTrackChanged: void;
    audioTrackRemoved: void;
    textTrackAdded: void;
    textTrackChanged: void;
    textTrackRemoved: void;
    forcedTextTrackChanged: void;
  }

  interface AuthorizationStatusEvent {
    authorizationStatus: number;
  }

  interface PlaybackStateEvent {
    oldState: PlaybackStates;
    state: PlaybackStates;
    nowPlayingItem?: MediaItem;
  }

  interface NowPlayingItemEvent {
    item: MediaItem | undefined;
  }

  interface PlaybackTimeEvent {
    currentPlaybackTime: number;
  }

  interface PlaybackDurationEvent {
    duration: number;
  }

  interface PlaybackProgressEvent {
    progress: number;
  }

  interface VolumeEvent {
    volume: number;
  }

  interface QueueItemsEvent {
    items: MediaItem[];
  }

  interface QueuePositionEvent {
    position: number;
  }

  interface ShuffleModeEvent {
    shuffleMode: PlayerShuffleMode;
  }

  interface RepeatModeEvent {
    repeatMode: PlayerRepeatMode;
  }

  interface MediaPlaybackErrorEvent {
    error: MKError;
  }

  interface StorefrontEvent {
    storefrontId: string;
  }

  interface BitrateEvent {
    bitrate: PlaybackBitrate;
  }

  interface PlaybackRateEvent {
    playbackRate: number;
  }

  interface BufferedProgressEvent {
    progress: number;
  }

  interface MediaElementEvent {
    element: HTMLMediaElement;
  }

  interface MediaItemStateEvent {
    state: number;
    item: MediaItem;
  }

  // ===== Enums =====

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

  enum PlayerRepeatMode {
    none = 0,
    one = 1,
    all = 2,
  }

  enum PlayerShuffleMode {
    off = 0,
    songs = 1,
  }

  enum PlaybackBitrate {
    STANDARD = 64,
    HIGH = 256,
  }

  // ===== Error =====

  interface MKError {
    errorCode: string;
    description: string;
    reason?: string;
  }

  // ===== Static Methods =====

  function configure(options: ConfigureOptions): Promise<MusicKitInstance>;
  function getInstance(): MusicKitInstance;

  // ===== API Response Types =====

  // Search
  interface SearchResults {
    results: {
      songs?: { data: Song[]; next?: string };
      albums?: { data: Album[]; next?: string };
      artists?: { data: Artist[]; next?: string };
      playlists?: { data: Playlist[]; next?: string };
      "music-videos"?: { data: MusicVideo[]; next?: string };
    };
  }

  // Charts
  interface ChartsResults {
    results: {
      songs?: ChartData<Song>[];
      albums?: ChartData<Album>[];
      playlists?: ChartData<Playlist>[];
      "music-videos"?: ChartData<MusicVideo>[];
    };
  }

  interface ChartData<T> {
    chart: string;
    name: string;
    data: T[];
    next?: string;
  }

  // Search Hints
  interface SearchHintsResults {
    results: {
      terms: string[];
    };
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
    attributes: SongAttributes;
    relationships?: SongRelationships;
  }

  interface SongAttributes {
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
    composerName?: string;
    contentRating?: string;
    playParams?: PlayParams;
    url?: string;
  }

  interface SongRelationships {
    albums?: { data: Album[] };
    artists?: { data: Artist[] };
  }

  interface Album {
    id: string;
    type: "albums";
    attributes: AlbumAttributes;
    relationships?: AlbumRelationships;
  }

  interface AlbumAttributes {
    name: string;
    artistName: string;
    trackCount: number;
    artwork?: Artwork;
    releaseDate?: string;
    genreNames?: string[];
    recordLabel?: string;
    copyright?: string;
    contentRating?: string;
    editorialNotes?: EditorialNotes;
    playParams?: PlayParams;
    url?: string;
    isSingle?: boolean;
    isComplete?: boolean;
  }

  interface AlbumRelationships {
    tracks?: { data: Song[] };
    artists?: { data: Artist[] };
  }

  interface Artist {
    id: string;
    type: "artists";
    attributes: ArtistAttributes;
    relationships?: ArtistRelationships;
  }

  interface ArtistAttributes {
    name: string;
    artwork?: Artwork;
    genreNames?: string[];
    url?: string;
    editorialNotes?: EditorialNotes;
  }

  interface ArtistRelationships {
    albums?: { data: Album[] };
  }

  interface Playlist {
    id: string;
    type: "playlists";
    attributes: PlaylistAttributes;
    relationships?: PlaylistRelationships;
  }

  interface PlaylistAttributes {
    name: string;
    curatorName?: string;
    description?: EditorialNotes;
    artwork?: Artwork;
    playParams?: PlayParams;
    lastModifiedDate?: string;
    trackCount?: number;
    url?: string;
  }

  interface PlaylistRelationships {
    tracks?: { data: Song[] };
    curator?: { data: Curator[] };
  }

  interface Curator {
    id: string;
    type: "curators" | "apple-curators";
    attributes: {
      name: string;
      artwork?: Artwork;
      editorialNotes?: EditorialNotes;
      url?: string;
    };
  }

  interface MusicVideo {
    id: string;
    type: "music-videos";
    attributes: {
      name: string;
      artistName: string;
      albumName?: string;
      durationInMillis: number;
      artwork?: Artwork;
      releaseDate?: string;
      genreNames?: string[];
      playParams?: PlayParams;
      url?: string;
      previews?: { url: string }[];
    };
  }

  interface Station {
    id: string;
    type: "stations";
    attributes: {
      name: string;
      artwork?: Artwork;
      isLive?: boolean;
      url?: string;
      playParams?: PlayParams;
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

  interface Storefront {
    id: string;
    type: "storefronts";
    attributes: {
      name: string;
      defaultLanguageTag: string;
      supportedLanguageTags: string[];
    };
  }

  interface EditorialNotes {
    short?: string;
    standard?: string;
  }

  // ===== Library Resource Types =====

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
      playParams?: PlayParams;
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
      playParams?: PlayParams;
    };
  }

  interface LibraryPlaylist {
    id: string;
    type: "library-playlists";
    attributes: {
      name: string;
      description?: EditorialNotes;
      artwork?: Artwork;
      canEdit: boolean;
      dateAdded?: string;
      playParams?: PlayParams;
      hasCatalog?: boolean;
    };
  }

  interface LibraryArtist {
    id: string;
    type: "library-artists";
    attributes: {
      name: string;
    };
  }

  interface LibraryMusicVideo {
    id: string;
    type: "library-music-videos";
    attributes: {
      name: string;
      artistName: string;
      durationInMillis: number;
      artwork?: Artwork;
      playParams?: PlayParams;
    };
  }
}

interface Window {
  MusicKit: typeof MusicKit;
}
