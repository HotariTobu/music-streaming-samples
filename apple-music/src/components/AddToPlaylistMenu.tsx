import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLibraryPlaylists } from "@/hooks/useLibraryPlaylists";
import { useAddTracksToPlaylist } from "@/hooks/useAddTracksToPlaylist";
import { ListMusic, Plus, Check, X, Loader2 } from "lucide-react";

interface AddToPlaylistMenuProps {
  trackIds: string[];
  onClose: () => void;
  onCreateNew?: () => void;
}

export function AddToPlaylistMenu({ trackIds, onClose, onCreateNew }: AddToPlaylistMenuProps) {
  const { data: playlists = [], isLoading } = useLibraryPlaylists();
  const addTracks = useAddTracksToPlaylist();
  const [addedTo, setAddedTo] = useState<string | null>(null);

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await addTracks.mutateAsync({ playlistId, trackIds });
      setAddedTo(playlistId);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("[AddToPlaylistMenu] Failed to add tracks:", err);
    }
  };

  const editablePlaylists = playlists.filter((p) => p.attributes.canEdit);

  return (
    <Card className="w-72">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
        <CardTitle className="text-sm font-medium">Add to Playlist</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">New Playlist...</span>
              </button>
            )}

            {editablePlaylists.length === 0 && !onCreateNew ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No editable playlists found
              </p>
            ) : (
              editablePlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={addTracks.isPending || addedTo !== null}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                    {addedTo === playlist.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <ListMusic className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm truncate flex-1">{playlist.attributes.name}</span>
                  {addTracks.isPending && addTracks.variables?.playlistId === playlist.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {addTracks.error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription className="text-xs">
              {addTracks.error instanceof Error
                ? addTracks.error.message
                : "Failed to add tracks"}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
