import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Music, Disc3, ListMusic } from "lucide-react";

const chartTypes = [
  { path: "/charts/songs", label: "Top Songs", icon: <Music className="h-4 w-4" /> },
  { path: "/charts/albums", label: "Top Albums", icon: <Disc3 className="h-4 w-4" /> },
  { path: "/charts/playlists", label: "Top Playlists", icon: <ListMusic className="h-4 w-4" /> },
] as const;

export function ChartsLayout() {
  const location = useLocation();

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2">
        {chartTypes.map(({ path, label, icon }) => (
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

      {/* Chart Content */}
      <Outlet />
    </div>
  );
}
