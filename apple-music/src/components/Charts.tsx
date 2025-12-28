import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Music, Disc3, ListMusic } from "lucide-react";
import { SongsChart } from "./SongsChart";
import { AlbumsChart } from "./AlbumsChart";
import { PlaylistsChart } from "./PlaylistsChart";

type ChartType = "songs" | "albums" | "playlists";

const routeApi = getRouteApi("/charts");

const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: "songs", label: "Top Songs", icon: <Music className="h-4 w-4" /> },
  { type: "albums", label: "Top Albums", icon: <Disc3 className="h-4 w-4" /> },
  { type: "playlists", label: "Top Playlists", icon: <ListMusic className="h-4 w-4" /> },
];

export function Charts() {
  const { tab } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handleTypeChange = (newType: ChartType) => {
    navigate({ search: { tab: newType } });
  };

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2">
        {chartTypes.map(({ type, label, icon }) => (
          <Button
            key={type}
            variant={tab === type ? "default" : "secondary"}
            onClick={() => handleTypeChange(type)}
            className="rounded-md"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      {/* Chart Content */}
      {tab === "songs" && <SongsChart />}
      {tab === "albums" && <AlbumsChart />}
      {tab === "playlists" && <PlaylistsChart />}
    </div>
  );
}
