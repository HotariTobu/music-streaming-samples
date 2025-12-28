import { useState, useEffect } from "react";
import { Link, Outlet, useSearch, useLocation, useRouter } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Music, Disc3, Mic2, ListMusic, Search } from "lucide-react";

const searchTypes = [
  { path: "/search/songs", label: "Songs", icon: <Music className="h-4 w-4" /> },
  { path: "/search/albums", label: "Albums", icon: <Disc3 className="h-4 w-4" /> },
  { path: "/search/artists", label: "Artists", icon: <Mic2 className="h-4 w-4" /> },
  { path: "/search/playlists", label: "Playlists", icon: <ListMusic className="h-4 w-4" /> },
] as const;

export function SearchLayout() {
  const router = useRouter();
  const location = useLocation();
  const { q } = useSearch({ strict: false }) as { q?: string };
  const urlQuery = q ?? "";

  const [inputQuery, setInputQuery] = useState(urlQuery);

  useEffect(() => {
    setInputQuery(urlQuery);
  }, [urlQuery]);

  const handleSearch = () => {
    if (inputQuery.trim()) {
      router.navigate({
        to: location.pathname,
        search: { q: inputQuery.trim() },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Apple Music catalog..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-12"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!inputQuery.trim()}
          className="h-12 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        >
          Search
        </Button>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2">
        {searchTypes.map(({ path, label, icon }) => (
          <Button
            key={path}
            variant={location.pathname === path ? "default" : "secondary"}
            asChild
            className="rounded-md"
          >
            <Link to={path} search={{ q: urlQuery || undefined }}>
              {icon}
              {label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Results */}
      <Outlet />

      {/* Initial State */}
      {!urlQuery && (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-2" />
          <p>Search for songs, albums, artists, or playlists</p>
        </div>
      )}
    </div>
  );
}
