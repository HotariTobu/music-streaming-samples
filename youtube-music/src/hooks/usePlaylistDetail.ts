import { useQuery } from "@tanstack/react-query";

interface PlaylistDetail {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelId: string;
  channelTitle: string;
  itemCount: number;
  publishedAt: string;
}

async function fetchPlaylistDetail(playlistId: string): Promise<PlaylistDetail> {
  const res = await fetch(`/api/youtube/playlists/${playlistId}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch playlist");
  }
  return res.json();
}

export function usePlaylistDetail(playlistId: string) {
  return useQuery({
    queryKey: ["youtube", "playlist", playlistId],
    queryFn: () => fetchPlaylistDetail(playlistId),
    enabled: !!playlistId,
  });
}
