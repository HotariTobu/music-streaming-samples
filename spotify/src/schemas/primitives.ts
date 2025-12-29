import { z } from "zod";

/**
 * Spotify API primitive schemas
 * @see https://developer.spotify.com/documentation/web-api/reference
 */

// Image object
export const ImageSchema = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export type SpotifyImage = z.infer<typeof ImageSchema>;

// External URLs
export const ExternalUrlsSchema = z.object({
  spotify: z.string().optional(),
});

// External IDs
export const ExternalIdsSchema = z.object({
  isrc: z.string().optional(),
  ean: z.string().optional(),
  upc: z.string().optional(),
});

// Followers
export const FollowersSchema = z.object({
  href: z.string().nullable(),
  total: z.number(),
});

// Restrictions
export const RestrictionsSchema = z.object({
  reason: z.string(),
});

// Copyright
export const CopyrightSchema = z.object({
  text: z.string(),
  type: z.string(),
});

// Paging object (generic)
export function createPagingSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    href: z.string(),
    items: z.array(itemSchema),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  });
}

// Cursor paging object (for endpoints using cursors)
export function createCursorPagingSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    href: z.string(),
    items: z.array(itemSchema),
    limit: z.number(),
    next: z.string().nullable(),
    cursors: z.object({
      after: z.string().nullable().optional(),
      before: z.string().nullable().optional(),
    }).nullable().optional(),
    total: z.number().optional(),
  });
}
