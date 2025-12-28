import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";

type SearchType = "songs" | "albums" | "artists" | "playlists";

/**
 * Hook for searching the Apple Music catalog
 */
export function useCatalogSearch(query: string, type: SearchType) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "search", query, type],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music<MusicKit.SearchResults>(
        "/v1/catalog/{{storefrontId}}/search",
        {
          term: query,
          types: type,
          limit: 25,
        }
      );

      const resultsData = response.data.results;

      if (type === "songs" && resultsData.songs?.data) {
        return resultsData.songs.data;
      } else if (type === "albums" && resultsData.albums?.data) {
        return resultsData.albums.data;
      } else if (type === "artists" && resultsData.artists?.data) {
        return resultsData.artists.data;
      } else if (type === "playlists" && resultsData.playlists?.data) {
        return resultsData.playlists.data;
      }

      return [];
    },
    enabled: !!musicKit && !!query.trim(),
  });
}

/**
 * Hook for fetching Apple Music charts
 */
export function useCharts() {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "charts"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music<MusicKit.ChartsResults>(
        "/v1/catalog/{{storefrontId}}/charts",
        {
          types: "songs,albums,playlists",
          limit: 20,
        }
      );

      const results = response.data.results;
      return {
        songs: results.songs?.[0]?.data || [],
        albums: results.albums?.[0]?.data || [],
        playlists: results.playlists?.[0]?.data || [],
      };
    },
    enabled: !!musicKit,
  });
}

/**
 * Hook for fetching user's library songs
 */
export function useLibrarySongs(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "songs"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibrarySong>>(
        "/v1/me/library/songs",
        { limit: 50 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Hook for fetching user's library albums
 */
export function useLibraryAlbums(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "albums"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryAlbum>>(
        "/v1/me/library/albums",
        { limit: 50 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Hook for fetching a single library album by ID
 */
export function useLibraryAlbum(albumId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "album", albumId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryAlbum>>(
        `/v1/me/library/albums/${albumId}`
      );
      return res.data.data[0];
    },
    enabled: !!musicKit && isAuthorized && !!albumId,
  });
}

/**
 * Hook for fetching a single catalog album by ID
 */
export function useCatalogAlbum(albumId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "album", albumId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music<MusicKit.CatalogResults<MusicKit.Album>>(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}`
      );
      return res.data.data[0];
    },
    enabled: !!musicKit && !!albumId,
  });
}

/**
 * Hook for fetching tracks of a library album
 */
export function useLibraryAlbumTracks(albumId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "album", albumId, "tracks"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibrarySong>>(
        `/v1/me/library/albums/${albumId}/tracks`,
        { limit: 100 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && isAuthorized && !!albumId,
  });
}

/**
 * Hook for fetching tracks of a catalog album
 */
export function useCatalogAlbumTracks(albumId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useQuery({
    queryKey: ["catalog", "album", albumId, "tracks"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music<MusicKit.CatalogResults<MusicKit.Song>>(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}/tracks`,
        { limit: 100 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && !!albumId,
  });
}

/**
 * Hook for fetching user's library playlists
 */
export function useLibraryPlaylists(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "playlists"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryPlaylist>>(
        "/v1/me/library/playlists",
        { limit: 50 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Hook for fetching a single library playlist by ID
 */
export function useLibraryPlaylist(playlistId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "playlist", playlistId],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!playlistId) throw new Error("Playlist ID is required");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryPlaylist>>(
        `/v1/me/library/playlists/${playlistId}`
      );
      return res.data.data[0];
    },
    enabled: !!musicKit && isAuthorized && !!playlistId,
  });
}

/**
 * Hook for fetching user's library artists
 */
export function useLibraryArtists(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "artists"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibraryArtist>>(
        "/v1/me/library/artists",
        { limit: 50 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Hook for fetching recently played items
 */
export function useRecentlyPlayed(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "recent"],
    queryFn: async () => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music<MusicKit.RecentlyPlayedResults>(
        "/v1/me/recent/played",
        { limit: 10 }
      );
      return res.data.data as (MusicKit.Album | MusicKit.Playlist | MusicKit.Station)[];
    },
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Hook for creating a new library playlist
 */
export function useCreatePlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      trackIds,
    }: {
      name: string;
      description?: string;
      trackIds?: string[];
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const body: {
        attributes: { name: string; description?: string };
        relationships?: { tracks: { data: { id: string; type: string }[] } };
      } = {
        attributes: { name },
      };

      if (description) {
        body.attributes.description = description;
      }

      if (trackIds && trackIds.length > 0) {
        body.relationships = {
          tracks: {
            data: trackIds.map((id) => ({ id, type: "songs" })),
          },
        };
      }

      const res = await musicKit.api.music("/v1/me/library/playlists", {}, {
        fetchOptions: {
          method: "POST",
          body: JSON.stringify(body),
        },
      });

      return res.data.data[0] as MusicKit.LibraryPlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

/**
 * Hook for updating a playlist's attributes (name, description)
 */
export function useUpdatePlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      name,
      description,
    }: {
      playlistId: string;
      name?: string;
      description?: string;
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const body: { attributes: { name?: string; description?: string } } = {
        attributes: {},
      };

      if (name !== undefined) {
        body.attributes.name = name;
      }
      if (description !== undefined) {
        body.attributes.description = description;
      }

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}`, {}, {
        fetchOptions: {
          method: "PATCH",
          body: JSON.stringify(body),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

/**
 * Hook for adding tracks to an existing playlist
 */
export function useAddTracksToPlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      trackIds,
    }: {
      playlistId: string;
      trackIds: string[];
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const body = {
        data: trackIds.map((id) => ({ id, type: "songs" })),
      };

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}/tracks`, {}, {
        fetchOptions: {
          method: "POST",
          body: JSON.stringify(body),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

/**
 * Hook for fetching a single playlist with its tracks
 */
export function usePlaylistTracks(playlistId: string | null) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useQuery({
    queryKey: ["library", "playlist", playlistId, "tracks"],
    queryFn: async () => {
      if (!musicKit || !playlistId) throw new Error("MusicKit not initialized or no playlist ID");

      const res = await musicKit.api.music<MusicKit.LibraryResults<MusicKit.LibrarySong>>(
        `/v1/me/library/playlists/${playlistId}/tracks`,
        { limit: 100 }
      );
      return res.data.data;
    },
    enabled: !!musicKit && isAuthorized && !!playlistId,
  });
}

/**
 * Hook for deleting a library playlist
 */
export function useDeletePlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistId: string) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}`, {}, {
        fetchOptions: {
          method: "DELETE",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
    },
  });
}

/**
 * Hook for removing tracks from a playlist
 */
export function useRemoveTracksFromPlaylist() {
  const { musicKit } = useMusicKit();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistId,
      trackIds,
    }: {
      playlistId: string;
      trackIds: string[];
    }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      // Apple Music API requires sending the track data for deletion
      const body = {
        data: trackIds.map((id) => ({ id, type: "songs" })),
      };

      await musicKit.api.music(`/v1/me/library/playlists/${playlistId}/tracks`, {}, {
        fetchOptions: {
          method: "DELETE",
          body: JSON.stringify(body),
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "playlists"] });
      queryClient.invalidateQueries({ queryKey: ["library", "playlist", variables.playlistId, "tracks"] });
    },
  });
}
