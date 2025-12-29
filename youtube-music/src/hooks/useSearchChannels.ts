import { useInfiniteQuery } from "@tanstack/react-query";

interface ChannelItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

interface SearchResponse {
  items: ChannelItem[];
  nextPageToken?: string;
}

async function searchChannels(query: string, pageToken?: string): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    type: "channel",
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

export function useSearchChannels(query?: string) {
  return useInfiniteQuery({
    queryKey: ["youtube", "search", "channels", query],
    queryFn: ({ pageParam }) => searchChannels(query!, pageParam),
    enabled: !!query,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined as string | undefined,
  });
}
