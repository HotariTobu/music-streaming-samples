import { z } from "zod";
import {
  ExternalUrlsSchema,
  ExternalIdsSchema,
  RestrictionsSchema,
} from "../primitives";
import { ArtistSimplifiedSchema } from "./artist";
import { AlbumSimplifiedSchema } from "./album";

// Simplified track (used in albums)
export const TrackSimplifiedSchema = z.object({
  artists: z.array(ArtistSimplifiedSchema),
  available_markets: z.array(z.string()).optional(),
  disc_number: z.number(),
  duration_ms: z.number(),
  explicit: z.boolean(),
  external_urls: ExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  is_playable: z.boolean().optional(),
  linked_from: z.any().optional(),
  restrictions: RestrictionsSchema.optional(),
  name: z.string(),
  preview_url: z.string().nullable().optional(),
  track_number: z.number(),
  type: z.literal("track"),
  uri: z.string(),
  is_local: z.boolean().optional(),
});

export type SpotifyTrackSimplified = z.infer<typeof TrackSimplifiedSchema>;

// Full track object
export const TrackSchema = TrackSimplifiedSchema.extend({
  album: AlbumSimplifiedSchema,
  external_ids: ExternalIdsSchema.optional(),
  popularity: z.number().optional(),
});

export type SpotifyTrack = z.infer<typeof TrackSchema>;

// Saved track (from user's library)
export const SavedTrackSchema = z.object({
  added_at: z.string(),
  track: TrackSchema,
});

export type SpotifySavedTrack = z.infer<typeof SavedTrackSchema>;
