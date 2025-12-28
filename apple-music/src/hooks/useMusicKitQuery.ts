import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMusicKit } from "@/contexts/MusicKitContext";
import {
  SearchResultsSchema,
  ChartsResultsSchema,
  RecentlyPlayedResultsSchema,
  LibrarySongResultsSchema,
  LibraryAlbumResultsSchema,
  LibraryPlaylistResultsSchema,
  LibraryArtistResultsSchema,
  CatalogSongResultsSchema,
  CatalogAlbumResultsSchema,
  type Song,
  type Album,
  type Artist,
  type Playlist,
  type Station,
} from "@/schemas";

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

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/search",
        {
          term: query,
          types: type,
          limit: 25,
        }
      );

      const validated = SearchResultsSchema.parse(response.data);
      const resultsData = validated.results;

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

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/charts",
        {
          types: "songs,albums,playlists",
          limit: 20,
        }
      );

      const validated = ChartsResultsSchema.parse(response.data);
      const results = validated.results;
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

      const res = await musicKit.api.music(
        "/v1/me/library/songs",
        { limit: 50 }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return validated.data;
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

      const res = await musicKit.api.music(
        "/v1/me/library/albums",
        { limit: 50 }
      );
      const validated = LibraryAlbumResultsSchema.parse(res.data);
      return validated.data;
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

      const res = await musicKit.api.music(
        `/v1/me/library/albums/${albumId}`
      );
      const validated = LibraryAlbumResultsSchema.parse(res.data);
      return validated.data[0];
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

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}`
      );
      const validated = CatalogAlbumResultsSchema.parse(res.data);
      return validated.data[0];
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

      const res = await musicKit.api.music(
        `/v1/me/library/albums/${albumId}/tracks`,
        { limit: 100 }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return validated.data;
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

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}/tracks`,
        { limit: 100 }
      );
      const validated = CatalogSongResultsSchema.parse(res.data);
      return validated.data;
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

      const res = await musicKit.api.music(
        "/v1/me/library/playlists",
        { limit: 50 }
      );
      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return validated.data;
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

      const res = await musicKit.api.music(
        `/v1/me/library/playlists/${playlistId}`
      );
      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return validated.data[0];
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

      const res = await musicKit.api.music(
        "/v1/me/library/artists",
        { limit: 50 }
      );
      const validated = LibraryArtistResultsSchema.parse(res.data);
      return validated.data;
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

      const res = await musicKit.api.music(
        "/v1/me/recent/played",
        { limit: 10 }
      );
      const validated = RecentlyPlayedResultsSchema.parse(res.data);
      return validated.data as (Album | Playlist | Station)[];
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

      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return validated.data[0];
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

      const res = await musicKit.api.music(
        `/v1/me/library/playlists/${playlistId}/tracks`,
        { limit: 100 }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return validated.data;
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

// ============================================
// Infinite Query Hooks (for pagination)
// ============================================

const LIBRARY_PAGE_SIZE = 50;
const SEARCH_PAGE_SIZE = 25;
const TRACKS_PAGE_SIZE = 100;

/**
 * Infinite hook for fetching user's library songs with pagination
 */
export function useLibrarySongsInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "songs", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/songs",
        { limit: LIBRARY_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + LIBRARY_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Infinite hook for fetching user's library albums with pagination
 */
export function useLibraryAlbumsInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "albums", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/albums",
        { limit: LIBRARY_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibraryAlbumResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + LIBRARY_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Infinite hook for fetching user's library playlists with pagination
 */
export function useLibraryPlaylistsInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "playlists", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/playlists",
        { limit: LIBRARY_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibraryPlaylistResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + LIBRARY_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Infinite hook for fetching user's library artists with pagination
 */
export function useLibraryArtistsInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "artists", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/library/artists",
        { limit: LIBRARY_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibraryArtistResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + LIBRARY_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Infinite hook for fetching recently played items with pagination
 */
export function useRecentlyPlayedInfinite(enabled = true) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "recent", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const res = await musicKit.api.music(
        "/v1/me/recent/played",
        { limit: 10, offset: pageParam }
      );
      const validated = RecentlyPlayedResultsSchema.parse(res.data);
      return {
        data: validated.data as (Album | Playlist | Station)[],
        nextOffset: validated.next ? pageParam + 10 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && enabled,
  });
}

/**
 * Infinite hook for searching the Apple Music catalog with pagination
 */
export function useCatalogSearchInfinite(query: string, type: SearchType) {
  const { musicKit } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["catalog", "search", "infinite", query, type],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/search",
        {
          term: query,
          types: type,
          limit: SEARCH_PAGE_SIZE,
          offset: pageParam,
        }
      );

      const validated = SearchResultsSchema.parse(response.data);
      const resultsData = validated.results;
      let data: (Song | Album | Artist | Playlist)[] = [];
      let hasNext = false;

      if (type === "songs" && resultsData.songs) {
        data = resultsData.songs.data || [];
        hasNext = !!resultsData.songs.next;
      } else if (type === "albums" && resultsData.albums) {
        data = resultsData.albums.data || [];
        hasNext = !!resultsData.albums.next;
      } else if (type === "artists" && resultsData.artists) {
        data = resultsData.artists.data || [];
        hasNext = !!resultsData.artists.next;
      } else if (type === "playlists" && resultsData.playlists) {
        data = resultsData.playlists.data || [];
        hasNext = !!resultsData.playlists.next;
      }

      return {
        data,
        nextOffset: hasNext ? pageParam + SEARCH_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && !!query.trim(),
  });
}

/**
 * Infinite hook for fetching Apple Music charts with pagination
 */
export function useChartsInfinite(chartType: "songs" | "albums" | "playlists") {
  const { musicKit } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["catalog", "charts", "infinite", chartType],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");

      const response = await musicKit.api.music(
        "/v1/catalog/{{storefrontId}}/charts",
        {
          types: chartType,
          limit: 20,
          offset: pageParam,
        }
      );

      const validated = ChartsResultsSchema.parse(response.data);
      const results = validated.results;
      let data: (Song | Album | Playlist)[] = [];
      let hasNext = false;

      if (chartType === "songs" && results.songs?.[0]) {
        data = results.songs[0].data || [];
        hasNext = !!results.songs[0].next;
      } else if (chartType === "albums" && results.albums?.[0]) {
        data = results.albums[0].data || [];
        hasNext = !!results.albums[0].next;
      } else if (chartType === "playlists" && results.playlists?.[0]) {
        data = results.playlists[0].data || [];
        hasNext = !!results.playlists[0].next;
      }

      return {
        data,
        nextOffset: hasNext ? pageParam + 20 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit,
  });
}

