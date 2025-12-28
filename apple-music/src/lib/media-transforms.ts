import type {
  Artwork,
  Album,
  Playlist,
  Song,
  LibraryAlbum,
  LibraryPlaylist,
  LibrarySong,
} from "@/schemas";

export interface MediaDetailData {
  id: string;
  name: string;
  artwork?: Artwork;
  subtitle?: string;
  description?: string;
  trackCount?: number;
  releaseYear?: number;
  genre?: string;
  canEdit?: boolean;
}

export interface TrackData {
  id: string;
  name: string;
  artistName: string;
  durationInMillis: number;
  artwork?: Artwork;
  trackNumber?: number;
}

export function transformLibraryAlbum(album: LibraryAlbum): MediaDetailData {
  const releaseYear = album.attributes.releaseDate
    ? new Date(album.attributes.releaseDate).getFullYear()
    : undefined;

  return {
    id: album.id,
    name: album.attributes.name,
    artwork: album.attributes.artwork,
    subtitle: album.attributes.artistName,
    trackCount: album.attributes.trackCount,
    releaseYear,
    genre: album.attributes.genreNames?.[0],
  };
}

export function transformCatalogAlbum(album: Album): MediaDetailData {
  const releaseYear = album.attributes.releaseDate
    ? new Date(album.attributes.releaseDate).getFullYear()
    : undefined;

  return {
    id: album.id,
    name: album.attributes.name,
    artwork: album.attributes.artwork,
    subtitle: album.attributes.artistName,
    trackCount: album.attributes.trackCount,
    releaseYear,
    genre: album.attributes.genreNames?.[0],
  };
}

export function transformLibraryPlaylist(
  playlist: LibraryPlaylist
): MediaDetailData {
  return {
    id: playlist.id,
    name: playlist.attributes.name ?? "Untitled Playlist",
    artwork: playlist.attributes.artwork,
    description: playlist.attributes.description?.standard,
    canEdit: playlist.attributes.canEdit,
  };
}

export function transformCatalogPlaylist(playlist: Playlist): MediaDetailData {
  return {
    id: playlist.id,
    name: playlist.attributes.name,
    artwork: playlist.attributes.artwork,
    subtitle: playlist.attributes.curatorName,
    description: playlist.attributes.description?.standard,
    trackCount: playlist.attributes.trackCount,
  };
}

export function transformLibrarySongs(songs: LibrarySong[]): TrackData[] {
  return songs.map((song) => ({
    id: song.id,
    name: song.attributes.name,
    artistName: song.attributes.artistName,
    durationInMillis: song.attributes.durationInMillis,
    artwork: song.attributes.artwork,
    trackNumber: song.attributes.trackNumber,
  }));
}

export function transformCatalogSongs(songs: Song[]): TrackData[] {
  return songs.map((song) => ({
    id: song.id,
    name: song.attributes.name,
    artistName: song.attributes.artistName,
    durationInMillis: song.attributes.durationInMillis,
    artwork: song.attributes.artwork,
    trackNumber: song.attributes.trackNumber,
  }));
}
