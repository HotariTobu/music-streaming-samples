import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SpotifyImage } from "@/schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the best image URL for a given size from Spotify images.
 * Returns the smallest image that is at least the requested size,
 * or the largest available if none are big enough.
 */
export function getImageUrl(
  images: SpotifyImage[] | undefined,
  targetSize: number = 300
): string | undefined {
  if (!images || images.length === 0) return undefined;

  // Sort by size (ascending)
  const sorted = [...images].sort((a, b) => {
    const sizeA = (a.width ?? 0) * (a.height ?? 0);
    const sizeB = (b.width ?? 0) * (b.height ?? 0);
    return sizeA - sizeB;
  });

  // Find smallest image that's at least targetSize
  const target = targetSize * targetSize;
  for (const img of sorted) {
    const size = (img.width ?? 0) * (img.height ?? 0);
    if (size >= target) {
      return img.url;
    }
  }

  // Return largest available
  return sorted[sorted.length - 1]?.url;
}

/**
 * Format duration in milliseconds to mm:ss format.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get artist names as a comma-separated string.
 */
export function getArtistNames(
  artists: { name: string }[] | undefined
): string {
  if (!artists || artists.length === 0) return "Unknown Artist";
  return artists.map((a) => a.name).join(", ");
}

/**
 * Format a date string to a localized format.
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format release date based on precision.
 */
export function formatReleaseDate(
  date: string,
  precision: "year" | "month" | "day"
): string {
  try {
    const d = new Date(date);
    switch (precision) {
      case "year":
        return d.getFullYear().toString();
      case "month":
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
      case "day":
      default:
        return d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
    }
  } catch {
    return date;
  }
}
