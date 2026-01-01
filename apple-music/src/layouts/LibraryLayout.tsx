import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { Music, Disc3, ListMusic, Mic2, Clock, Lock } from "lucide-react";

const tabs = [
  { path: "/library/songs", label: "Songs", icon: <Music className="h-4 w-4" /> },
  { path: "/library/albums", label: "Albums", icon: <Disc3 className="h-4 w-4" /> },
  { path: "/library/playlists", label: "Playlists", icon: <ListMusic className="h-4 w-4" /> },
  { path: "/library/artists", label: "Artists", icon: <Mic2 className="h-4 w-4" /> },
  { path: "/library/recent", label: "Recent", icon: <Clock className="h-4 w-4" /> },
] as const;

export function LibraryLayout() {
  const { musicKit, isAuthorized } = useMusicKit();
  const location = useLocation();

  const handleAuthorizeButtonClick = async () => {
    if (!musicKit) {
      console.warn("[MusicKit] Authorization skipped due no kit instance")
      return
    }

    try {
      await musicKit.authorize();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isCancellation = errorMessage.includes("AUTHORIZATION_ERROR") ||
                             errorMessage.includes("Unauthorized") ||
                             errorMessage.includes("cancelled") ||
                             errorMessage.includes("canceled");

      if (isCancellation) {
        console.log("[MusicKit] Authorization canceled by user")
        return;
      }

      console.error("[MusicKit] Authorization failed", err)
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Authorization Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            To access your Apple Music library, playlists, and recently played,
            you need to authorize this app with your Apple Music account.
          </p>
          <Button
            onClick={handleAuthorizeButtonClick}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            Authorize with Apple Music
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
