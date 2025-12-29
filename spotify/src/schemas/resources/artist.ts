import { z } from "zod";
import { ImageSchema, ExternalUrlsSchema, FollowersSchema } from "../primitives";

// Simplified artist (used in tracks, albums)
export const ArtistSimplifiedSchema = z.object({
  external_urls: ExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  name: z.string(),
  type: z.literal("artist"),
  uri: z.string(),
});

export type SpotifyArtistSimplified = z.infer<typeof ArtistSimplifiedSchema>;

// Full artist object
export const ArtistSchema = ArtistSimplifiedSchema.extend({
  followers: FollowersSchema.optional(),
  genres: z.array(z.string()).optional(),
  images: z.array(ImageSchema).optional(),
  popularity: z.number().optional(),
});

export type SpotifyArtist = z.infer<typeof ArtistSchema>;
