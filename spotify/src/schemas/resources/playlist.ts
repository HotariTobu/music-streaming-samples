import { z } from "zod";
import { ImageSchema, ExternalUrlsSchema, FollowersSchema } from "../primitives";
import { TrackSchema } from "./track";

// Playlist owner
export const PlaylistOwnerSchema = z.object({
  external_urls: ExternalUrlsSchema,
  followers: FollowersSchema.optional(),
  href: z.string(),
  id: z.string(),
  type: z.literal("user"),
  uri: z.string(),
  display_name: z.string().nullable(),
});

export type SpotifyPlaylistOwner = z.infer<typeof PlaylistOwnerSchema>;

// Playlist track item
export const PlaylistTrackSchema = z.object({
  added_at: z.string().nullable(),
  added_by: z.object({
    external_urls: ExternalUrlsSchema,
    href: z.string(),
    id: z.string(),
    type: z.literal("user"),
    uri: z.string(),
  }).nullable(),
  is_local: z.boolean(),
  track: TrackSchema.nullable(),
});

export type SpotifyPlaylistTrack = z.infer<typeof PlaylistTrackSchema>;

// Simplified playlist
export const PlaylistSimplifiedSchema = z.object({
  collaborative: z.boolean(),
  description: z.string().nullable(),
  external_urls: ExternalUrlsSchema,
  href: z.string(),
  id: z.string(),
  images: z.array(ImageSchema),
  name: z.string(),
  owner: PlaylistOwnerSchema,
  public: z.boolean().nullable(),
  snapshot_id: z.string(),
  tracks: z.object({
    href: z.string(),
    total: z.number(),
  }),
  type: z.literal("playlist"),
  uri: z.string(),
});

export type SpotifyPlaylistSimplified = z.infer<typeof PlaylistSimplifiedSchema>;

// Full playlist object
export const PlaylistSchema = PlaylistSimplifiedSchema.extend({
  followers: FollowersSchema.optional(),
  tracks: z.object({
    href: z.string(),
    items: z.array(PlaylistTrackSchema),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  }),
});

export type SpotifyPlaylist = z.infer<typeof PlaylistSchema>;
