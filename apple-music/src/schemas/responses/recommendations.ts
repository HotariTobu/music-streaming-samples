import { z } from "zod";
import { AlbumSchema, PlaylistSchema, StationSchema } from "../resources/catalog";

export const RecommendationSchema = z.object({
  id: z.string(),
  type: z.literal("personal-recommendation"),
  attributes: z.object({
    title: z.object({ stringForDisplay: z.string() }),
    reason: z.object({ stringForDisplay: z.string() }).optional(),
  }),
  relationships: z
    .object({
      contents: z
        .object({
          data: z.array(z.union([AlbumSchema, PlaylistSchema, StationSchema])),
        })
        .optional(),
    })
    .optional(),
});

export const RecommendationsResultsSchema = z.object({
  data: z.array(RecommendationSchema),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendationsResults = z.infer<typeof RecommendationsResultsSchema>;
