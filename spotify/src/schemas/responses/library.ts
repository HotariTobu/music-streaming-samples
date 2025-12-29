import { z } from "zod";
import { createPagingSchema, createCursorPagingSchema } from "../primitives";
import { TrackSchema, SavedTrackSchema } from "../resources/track";
import { AlbumSchema } from "../resources/album";
import { ArtistSchema } from "../resources/artist";
import { PlaylistSimplifiedSchema } from "../resources/playlist";

// Saved tracks response
export const SavedTracksResponseSchema = createPagingSchema(SavedTrackSchema);
export type SpotifySavedTracksResponse = z.infer<typeof SavedTracksResponseSchema>;

// Saved albums
export const SavedAlbumSchema = z.object({
  added_at: z.string(),
  album: AlbumSchema,
});

export type SpotifySavedAlbum = z.infer<typeof SavedAlbumSchema>;

export const SavedAlbumsResponseSchema = createPagingSchema(SavedAlbumSchema);
export type SpotifySavedAlbumsResponse = z.infer<typeof SavedAlbumsResponseSchema>;

// User's playlists
export const UserPlaylistsResponseSchema = createPagingSchema(PlaylistSimplifiedSchema);
export type SpotifyUserPlaylistsResponse = z.infer<typeof UserPlaylistsResponseSchema>;

// Followed artists
export const FollowedArtistsResponseSchema = z.object({
  artists: createCursorPagingSchema(ArtistSchema),
});
export type SpotifyFollowedArtistsResponse = z.infer<typeof FollowedArtistsResponseSchema>;

// Recently played
export const PlayHistorySchema = z.object({
  track: TrackSchema,
  played_at: z.string(),
  context: z.object({
    type: z.string(),
    href: z.string(),
    external_urls: z.object({
      spotify: z.string().optional(),
    }),
    uri: z.string(),
  }).nullable(),
});

export type SpotifyPlayHistory = z.infer<typeof PlayHistorySchema>;

export const RecentlyPlayedResponseSchema = createCursorPagingSchema(PlayHistorySchema);
export type SpotifyRecentlyPlayedResponse = z.infer<typeof RecentlyPlayedResponseSchema>;
