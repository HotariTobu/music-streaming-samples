import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Artwork } from "@/schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getArtworkUrl(
  artwork: Artwork | undefined,
  size = 80
): string {
  if (!artwork?.url) return "";
  return artwork.url.replace("{w}", String(size)).replace("{h}", String(size));
}

export function getPlaybackStateLabel(state: MusicKit.PlaybackStates): string {
  // Using MusicKit.PlaybackStates enum values
  const labels: Record<MusicKit.PlaybackStates, string> = {
    [MusicKit.PlaybackStates.none]: "None",
    [MusicKit.PlaybackStates.loading]: "Loading",
    [MusicKit.PlaybackStates.playing]: "Playing",
    [MusicKit.PlaybackStates.paused]: "Paused",
    [MusicKit.PlaybackStates.stopped]: "Stopped",
    [MusicKit.PlaybackStates.ended]: "Ended",
    [MusicKit.PlaybackStates.seeking]: "Seeking",
    [MusicKit.PlaybackStates.waiting]: "Waiting",
    [MusicKit.PlaybackStates.stalled]: "Stalled",
    [MusicKit.PlaybackStates.completed]: "Completed",
  };
  return labels[state] || "Unknown";
}
