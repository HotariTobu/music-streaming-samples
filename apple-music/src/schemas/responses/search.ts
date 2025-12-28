import { z } from "zod";
import {
  SongSchema,
  AlbumSchema,
  ArtistSchema,
  PlaylistSchema,
  MusicVideoSchema,
} from "../resources/catalog";

const createSearchResultItemSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    next: z.string().optional(),
  });

export const SearchResultsSchema = z.object({
  results: z.object({
    songs: createSearchResultItemSchema(SongSchema).optional(),
    albums: createSearchResultItemSchema(AlbumSchema).optional(),
    artists: createSearchResultItemSchema(ArtistSchema).optional(),
    playlists: createSearchResultItemSchema(PlaylistSchema).optional(),
    "music-videos": createSearchResultItemSchema(MusicVideoSchema).optional(),
  }),
});

export const SearchHintsResultsSchema = z.object({
  results: z.object({
    terms: z.array(z.string()),
  }),
});

export type SearchResults = z.infer<typeof SearchResultsSchema>;
export type SearchHintsResults = z.infer<typeof SearchHintsResultsSchema>;
