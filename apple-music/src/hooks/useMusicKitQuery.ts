import { useQuery } from "@tanstack/react-query";
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
