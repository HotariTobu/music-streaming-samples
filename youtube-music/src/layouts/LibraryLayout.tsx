import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useYouTube } from "@/contexts/YouTubeContext";
import { ListMusic, Heart, Clock, Lock } from "lucide-react";

const libraryTabs = [
  { path: "/library/playlists", label: "Playlists", icon: <ListMusic className="h-4 w-4" /> },
  { path: "/library/liked", label: "Liked", icon: <Heart className="h-4 w-4" /> },
  { path: "/library/history", label: "History", icon: <Clock className="h-4 w-4" /> },
] as const;

export function LibraryLayout() {
  const { isAuthorized, authorize } = useYouTube();
  const location = useLocation();

  if (!isAuthorized) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-semibold mb-2">Authorization Required</h2>
            <p className="text-muted-foreground mb-4">
              Sign in with your Google account to access your YouTube Music library
            </p>
            <Button onClick={authorize} className="bg-red-500 hover:bg-red-600 text-white">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        {libraryTabs.map(({ path, label, icon }) => (
          <Button
            key={path}
            variant={location.pathname === path ? "default" : "secondary"}
            asChild
            className="rounded-md"
          >
            <Link to={path}>
              {icon}
              {label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
