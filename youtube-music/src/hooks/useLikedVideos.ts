import { useInfiniteQuery } from "@tanstack/react-query";
import { useYouTube } from "@/contexts/YouTubeContext";

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channelId: string;
  channelTitle: string;
}

interface LikedVideosResponse {
  items: VideoItem[];
  nextPageToken?: string;
}

async function fetchLikedVideos(pageToken?: string): Promise<LikedVideosResponse> {
  const params = new URLSearchParams({ maxResults: "20" });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const res = await fetch(`/api/youtube/videos/liked?${params}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch liked videos");
  }
  return res.json();
}

export function useLikedVideos() {
  const { isAuthorized } = useYouTube();

  return useInfiniteQuery({
    queryKey: ["youtube", "videos", "liked"],
    queryFn: ({ pageParam }) => fetchLikedVideos(pageParam),
    enabled: isAuthorized,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: undefined as string | undefined,
  });
}
