import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { usePlaylistTracks, useUpdatePlaylist, useDeletePlaylist } from "@/hooks/useMusicKitQuery";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Play, Music, ListMusic, Pencil, Trash2, X, Check } from "lucide-react";

const playlistSchema = z.object({
  name: z.string().min(1, "Playlist name is required"),
  description: z.string().optional(),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

interface PlaylistDetailProps {
  playlist: MusicKit.LibraryPlaylist;
  onBack: () => void;
  onDeleted?: () => void;
}

export function PlaylistDetail({ playlist, onBack, onDeleted }: PlaylistDetailProps) {
  const { musicKit } = useMusicKit();
  const { data: tracks = [], isLoading } = usePlaylistTracks(playlist.id);
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: playlist.attributes.name,
      description: playlist.attributes.description?.standard || "",
    },
  });

  const onSubmit = async (data: PlaylistFormData) => {
    try {
      await updatePlaylist.mutateAsync({
        playlistId: playlist.id,
        name: data.name,
        description: data.description,
      });
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setIsEditing(false);
      }, 1500);
    } catch (err) {
      console.error("[PlaylistDetail] Failed to update playlist:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlaylist.mutateAsync(playlist.id);
      onDeleted?.();
      onBack();
    } catch (err) {
      console.error("[PlaylistDetail] Failed to delete playlist:", err);
    }
  };

  const cancelEdit = () => {
    reset();
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const playPlaylist = async () => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id });
      await musicKit.play();
    } catch (err) {
      console.error("[PlaylistDetail] Play playlist failed:", err);
    }
  };

  const playSong = async (song: MusicKit.LibrarySong, startIndex: number) => {
    if (!musicKit) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id, startWith: startIndex });
      await musicKit.play();
    } catch (err) {
      console.error("[PlaylistDetail] Play song failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Playlist</h2>
      </div>

      {/* Playlist info */}
      <div className="flex gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          {playlist.attributes.artwork ? (
            <img
              src={getArtworkUrl(playlist.attributes.artwork, 200)}
              alt={playlist.attributes.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <ListMusic className="h-16 w-16 text-white" />
            </div>
          )}
        </div>

        {/* Edit mode */}
        {isEditing ? (
          <div className="flex-1 flex flex-col gap-4">
            {updateSuccess ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span>Updated!</span>
              </div>
            ) : showDeleteConfirm ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    Are you sure you want to delete "{playlist.attributes.name}"? This cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deletePlaylist.isPending}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deletePlaylist.isPending}>
                    {deletePlaylist.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} className="min-h-[60px]" />
                </div>
                {updatePlaylist.error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {updatePlaylist.error instanceof Error ? updatePlaylist.error.message : "Update failed"}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2 justify-between">
                  <Button type="button" variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updatePlaylist.isPending || !isDirty}>
                      {updatePlaylist.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* View mode */
          <div className="flex flex-col justify-end gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{playlist.attributes.name}</h1>
              {playlist.attributes.description?.standard && (
                <p className="text-muted-foreground mt-1">{playlist.attributes.description.standard}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {tracks.length} {tracks.length === 1 ? "song" : "songs"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={playPlaylist}
                disabled={tracks.length === 0}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
              {playlist.attributes.canEdit && (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Track list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-2" />
          <p>No songs in this playlist</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playSong(track, idx)}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer group transition-colors"
            >
              <span className="w-6 text-center text-muted-foreground text-sm group-hover:hidden">
                {idx + 1}
              </span>
              <span className="w-6 text-center hidden group-hover:flex justify-center text-foreground">
                <Play className="h-4 w-4" />
              </span>
              {track.attributes.artwork ? (
                <img
                  src={getArtworkUrl(track.attributes.artwork, 48)}
                  alt={track.attributes.name}
                  className="w-12 h-12 rounded-md shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                  <Music className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{track.attributes.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.attributes.artistName}
                </p>
              </div>
              <div className="text-sm text-muted-foreground w-12 text-right">
                {formatDuration(track.attributes.durationInMillis)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
