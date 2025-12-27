/**
 * Apple Music API Client
 *
 * Server-side client that proxies requests to Apple Music API.
 * Developer Token never leaves the server.
 */

import { getDeveloperToken, hasCredentials } from "./token";

const API_BASE = "https://api.music.apple.com/v1";

export class AppleMusicClient {
  private storefront: string;

  constructor(storefront: string = "jp") {
    this.storefront = storefront;
  }

  /**
   * Make authenticated request to Apple Music API
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!hasCredentials()) {
      throw new Error("Credentials not configured");
    }

    const { token } = await getDeveloperToken();

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Apple Music API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Search the catalog
   * @see https://developer.apple.com/documentation/applemusicapi/search_for_catalog_resources
   */
  async search(
    term: string,
    types: string[] = ["songs", "artists", "albums"],
    limit: number = 10
  ) {
    const params = new URLSearchParams({
      term,
      types: types.join(","),
      limit: String(limit),
    });

    return this.request(`/catalog/${this.storefront}/search?${params}`);
  }

  /**
   * Get a catalog song by ID
   */
  async getSong(id: string) {
    return this.request(`/catalog/${this.storefront}/songs/${id}`);
  }

  /**
   * Get a catalog album by ID
   */
  async getAlbum(id: string) {
    return this.request(`/catalog/${this.storefront}/albums/${id}`);
  }

  /**
   * Get a catalog artist by ID
   */
  async getArtist(id: string) {
    return this.request(`/catalog/${this.storefront}/artists/${id}`);
  }

  /**
   * Get a catalog playlist by ID
   */
  async getPlaylist(id: string) {
    return this.request(`/catalog/${this.storefront}/playlists/${id}`);
  }

  /**
   * Get available storefronts
   */
  async getStorefronts() {
    return this.request("/storefronts");
  }

  /**
   * Get charts (top songs, albums, etc.)
   */
  async getCharts(types: string[] = ["songs", "albums"], limit: number = 20) {
    const params = new URLSearchParams({
      types: types.join(","),
      limit: String(limit),
    });

    return this.request(`/catalog/${this.storefront}/charts?${params}`);
  }
}

// Singleton instance
let clientInstance: AppleMusicClient | null = null;

export function getClient(storefront?: string): AppleMusicClient {
  if (!clientInstance || (storefront && clientInstance["storefront"] !== storefront)) {
    clientInstance = new AppleMusicClient(storefront);
  }
  return clientInstance;
}
