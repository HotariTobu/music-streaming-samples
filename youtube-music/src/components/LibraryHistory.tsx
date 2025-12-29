import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function LibraryHistory() {
  // Note: YouTube Data API doesn't provide watch history access
  // This is a limitation of the API for privacy reasons

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Watch History</h3>
        <p className="text-muted-foreground">
          Watch history is not available through the YouTube API for privacy reasons.
          <br />
          <a
            href="https://www.youtube.com/feed/history"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-400"
          >
            View on YouTube
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
