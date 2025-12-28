import { z } from "zod";
import {
  SongSchema,
  AlbumSchema,
  PlaylistSchema,
  MusicVideoSchema,
} from "../resources/catalog";

const createChartDataSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    chart: z.string(),
    name: z.string(),
    data: z.array(schema),
    next: z.string().optional(),
  });

export const SongChartDataSchema = createChartDataSchema(SongSchema);
export const AlbumChartDataSchema = createChartDataSchema(AlbumSchema);
export const PlaylistChartDataSchema = createChartDataSchema(PlaylistSchema);
export const MusicVideoChartDataSchema = createChartDataSchema(MusicVideoSchema);

export const ChartsResultsSchema = z.object({
  results: z.object({
    songs: z.array(SongChartDataSchema).optional(),
    albums: z.array(AlbumChartDataSchema).optional(),
    playlists: z.array(PlaylistChartDataSchema).optional(),
    "music-videos": z.array(MusicVideoChartDataSchema).optional(),
  }),
});

export type ChartData<T> = {
  chart: string;
  name: string;
  data: T[];
  next?: string;
};

export type ChartsResults = z.infer<typeof ChartsResultsSchema>;
