import { z } from "zod";
import { createPagingSchema } from "../primitives";
import { TrackSchema } from "../resources/track";
import { AlbumSimplifiedSchema } from "../resources/album";
import { ArtistSchema } from "../resources/artist";
import { PlaylistSimplifiedSchema } from "../resources/playlist";

// Search response
export const SearchResponseSchema = z.object({
  tracks: createPagingSchema(TrackSchema).optional(),
  albums: createPagingSchema(AlbumSimplifiedSchema).optional(),
  artists: createPagingSchema(ArtistSchema).optional(),
  playlists: createPagingSchema(PlaylistSimplifiedSchema).optional(),
});

export type SpotifySearchResponse = z.infer<typeof SearchResponseSchema>;
