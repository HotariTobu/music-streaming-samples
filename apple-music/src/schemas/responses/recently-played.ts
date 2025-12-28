import { z } from "zod";
import { AlbumSchema, PlaylistSchema, StationSchema } from "../resources/catalog";

export const RecentlyPlayedResultsSchema = z.object({
  data: z.array(z.union([AlbumSchema, PlaylistSchema, StationSchema])),
  next: z.string().optional(),
});

export type RecentlyPlayedResults = z.infer<typeof RecentlyPlayedResultsSchema>;
