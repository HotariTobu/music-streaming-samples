import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CredentialsForm } from "./components/CredentialsForm";
import { CatalogSearch } from "./components/CatalogSearch";
import { Charts } from "./components/Charts";
import { PlaybackControls } from "./components/PlaybackControls";
import { UserLibrary } from "./components/UserLibrary";
import { ThemeToggle } from "./components/ThemeToggle";
import { MusicKitProvider, useMusicKit } from "./contexts/MusicKitContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Music, Search, BarChart3, Library, Headphones, Lock, AlertTriangle } from "lucide-react";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

type Tab = "search" | "charts" | "library" | "playback";

function AppContent() {
  const { isConfigured, isReady, isAuthorized, error, authorize, checkCredentials } = useMusicKit();
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // Not configured - show credentials form
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="text-center mb-8">
            <Music className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Apple Music API</h1>
            <p className="text-muted-foreground">Enter your Apple Developer credentials to get started</p>
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

  // Loading MusicKit
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing MusicKit...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { id: "search", label: "Search", icon: <Search className="h-4 w-4" /> },
    { id: "charts", label: "Charts", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "library", label: "Library", icon: <Library className="h-4 w-4" />, requiresAuth: true },
    { id: "playback", label: "Player", icon: <Headphones className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">Apple Music API</h1>
                <p className="text-xs text-muted-foreground">MusicKit JS Sample</p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isAuthorized ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="text-sm text-muted-foreground">
                  {isAuthorized ? "Authorized" : "Not Authorized"}
                </span>
              </div>
              {!isAuthorized && (
                <Button
                  onClick={authorize}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
                >
                  Authorize
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
            {tabs.map(({ id, label, icon, requiresAuth }) => (
              <Button
                key={id}
                variant={activeTab === id ? "secondary" : "ghost"}
                onClick={() => setActiveTab(id)}
                className="whitespace-nowrap"
              >
                <span>{icon}</span>
                {label}
                {requiresAuth && !isAuthorized && (
                  <Lock className="h-3 w-3 text-amber-500" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* API Features Info */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-foreground">Public API (No Auth)</span>
                <span className="text-muted-foreground">Search, Charts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-foreground">User API (Auth Required)</span>
                <span className="text-muted-foreground">Library, Playlists, Recent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-foreground">Playback</span>
                <span className="text-muted-foreground">Preview (30s) or Full (with subscription)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === "search" && <CatalogSearch />}
        {activeTab === "charts" && <Charts />}
        {activeTab === "library" && <UserLibrary />}
        {activeTab === "playback" && <PlaybackControls />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Apple Music API Sample with MusicKit JS v3</p>
          <p className="mt-1">
            <a
              href="https://developer.apple.com/documentation/musickitjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              MusicKit JS Documentation
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MusicKitProvider>
          <AppContent />
        </MusicKitProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
