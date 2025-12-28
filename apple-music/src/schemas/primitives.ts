import { z } from "zod";

export const ArtworkSchema = z.object({
  url: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  bgColor: z.string().optional(),
  textColor1: z.string().optional(),
  textColor2: z.string().optional(),
  textColor3: z.string().optional(),
  textColor4: z.string().optional(),
});

export const PlayParamsSchema = z.object({
  id: z.string(),
  kind: z.string(),
  isLibrary: z.boolean().optional(),
});

export const EditorialNotesSchema = z.object({
  short: z.string().optional(),
  standard: z.string().optional(),
});

export type Artwork = z.infer<typeof ArtworkSchema>;
export type PlayParams = z.infer<typeof PlayParamsSchema>;
export type EditorialNotes = z.infer<typeof EditorialNotesSchema>;
