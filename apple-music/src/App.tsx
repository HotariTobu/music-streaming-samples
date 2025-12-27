import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CredentialsForm } from "./components/CredentialsForm";
import { CatalogSearch } from "./components/CatalogSearch";
import { Charts } from "./components/Charts";
import { PlaybackControls } from "./components/PlaybackControls";
import { UserLibrary } from "./components/UserLibrary";
import { MusicKitProvider, useMusicKit } from "./contexts/MusicKitContext";
import "./index.css";

type Tab = "search" | "charts" | "library" | "playback";

function AppContent() {
  const { isConfigured, isReady, isAuthorized, error, authorize, checkCredentials } = useMusicKit();
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // Not configured - show credentials form
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎵</div>
            <h1 className="text-3xl font-bold text-white mb-2">Apple Music API</h1>
            <p className="text-zinc-400">Enter your Apple Developer credentials to get started</p>
          </div>
          <CredentialsForm onConfigured={checkCredentials} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  // Loading MusicKit
  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-400">Initializing MusicKit...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string; requiresAuth?: boolean }[] = [
    { id: "search", label: "Search", icon: "🔍" },
    { id: "charts", label: "Charts", icon: "📊" },
    { id: "library", label: "Library", icon: "📚", requiresAuth: true },
    { id: "playback", label: "Player", icon: "🎧" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎵</span>
              <div>
                <h1 className="font-bold text-lg">Apple Music API</h1>
                <p className="text-xs text-zinc-500">MusicKit JS Sample</p>
              </div>
            </div>

            {/* Auth Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isAuthorized ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="text-sm text-zinc-400">
                  {isAuthorized ? "Authorized" : "Not Authorized"}
                </span>
              </div>
              {!isAuthorized && (
                <Button
                  onClick={authorize}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                >
                  Authorize
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[73px] z-40 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {tabs.map(({ id, label, icon, requiresAuth }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }
                `}
              >
                <span>{icon}</span>
                {label}
                {requiresAuth && !isAuthorized && (
                  <span className="text-xs text-amber-500">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* API Features Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl border border-zinc-700">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-zinc-300">Public API (No Auth)</span>
              <span className="text-zinc-500">Search, Charts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-zinc-300">User API (Auth Required)</span>
              <span className="text-zinc-500">Library, Playlists, Recent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="text-zinc-300">Playback</span>
              <span className="text-zinc-500">Preview (30s) or Full (with subscription)</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "search" && <CatalogSearch />}
        {activeTab === "charts" && <Charts />}
        {activeTab === "library" && <UserLibrary />}
        {activeTab === "playback" && <PlaybackControls />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>Apple Music API Sample with MusicKit JS v3</p>
          <p className="mt-1">
            <a
              href="https://developer.apple.com/documentation/musickitjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300"
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
    <MusicKitProvider>
      <AppContent />
    </MusicKitProvider>
  );
}

export default App;
