import { useInfiniteQuery } from "@tanstack/react-query";

interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelId: string;
  channelTitle: string;
  position: number;
}

interface PlaylistItemsResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

async function fetchPlaylistItems(playlistId: string, pageToken?: string): Promise<PlaylistItemsResponse> {
  const params = new URLSearchParams({ maxResults: "50" });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const res = await fetch(`/api/youtube/playlists/${playlistId}/items?${params}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch playlist items");
  }
  return res.json();
}

export function usePlaylistItems(playlistId: string) {
  return useInfiniteQuery({
    queryKey: ["youtube", "playlist", playlistId, "items"],
    queryFn: ({ pageParam }) => fetchPlaylistItems(playlistId, pageParam),
    enabled: !!playlistId,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined as string | undefined,
  });
}
