import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { usePlaylist, useUpdatePlaylist } from "@/hooks/usePlaylist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";

interface PlaylistDetailEditPageProps {
  playlistId: string;
  backTo: string;
  backToParams?: Record<string, string>;
}

export function PlaylistDetailEditPage({
  playlistId,
  backTo,
  backToParams,
}: PlaylistDetailEditPageProps) {
  const navigate = useNavigate();
  const { data: playlist, isLoading, isError, error } = usePlaylist(playlistId);
  const updatePlaylist = useUpdatePlaylist();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form with playlist data
  if (playlist && !initialized) {
    setName(playlist.name);
    setDescription(playlist.description || "");
    setInitialized(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePlaylist.mutateAsync({
        playlistId,
        name,
        description,
      });
      navigate({ to: backTo, params: backToParams });
    } catch {
      // Error is handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error instanceof Error ? error.message : "Failed to load playlist"}</p>
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link to={backTo} params={backToParams}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Link>
      </Button>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Edit Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {updatePlaylist.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {updatePlaylist.error instanceof Error
                    ? updatePlaylist.error.message
                    : "Failed to update playlist"}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={updatePlaylist.isPending || !name.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {updatePlaylist.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
