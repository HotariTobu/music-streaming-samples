import { z, type ZodTypeAny } from "zod";
import {
  SongSchema,
  AlbumSchema,
  ArtistSchema,
  PlaylistSchema,
  type Song,
  type Album,
  type Artist,
  type Playlist,
} from "../resources/catalog";
import {
  LibrarySongSchema,
  LibraryAlbumSchema,
  LibraryPlaylistSchema,
  LibraryArtistSchema,
  type LibrarySong,
  type LibraryAlbum,
  type LibraryPlaylist,
  type LibraryArtist,
} from "../resources/library";

/**
 * Factory function to create LibraryResults schema
 */
export function createLibraryResultsSchema<T extends ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    next: z.string().optional(),
  });
}

/**
 * Factory function to create CatalogResults schema
 */
export function createCatalogResultsSchema<T extends ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    next: z.string().optional(),
  });
}

// Pre-built Library Results schemas
export const LibrarySongResultsSchema = createLibraryResultsSchema(LibrarySongSchema);
export const LibraryAlbumResultsSchema = createLibraryResultsSchema(LibraryAlbumSchema);
export const LibraryPlaylistResultsSchema = createLibraryResultsSchema(LibraryPlaylistSchema);
export const LibraryArtistResultsSchema = createLibraryResultsSchema(LibraryArtistSchema);

// Pre-built Catalog Results schemas
export const CatalogSongResultsSchema = createCatalogResultsSchema(SongSchema);
export const CatalogAlbumResultsSchema = createCatalogResultsSchema(AlbumSchema);
export const CatalogArtistResultsSchema = createCatalogResultsSchema(ArtistSchema);
export const CatalogPlaylistResultsSchema = createCatalogResultsSchema(PlaylistSchema);

// Types
export type LibrarySongResults = z.infer<typeof LibrarySongResultsSchema>;
export type LibraryAlbumResults = z.infer<typeof LibraryAlbumResultsSchema>;
export type LibraryPlaylistResults = z.infer<typeof LibraryPlaylistResultsSchema>;
export type LibraryArtistResults = z.infer<typeof LibraryArtistResultsSchema>;
export type CatalogSongResults = z.infer<typeof CatalogSongResultsSchema>;
export type CatalogAlbumResults = z.infer<typeof CatalogAlbumResultsSchema>;
export type CatalogArtistResults = z.infer<typeof CatalogArtistResultsSchema>;
export type CatalogPlaylistResults = z.infer<typeof CatalogPlaylistResultsSchema>;

// Generic type helpers for backward compatibility
export type LibraryResults<T> = {
  data: T[];
  next?: string;
};

export type CatalogResults<T> = {
  data: T[];
  next?: string;
};
