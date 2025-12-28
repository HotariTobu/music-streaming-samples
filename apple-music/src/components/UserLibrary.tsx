import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { Music, Disc3, ListMusic, Mic2, Clock, Lock } from "lucide-react";
import { LibrarySongs } from "./LibrarySongs";
import { LibraryAlbums } from "./LibraryAlbums";
import { LibraryPlaylists } from "./LibraryPlaylists";
import { LibraryArtists } from "./LibraryArtists";
import { LibraryRecent } from "./LibraryRecent";

type LibraryTab = "songs" | "albums" | "playlists" | "artists" | "recent";

const routeApi = getRouteApi("/library");

const tabs: { tab: LibraryTab; label: string; icon: React.ReactNode }[] = [
  { tab: "songs", label: "Songs", icon: <Music className="h-4 w-4" /> },
  { tab: "albums", label: "Albums", icon: <Disc3 className="h-4 w-4" /> },
  { tab: "playlists", label: "Playlists", icon: <ListMusic className="h-4 w-4" /> },
  { tab: "artists", label: "Artists", icon: <Mic2 className="h-4 w-4" /> },
  { tab: "recent", label: "Recent", icon: <Clock className="h-4 w-4" /> },
];

export function UserLibrary() {
  const { isAuthorized, authorize } = useMusicKit();
  const { tab } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handleTabChange = (newTab: LibraryTab) => {
    navigate({ search: { tab: newTab } });
  };

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
            onClick={authorize}
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
        {tabs.map(({ tab: t, label, icon }) => (
          <Button
            key={t}
            variant={tab === t ? "default" : "secondary"}
            onClick={() => handleTabChange(t)}
            className="rounded-md"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "songs" && <LibrarySongs />}
      {tab === "albums" && <LibraryAlbums />}
      {tab === "playlists" && <LibraryPlaylists />}
      {tab === "artists" && <LibraryArtists />}
      {tab === "recent" && <LibraryRecent />}
    </div>
  );
}
