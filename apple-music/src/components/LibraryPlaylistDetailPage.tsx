import { useState, useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useMusicKit } from "@/contexts/MusicKitContext";
import { useLibraryPlaylist } from "@/hooks/useLibraryPlaylist";
import { usePlaylistTracksInfinite } from "@/hooks/usePlaylistTracksInfinite";
import { usePlayPlaylist } from "@/hooks/usePlayPlaylist";
import { useUpdatePlaylist } from "@/hooks/useUpdatePlaylist";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylist";
import {
  transformLibraryPlaylist,
  transformLibrarySongs,
} from "@/lib/media-transforms";
import { MediaDetailView, PlaylistEditView } from "@/components/media-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pencil, Lock } from "lucide-react";

const routeApi = getRouteApi("/library/playlists/$playlistId");

export function LibraryPlaylistDetailPage() {
  const { isAuthorized, authorize } = useMusicKit();
  const { playlistId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: playlist, isLoading } = useLibraryPlaylist(playlistId);
  const tracksQuery = usePlaylistTracksInfinite(playlistId);
  const playPlaylist = usePlayPlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  const [isEditing, setIsEditing] = useState(false);

  const tracks = useMemo(
    () =>
      transformLibrarySongs(
        tracksQuery.data?.pages.flatMap((p) => p.data) ?? []
      ),
    [tracksQuery.data]
  );

  const handleBack = () => {
    navigate({ to: "/library", search: { tab: "playlists" } });
  };

  const handlePlay = () => {
    if (playlist) playPlaylist(playlist.id);
  };

  const handlePlayTrack = (index: number) => {
    if (playlist) playPlaylist(playlist.id, index);
  };

  const handleSave = async (data: { name?: string; description?: string }) => {
    if (!playlist) return;
    await updatePlaylist.mutateAsync({
      playlistId: playlist.id,
      name: data.name,
      description: data.description,
    });
  };

  const handleDelete = async () => {
    if (!playlist) return;
    await deletePlaylist.mutateAsync(playlist.id);
    navigate({ to: "/library", search: { tab: "playlists" } });
  };

  // Authorization required
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
  if (isLoading) {
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
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Playlist not found</h2>
        </div>
      </div>
    );
  }

  // Composition: Edit view OR Detail view
  if (isEditing) {
    return (
      <PlaylistEditView
        playlist={playlist}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        onDelete={handleDelete}
        isSaving={updatePlaylist.isPending}
        isDeleting={deletePlaylist.isPending}
        saveError={updatePlaylist.error}
      />
    );
  }

  return (
    <MediaDetailView
      media={transformLibraryPlaylist(playlist)}
      tracks={tracks}
      mediaType="playlist"
      onBack={handleBack}
      onPlayTrack={handlePlayTrack}
      isLoadingTracks={tracksQuery.isLoading}
      hasNextPage={!!tracksQuery.hasNextPage}
      isFetchingNextPage={tracksQuery.isFetchingNextPage}
      fetchNextPage={() => tracksQuery.fetchNextPage()}
      showTrackArtwork
      actions={
        <>
          <Button
            onClick={handlePlay}
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
        </>
      }
    />
  );
}
