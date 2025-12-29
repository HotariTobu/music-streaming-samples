import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Star, Disc3, Grid3X3 } from "lucide-react";

const browseTypes = [
  { path: "/browse/featured", label: "Featured", icon: <Star className="h-4 w-4" /> },
  { path: "/browse/releases", label: "New Releases", icon: <Disc3 className="h-4 w-4" /> },
  { path: "/browse/categories", label: "Categories", icon: <Grid3X3 className="h-4 w-4" /> },
] as const;

export function BrowseLayout() {
  const location = useLocation();

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2">
        {browseTypes.map(({ path, label, icon }) => (
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

      {/* Browse Content */}
      <Outlet />
    </div>
  );
}
