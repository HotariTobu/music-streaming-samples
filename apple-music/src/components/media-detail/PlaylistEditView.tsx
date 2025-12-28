import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LibraryPlaylist } from "@/schemas";
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

interface PlaylistEditViewProps {
  playlist: LibraryPlaylist;
  onSave: (data: PlaylistFormData) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  isSaving: boolean;
  isDeleting: boolean;
  saveError?: Error | null;
}

export function PlaylistEditView({
  playlist,
  onSave,
  onCancel,
  onDelete,
  isSaving,
  isDeleting,
  saveError,
}: PlaylistEditViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: playlist.attributes.name ?? "",
      description: playlist.attributes.description?.standard ?? "",
    },
  });

  const handleSave = async (data: PlaylistFormData) => {
    await onSave(data);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onCancel();
    }, 1500);
  };

  const handleDelete = async () => {
    await onDelete();
  };

  const playlistName = playlist.attributes.name ?? "Untitled Playlist";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
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
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
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
              {saveError && (
                <Alert variant="destructive">
                  <AlertDescription>{saveError.message}</AlertDescription>
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
                  <Button type="button" variant="ghost" onClick={onCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving || !isDirty}>
                    {isSaving ? "Saving..." : "Save"}
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
