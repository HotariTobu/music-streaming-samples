import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePlaylist } from "@/hooks/useCreatePlaylist";
import type { LibraryPlaylist } from "@/schemas";
import { Plus, X, Check } from "lucide-react";

const playlistSchema = z.object({
  name: z.string().min(1, "Playlist name is required"),
  description: z.string().optional(),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

interface CreatePlaylistFormProps {
  onClose: () => void;
  onSuccess?: (playlist: LibraryPlaylist) => void;
}

export function CreatePlaylistForm({ onClose, onSuccess }: CreatePlaylistFormProps) {
  const createPlaylist = useCreatePlaylist();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
  });

  const onSubmit = async (data: PlaylistFormData) => {
    try {
      const playlist = await createPlaylist.mutateAsync({
        name: data.name,
        description: data.description,
      });
      setSuccess(true);
      reset();
      if (playlist) onSuccess?.(playlist);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("[CreatePlaylistForm] Failed to create playlist:", err);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-3 text-green-600 dark:text-green-400">
            <Check className="h-10 w-10" />
            <p className="font-medium">Playlist created!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Playlist
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Playlist"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A collection of my favorite songs..."
              className="min-h-[80px]"
              {...register("description")}
            />
          </div>

          {createPlaylist.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {createPlaylist.error instanceof Error
                  ? createPlaylist.error.message
                  : "Failed to create playlist"}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPlaylist.isPending}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
            >
              {createPlaylist.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </span>
              ) : (
                "Create Playlist"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