/**
 * Infinite hook for fetching playlist tracks with pagination
 */
export function usePlaylistTracksInfinite(playlistId: string | null) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "playlist", playlistId, "tracks", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit || !playlistId) throw new Error("MusicKit not initialized or no playlist ID");

      const res = await musicKit.api.music(
        `/v1/me/library/playlists/${playlistId}/tracks`,
        { limit: TRACKS_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + TRACKS_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && !!playlistId,
  });
}

/**
 * Infinite hook for fetching library album tracks with pagination
 */
export function useLibraryAlbumTracksInfinite(albumId: string | undefined) {
  const { musicKit, isAuthorized } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["library", "album", albumId, "tracks", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/me/library/albums/${albumId}/tracks`,
        { limit: TRACKS_PAGE_SIZE, offset: pageParam }
      );
      const validated = LibrarySongResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + TRACKS_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && isAuthorized && !!albumId,
  });
}

/**
 * Infinite hook for fetching catalog album tracks with pagination
 */
export function useCatalogAlbumTracksInfinite(albumId: string | undefined) {
  const { musicKit } = useMusicKit();

  return useInfiniteQuery({
    queryKey: ["catalog", "album", albumId, "tracks", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      if (!musicKit) throw new Error("MusicKit not initialized");
      if (!albumId) throw new Error("Album ID is required");

      const res = await musicKit.api.music(
        `/v1/catalog/{{storefrontId}}/albums/${albumId}/tracks`,
        { limit: TRACKS_PAGE_SIZE, offset: pageParam }
      );
      const validated = CatalogSongResultsSchema.parse(res.data);
      return {
        data: validated.data,
        nextOffset: validated.next ? pageParam + TRACKS_PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!musicKit && !!albumId,
  });
}
