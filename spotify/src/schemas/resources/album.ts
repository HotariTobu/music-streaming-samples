import { z } from "zod";
import {
  ImageSchema,
  ExternalUrlsSchema,
  ExternalIdsSchema,
  CopyrightSchema,
  RestrictionsSchema,
} from "../primitives";
import { ArtistSimplifiedSchema } from "./artist";

// Simplified album (used in tracks)
export const AlbumSimplifiedSchema = z.object({
  album_type: z.enum(["album", "single", "compilation"]),
  total_tracks: z.number(),
  available_markets: z.array(z.string()).optional(),
  external_urls: ExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  images: z.array(ImageSchema),
  name: z.string(),
  release_date: z.string(),
  release_date_precision: z.enum(["year", "month", "day"]),
  restrictions: RestrictionsSchema.optional(),
  type: z.literal("album"),
  uri: z.string(),
  artists: z.array(ArtistSimplifiedSchema),
});

export type SpotifyAlbumSimplified = z.infer<typeof AlbumSimplifiedSchema>;

// Full album object
export const AlbumSchema = AlbumSimplifiedSchema.extend({
  copyrights: z.array(CopyrightSchema).optional(),
  external_ids: ExternalIdsSchema.optional(),
  genres: z.array(z.string()).optional(),
  label: z.string().optional(),
  popularity: z.number().optional(),
  tracks: z.object({
    href: z.string(),
    items: z.array(z.any()), // TrackSimplified - circular reference handled separately
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  }).optional(),
});

export type SpotifyAlbum = z.infer<typeof AlbumSchema>;
