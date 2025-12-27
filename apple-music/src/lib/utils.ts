import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getArtworkUrl(
  artwork: MusicKit.Artwork | undefined,
  size = 80
): string {
  if (!artwork?.url) return "";
  return artwork.url.replace("{w}", String(size)).replace("{h}", String(size));
}

export function getPlaybackStateLabel(state: MusicKit.PlaybackStates): string {
  const labels: Record<number, string> = {
    0: "None",
    1: "Loading",
    2: "Playing",
    3: "Paused",
    4: "Stopped",
    5: "Ended",
    6: "Seeking",
    8: "Waiting",
    9: "Stalled",
    10: "Completed",
  };
  return labels[state] || "Unknown";
}
