import { useInfiniteQuery } from "@tanstack/react-query";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
}

interface SearchResponse {
  items: VideoItem[];
  nextPageToken?: string;
}

async function searchVideos(query: string, pageToken?: string): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    type: "video",
    videoCategoryId: "10", // Music category
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

export function useSearchVideos(query?: string) {
  return useInfiniteQuery({
    queryKey: ["youtube", "search", "videos", query],
    queryFn: ({ pageParam }) => searchVideos(query!, pageParam),
    enabled: !!query,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined as string | undefined,
  });
}
