import { useInfiniteQuery } from "@tanstack/react-query";
import { useYouTube } from "@/contexts/YouTubeContext";

interface PlaylistItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  itemCount?: number;
}

interface PlaylistsResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

async function fetchMyPlaylists(pageToken?: string): Promise<PlaylistsResponse> {
  const params = new URLSearchParams({ mine: "true", maxResults: "20" });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const res = await fetch(`/api/youtube/playlists?${params}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch playlists");
  }
  return res.json();
}

export function useMyPlaylists() {
  const { isAuthorized } = useYouTube();

  return useInfiniteQuery({
    queryKey: ["youtube", "my", "playlists"],
    queryFn: ({ pageParam }) => fetchMyPlaylists(pageParam),
    enabled: isAuthorized,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined as string | undefined,
  });
}
