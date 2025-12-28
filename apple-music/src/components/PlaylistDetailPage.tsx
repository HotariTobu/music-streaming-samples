import { useState, useMemo, useCallback } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useLibraryPlaylist } from "@/hooks/useLibraryPlaylist";
import { usePlaylistTracksInfinite } from "@/hooks/usePlaylistTracksInfinite";
import { useUpdatePlaylist } from "@/hooks/useUpdatePlaylist";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylist";
import { formatDuration, getArtworkUrl } from "@/lib/utils";
import type { LibrarySong } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Play,
  Music,
  ListMusic,
  Pencil,
  Trash2,
  X,
  Check,
  Lock,
} from "lucide-react";
import { VirtualList } from "./VirtualList";

const routeApi = getRouteApi("/library/playlists/$playlistId");

const playlistSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

export function PlaylistDetailPage() {
  const { musicKit, isAuthorized, authorize } = useMusicKit();
  const { playlistId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: playlist, isLoading: isLoadingPlaylist } = useLibraryPlaylist(playlistId);
  const tracksQuery = usePlaylistTracksInfinite(playlistId);
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  // Flatten paginated data
  const tracks = useMemo(
    () => tracksQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [tracksQuery.data]
  );

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
    values: playlist
      ? {
          name: playlist.attributes.name,
          description: playlist.attributes.description?.standard || "",
        }
      : undefined,
  });

  const onSubmit = async (data: PlaylistFormData) => {
    if (!playlist) return;
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
      console.error("[PlaylistDetailPage] Failed to update playlist:", err);
    }
  };

  const handleDelete = async () => {
    if (!playlist) return;
    try {
      await deletePlaylist.mutateAsync(playlist.id);
      navigate({ to: "/library", search: { tab: "playlists" } });
    } catch (err) {
      console.error("[PlaylistDetailPage] Failed to delete playlist:", err);
    }
  };

  const cancelEdit = () => {
    reset();
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const playPlaylist = async () => {
    if (!musicKit || !playlist) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id });
      await musicKit.play();
    } catch (err) {
      console.error("[PlaylistDetailPage] Play playlist failed:", err);
    }
  };

  const playSong = async (startIndex: number) => {
    if (!musicKit || !playlist) return;
    try {
      await musicKit.setQueue({ playlist: playlist.id });
      await musicKit.changeToMediaAtIndex(startIndex);
      await musicKit.play();
    } catch (err) {
      console.error("[PlaylistDetailPage] Play song failed:", err);
    }
  };

  // Render function for virtual list
  const renderTrack = useCallback(
    (track: LibrarySong, idx: number) => (
      <div
        key={track.id}
        onClick={() => playSong(idx)}
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
            className="w-12 h-12 rounded-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {track.attributes.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {track.attributes.artistName}
          </p>
        </div>
        <div className="text-sm text-muted-foreground w-12 text-right">
          {formatDuration(track.attributes.durationInMillis)}
        </div>
      </div>
    ),
    [musicKit, playlist]
  );

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Authorization Required
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            To view your playlists, you need to authorize this app with your
            Apple Music account.
          </p>
          <Button
            onClick={authorize}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            Authorize with Apple Music
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoadingPlaylist) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not found
  if (!playlist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/library" search={{ tab: "playlists" }}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">Playlist not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/library" search={{ tab: "playlists" }}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Playlist</h2>
      </div>

      {/* Playlist info */}
      <div className="flex gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          {playlist.attributes.artwork ? (
            <img
              src={getArtworkUrl(playlist.attributes.artwork, 200)}
              alt={playlist.attributes.name ?? "Untitled Playlist"}
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
                    Are you sure you want to delete "{playlist.attributes.name ?? "Untitled Playlist"}
                    "? This cannot be undone.
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      {updatePlaylist.error instanceof Error
                        ? updatePlaylist.error.message
                        : "Update failed"}
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
                    <Button type="button" variant="ghost" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
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
        ) : (
          /* View mode */
          <div className="flex flex-col justify-end gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {playlist.attributes.name ?? "Untitled Playlist"}
              </h1>
              {playlist.attributes.description?.standard && (
                <p className="text-muted-foreground mt-1">
                  {playlist.attributes.description.standard}
                </p>
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
      {tracksQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-2" />
          <p>No songs in this playlist</p>
        </div>
      ) : (
        <VirtualList
          items={tracks}
          hasNextPage={!!tracksQuery.hasNextPage}
          isFetchingNextPage={tracksQuery.isFetchingNextPage}
          fetchNextPage={() => tracksQuery.fetchNextPage()}
          renderItem={renderTrack}
          estimateSize={72}
          className="h-[500px]"
        />
      )}
    </div>
  );
}
