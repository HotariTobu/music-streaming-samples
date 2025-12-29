import { z } from "zod";
import { ImageSchema, createPagingSchema } from "../primitives";
import { AlbumSimplifiedSchema } from "../resources/album";
import { PlaylistSimplifiedSchema } from "../resources/playlist";

// Category
export const CategorySchema = z.object({
  href: z.string(),
  icons: z.array(ImageSchema),
  id: z.string(),
  name: z.string(),
});

export type SpotifyCategory = z.infer<typeof CategorySchema>;

// Featured playlists response
export const FeaturedPlaylistsResponseSchema = z.object({
  message: z.string().optional(),
  playlists: createPagingSchema(PlaylistSimplifiedSchema),
});

export type SpotifyFeaturedPlaylistsResponse = z.infer<typeof FeaturedPlaylistsResponseSchema>;

// New releases response
export const NewReleasesResponseSchema = z.object({
  albums: createPagingSchema(AlbumSimplifiedSchema),
});

export type SpotifyNewReleasesResponse = z.infer<typeof NewReleasesResponseSchema>;

// Categories response
export const CategoriesResponseSchema = z.object({
  categories: createPagingSchema(CategorySchema),
});

export type SpotifyCategoriesResponse = z.infer<typeof CategoriesResponseSchema>;

// Category playlists response
export const CategoryPlaylistsResponseSchema = z.object({
  playlists: createPagingSchema(PlaylistSimplifiedSchema),
});

export type SpotifyCategoryPlaylistsResponse = z.infer<typeof CategoryPlaylistsResponseSchema>;
