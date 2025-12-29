import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSpotify } from "@/contexts/SpotifyContext";
import { Music, Disc3, ListMusic, Mic2, Clock, Lock } from "lucide-react";

const tabs = [
  { path: "/library/tracks", label: "Tracks", icon: <Music className="h-4 w-4" /> },
  { path: "/library/albums", label: "Albums", icon: <Disc3 className="h-4 w-4" /> },
  { path: "/library/playlists", label: "Playlists", icon: <ListMusic className="h-4 w-4" /> },
  { path: "/library/artists", label: "Artists", icon: <Mic2 className="h-4 w-4" /> },
  { path: "/library/recent", label: "Recent", icon: <Clock className="h-4 w-4" /> },
] as const;

export function LibraryLayout() {
  const { isAuthenticated, login } = useSpotify();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Login Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            To access your Spotify library, playlists, and recently played,
            you need to log in with your Spotify account.
          </p>
          <Button
            onClick={login}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            Log in with Spotify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ path, label, icon }) => (
          <Button
            key={path}
            variant={location.pathname.startsWith(path) ? "default" : "secondary"}
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

      {/* Tab Content */}
      <Outlet />
    </div>
  );
}
