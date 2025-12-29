import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useLibraryPlaylist } from "@/hooks/useLibraryPlaylist";
import { useUpdatePlaylist } from "@/hooks/useUpdatePlaylist";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylist";
import { getArtworkUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Trash2, X, Check, ListMusic } from "lucide-react";

const playlistSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

interface LibraryPlaylistDetailEditPageProps {
  playlistId: string;
  backTo: string;
}

export function LibraryPlaylistDetailEditPage({
  playlistId,
  backTo,
}: LibraryPlaylistDetailEditPageProps) {
  const navigate = useNavigate();
  const { isReady } = useMusicKit();
  const { data: playlist, isLoading } = useLibraryPlaylist(playlistId);
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: playlist?.attributes.name ?? "",
      description: playlist?.attributes.description?.standard ?? "",
    },
  });

  const handleSave = async (data: PlaylistFormData) => {
    await updatePlaylist.mutateAsync({ playlistId, ...data });
    setSaveSuccess(true);
    setTimeout(() => {
      navigate({ to: backTo });
    }, 1500);
  };

  const handleDelete = async () => {
    await deletePlaylist.mutateAsync(playlistId);
    navigate({ to: "/library/playlists" });
  };

  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={backTo}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">Playlist not found</h2>
        </div>
      </div>
    );
  }

  const playlistName = playlist.attributes.name ?? "Untitled Playlist";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Edit Playlist</h2>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Artwork */}
        <div className="w-48 h-48 flex-shrink-0">
          {playlist.attributes.artwork ? (
            <img
              src={getArtworkUrl(playlist.attributes.artwork, 200)}
              alt={playlistName}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <ListMusic className="h-16 w-16 text-white" />
            </div>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col gap-4">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              <span>Updated!</span>
            </div>
          ) : showDeleteConfirm ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Are you sure you want to delete "{playlistName}"? This cannot
                  be undone.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletePlaylist.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deletePlaylist.isPending}
                >
                  {deletePlaylist.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="min-h-[60px]"
                />
              </div>
              {updatePlaylist.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {updatePlaylist.error.message}
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2 justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" asChild>
                    <Link to={backTo}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePlaylist.isPending || !isDirty}
                  >
                    {updatePlaylist.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
