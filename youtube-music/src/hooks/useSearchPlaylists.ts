import { useInfiniteQuery } from "@tanstack/react-query";

interface PlaylistItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelId: string;
  channelTitle: string;
  itemCount?: number;
}

interface SearchResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

async function searchPlaylists(query: string, pageToken?: string): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    type: "playlist",
    maxResults: "20",
  });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const res = await fetch(`/api/youtube/search?${params}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Search failed");
  }
  return res.json();
}

export function useSearchPlaylists(query?: string) {
  return useInfiniteQuery({
    queryKey: ["youtube", "search", "playlists", query],
    queryFn: ({ pageParam }) => searchPlaylists(query!, pageParam),
    enabled: !!query,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined as string | undefined,
  });
}
