import { z } from "zod";
import { ArtworkSchema, PlayParamsSchema, EditorialNotesSchema } from "../primitives";

// ===== Attributes Schemas =====

export const SongAttributesSchema = z.object({
  name: z.string(),
  artistName: z.string(),
  albumName: z.string(),
  durationInMillis: z.number(),
  artwork: ArtworkSchema.optional(),
  previews: z.array(z.object({ url: z.string() })).optional(),
  trackNumber: z.number().optional(),
  discNumber: z.number().optional(),
  releaseDate: z.string().optional(),
  genreNames: z.array(z.string()).optional(),
  isrc: z.string().optional(),
  composerName: z.string().optional(),
  contentRating: z.string().optional(),
  playParams: PlayParamsSchema.optional(),
  url: z.string().optional(),
});

export const AlbumAttributesSchema = z.object({
  name: z.string(),
  artistName: z.string(),
  trackCount: z.number(),
  artwork: ArtworkSchema.optional(),
  releaseDate: z.string().optional(),
  genreNames: z.array(z.string()).optional(),
  recordLabel: z.string().optional(),
  copyright: z.string().optional(),
  contentRating: z.string().optional(),
  editorialNotes: EditorialNotesSchema.optional(),
  playParams: PlayParamsSchema.optional(),
  url: z.string().optional(),
  isSingle: z.boolean().optional(),
  isComplete: z.boolean().optional(),
});

export const ArtistAttributesSchema = z.object({
  name: z.string(),
  artwork: ArtworkSchema.optional(),
  genreNames: z.array(z.string()).optional(),
  url: z.string().optional(),
  editorialNotes: EditorialNotesSchema.optional(),
});

export const PlaylistAttributesSchema = z.object({
  name: z.string(),
  curatorName: z.string().optional(),
  description: EditorialNotesSchema.optional(),
  artwork: ArtworkSchema.optional(),
  playParams: PlayParamsSchema.optional(),
  lastModifiedDate: z.string().optional(),
  trackCount: z.number().optional(),
  url: z.string().optional(),
});

export const CuratorAttributesSchema = z.object({
  name: z.string(),
  artwork: ArtworkSchema.optional(),
  editorialNotes: EditorialNotesSchema.optional(),
  url: z.string().optional(),
});

export const MusicVideoAttributesSchema = z.object({
  name: z.string(),
  artistName: z.string(),
  albumName: z.string().optional(),
  durationInMillis: z.number(),
  artwork: ArtworkSchema.optional(),
  releaseDate: z.string().optional(),
  genreNames: z.array(z.string()).optional(),
  playParams: PlayParamsSchema.optional(),
  url: z.string().optional(),
  previews: z.array(z.object({ url: z.string() })).optional(),
});

export const StationAttributesSchema = z.object({
  name: z.string(),
  artwork: ArtworkSchema.optional(),
  isLive: z.boolean().optional(),
  url: z.string().optional(),
  playParams: PlayParamsSchema.optional(),
});

export const GenreAttributesSchema = z.object({
  name: z.string(),
  parentId: z.string().optional(),
  parentName: z.string().optional(),
});

export const StorefrontAttributesSchema = z.object({
  name: z.string(),
  defaultLanguageTag: z.string(),
  supportedLanguageTags: z.array(z.string()),
});

// ===== Base Resource Schemas (without relationships) =====

const BaseSongSchema = z.object({
  id: z.string(),
  type: z.literal("songs"),
  attributes: SongAttributesSchema,
});

const BaseAlbumSchema = z.object({
  id: z.string(),
  type: z.literal("albums"),
  attributes: AlbumAttributesSchema,
});

const BaseArtistSchema = z.object({
  id: z.string(),
  type: z.literal("artists"),
  attributes: ArtistAttributesSchema,
});

const BasePlaylistSchema = z.object({
  id: z.string(),
  type: z.literal("playlists"),
  attributes: PlaylistAttributesSchema,
});

export const CuratorSchema = z.object({
  id: z.string(),
  type: z.enum(["curators", "apple-curators"]),
  attributes: CuratorAttributesSchema,
});

export const MusicVideoSchema = z.object({
  id: z.string(),
  type: z.literal("music-videos"),
  attributes: MusicVideoAttributesSchema,
});

export const StationSchema = z.object({
  id: z.string(),
  type: z.literal("stations"),
  attributes: StationAttributesSchema,
});

export const GenreSchema = z.object({
  id: z.string(),
  type: z.literal("genres"),
  attributes: GenreAttributesSchema,
});

export const StorefrontSchema = z.object({
  id: z.string(),
  type: z.literal("storefronts"),
  attributes: StorefrontAttributesSchema,
});

// ===== Full Resource Schemas (with relationships using z.lazy) =====

export const SongSchema: z.ZodType<Song> = BaseSongSchema.extend({
  relationships: z
    .object({
      albums: z.object({ data: z.lazy(() => z.array(AlbumSchema)) }).optional(),
      artists: z.object({ data: z.lazy(() => z.array(ArtistSchema)) }).optional(),
    })
    .optional(),
});

export const AlbumSchema: z.ZodType<Album> = BaseAlbumSchema.extend({
  relationships: z
    .object({
      tracks: z.object({ data: z.lazy(() => z.array(SongSchema)) }).optional(),
      artists: z.object({ data: z.lazy(() => z.array(ArtistSchema)) }).optional(),
    })
    .optional(),
});

export const ArtistSchema: z.ZodType<Artist> = BaseArtistSchema.extend({
  relationships: z
    .object({
      albums: z.object({ data: z.lazy(() => z.array(AlbumSchema)) }).optional(),
    })
    .optional(),
});

export const PlaylistSchema: z.ZodType<Playlist> = BasePlaylistSchema.extend({
  relationships: z
    .object({
      tracks: z.object({ data: z.lazy(() => z.array(SongSchema)) }).optional(),
      curator: z.object({ data: z.array(CuratorSchema) }).optional(),
    })
    .optional(),
});

// ===== Derived Types =====

export type SongAttributes = z.infer<typeof SongAttributesSchema>;
export type AlbumAttributes = z.infer<typeof AlbumAttributesSchema>;
export type ArtistAttributes = z.infer<typeof ArtistAttributesSchema>;
export type PlaylistAttributes = z.infer<typeof PlaylistAttributesSchema>;
export type Curator = z.infer<typeof CuratorSchema>;
export type MusicVideo = z.infer<typeof MusicVideoSchema>;
export type Station = z.infer<typeof StationSchema>;
export type Genre = z.infer<typeof GenreSchema>;
export type Storefront = z.infer<typeof StorefrontSchema>;

// Explicit types for circular references
export type Song = {
  id: string;
  type: "songs";
  attributes: SongAttributes;
  relationships?: {
    albums?: { data: Album[] };
    artists?: { data: Artist[] };
  };
};

export type Album = {
  id: string;
  type: "albums";
  attributes: AlbumAttributes;
  relationships?: {
    tracks?: { data: Song[] };
    artists?: { data: Artist[] };
  };
};

export type Artist = {
  id: string;
  type: "artists";
  attributes: ArtistAttributes;
  relationships?: {
    albums?: { data: Album[] };
  };
};

export type Playlist = {
  id: string;
  type: "playlists";
  attributes: PlaylistAttributes;
  relationships?: {
    tracks?: { data: Song[] };
    curator?: { data: Curator[] };
  };
};
