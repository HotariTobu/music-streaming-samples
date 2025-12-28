import { z } from "zod";
import { ArtworkSchema, PlayParamsSchema, EditorialNotesSchema } from "../primitives";

export const LibrarySongSchema = z.object({
  id: z.string(),
  type: z.literal("library-songs"),
  attributes: z.object({
    name: z.string(),
    artistName: z.string(),
    albumName: z.string(),
    durationInMillis: z.number(),
    artwork: ArtworkSchema.optional(),
    trackNumber: z.number().optional(),
    playParams: PlayParamsSchema.optional(),
  }),
});

export const LibraryAlbumSchema = z.object({
  id: z.string(),
  type: z.literal("library-albums"),
  attributes: z.object({
    name: z.string(),
    artistName: z.string(),
    trackCount: z.number(),
    artwork: ArtworkSchema.optional(),
    playParams: PlayParamsSchema.optional(),
    releaseDate: z.string().optional(),
    genreNames: z.array(z.string()).optional(),
  }),
});

export const LibraryPlaylistSchema = z.object({
  id: z.string(),
  type: z.literal("library-playlists"),
  attributes: z.object({
    name: z.string().optional(),
    description: EditorialNotesSchema.optional(),
    artwork: ArtworkSchema.optional(),
    canEdit: z.boolean(),
    dateAdded: z.string().optional(),
    playParams: PlayParamsSchema.optional(),
    hasCatalog: z.boolean().optional(),
    isPublic: z.boolean().optional(),
  }),
});

export const LibraryArtistSchema = z.object({
  id: z.string(),
  type: z.literal("library-artists"),
  attributes: z.object({
    name: z.string(),
  }),
});

export const LibraryMusicVideoSchema = z.object({
  id: z.string(),
  type: z.literal("library-music-videos"),
  attributes: z.object({
    name: z.string(),
    artistName: z.string(),
    durationInMillis: z.number(),
    artwork: ArtworkSchema.optional(),
    playParams: PlayParamsSchema.optional(),
  }),
});

export type LibrarySong = z.infer<typeof LibrarySongSchema>;
export type LibraryAlbum = z.infer<typeof LibraryAlbumSchema>;
export type LibraryPlaylist = z.infer<typeof LibraryPlaylistSchema>;
export type LibraryArtist = z.infer<typeof LibraryArtistSchema>;
export type LibraryMusicVideo = z.infer<typeof LibraryMusicVideoSchema>;
