import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CredentialsForm } from "@/components/CredentialsForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSpotify } from "@/contexts/SpotifyContext";
import {
  Music,
  Search,
  Compass,
  Library,
  Headphones,
  Lock,
  AlertTriangle,
  Crown,
} from "lucide-react";

const navItems: {
  to: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}[] = [
  { to: "/search/tracks", label: "Search", icon: <Search className="h-4 w-4" /> },
  { to: "/browse/featured", label: "Browse", icon: <Compass className="h-4 w-4" /> },
  {
    to: "/library/tracks",
    label: "Library",
    icon: <Library className="h-4 w-4" />,
    requiresAuth: true,
  },
  { to: "/player", label: "Player", icon: <Headphones className="h-4 w-4" /> },
];

export function RootLayout() {
  const { isConfigured, isAuthenticated, isPremium, error, login, checkCredentials, user } =
    useSpotify();
  const location = useLocation();

  // Not configured - show credentials form
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="text-center mb-8">
            <Music className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Spotify Web API
            </h1>
            <p className="text-muted-foreground">
              Enter your Spotify app credentials to get started
            </p>
          </div>
          <CredentialsForm onConfigured={checkCredentials} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-destructive/10 border-destructive/20 max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/search/tracks" className="flex items-center gap-3">
              <Music className="h-6 w-6 text-green-500" />
              <div>
                <h1 className="font-bold text-lg">Spotify Web API</h1>
                <p className="text-xs text-muted-foreground">
                  Web Playback SDK Sample
                </p>
              </div>
            </Link>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-amber-500"}`}
                />
                <span className="text-sm text-muted-foreground">
                  {isAuthenticated ? (
                    <span className="flex items-center gap-1">
                      {user?.displayName || "Logged in"}
                      {isPremium && <Crown className="h-3 w-3 text-amber-500" />}
                    </span>
                  ) : (
                    "Not Logged In"
                  )}
                </span>
              </div>
              {!isAuthenticated && (
                <Button
                  onClick={login}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Log in with Spotify
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {navItems.map(({ to, label, icon, requiresAuth }) => {
              const isActive = location.pathname.startsWith(to.split("/").slice(0, 2).join("/"));
              return (
                <Button
                  key={to}
                  variant={isActive ? "secondary" : "ghost"}
                  asChild
                  className="whitespace-nowrap"
                >
                  <Link to={to}>
                    <span>{icon}</span>
                    {label}
                    {requiresAuth && !isAuthenticated && (
                      <Lock className="h-3 w-3 text-amber-500" />
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />

        {/* API Features Info */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-foreground">Logged In Required</span>
                <span className="text-muted-foreground">Search, Browse, Library</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-foreground">Premium Required</span>
                <span className="text-muted-foreground">
                  Full Playback (Web Playback SDK)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Spotify Web API Sample with Web Playback SDK</p>
          <p className="mt-1">
            <a
              href="https://developer.spotify.com/documentation/web-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              Spotify Web API Documentation
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
