# MusicKitAPI and the Passthrough API Method

An instance of `MusicKitAPI` is available on configured MusicKit instances as the `api` property. The primary use is making requests to the [Apple Music API](https://developer.apple.com/documentation/applemusicapi).

The `api.music()` method handles:
- Appending the Developer Token (JWT) in the Authorization header
- Adding the Music User Token (MUT) for personalized requests
- Abstracting the user's storefront from URLs

## Method Signature

```javascript
async music(path, [queryParameters], [options: { fetchOptions }]) // ➜ Promise<results>
```

## Arguments

| Name | Type | Description |
|------|------|-------------|
| `path` | `String` | **Required** Path to Apple Music API endpoint with leading `/` |
| `queryParameters` | `Object` | *Optional* Query parameters for the request |
| `options` | `Object` | *Optional* Additional options |
| `options.fetchOptions` | `Object` | *Optional* Options passed to underlying `fetch()` |

### The `{{storefrontId}}` Path Token

When the user has authorized your app, `{{storefrontId}}` is replaced with the user's current storefront ID. Without authentication, it defaults to the configured `storefrontId` or `'us'`.

## Returns

- **Type:** `Promise<Object>`
- **Properties:**
  - `data` - Response body from Apple Music API

---

## Catalog Resources

### Search

**Endpoint:** `GET /v1/catalog/{storefront}/search`

#### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `term` | `string` | Yes | - | - | Search text with `+` replacing spaces (e.g., `james+brown`) |
| `types` | `[string]` | Yes | - | - | Resource types to search (see below) |
| `limit` | `integer` | No | 5 | **25** | Number of results per type |
| `offset` | `string` | No | - | - | Pagination offset |
| `l` | `string` | No | storefront default | - | Language tag for localization |
| `with` | `[string]` | No | - | - | Modifications (e.g., `topResults`) |

**Allowed `types` values:**
- `activities`
- `albums`
- `apple-curators`
- `artists`
- `curators`
- `music-videos`
- `playlists`
- `record-labels`
- `songs`
- `stations`

#### Example
```javascript
const queryParameters = {
  term: 'Taylor Swift',
  types: ['albums', 'artists', 'songs'],
  limit: 25,
  l: 'en-us'
};
await music.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
```

#### Response Type: `SearchResponse`

---

### Albums

**Get Multiple Albums Endpoint:** `GET /v1/catalog/{storefront}/albums`

#### Query Parameters

| Parameter | Type | Required | Max | Description |
|-----------|------|----------|-----|-------------|
| `ids` | `[string]` | Yes | **100** | Album identifiers |
| `include` | `[string]` | No | - | Additional relationships to include |
| `l` | `string` | No | - | Language tag for localization |
| `extend` | `[string]` | No | - | Attribute extensions to apply |

#### Examples
```javascript
// Single album
const albumId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/albums/${albumId}`);

// Multiple albums (max 100)
const queryParameters = { ids: ['123', '456', '789'] };
await music.api.music('/v1/catalog/{{storefrontId}}/albums', queryParameters);
```

#### Response Type: `AlbumsResponse`

---

### Songs

**Get Multiple Songs Endpoint:** `GET /v1/catalog/{storefront}/songs`

#### Query Parameters

| Parameter | Type | Required | Max | Description |
|-----------|------|----------|-----|-------------|
| `ids` | `[string]` | Yes | **300** | Song identifiers |
| `include` | `[string]` | No | - | Additional relationships to include |
| `l` | `string` | No | - | Language tag for localization |
| `extend` | `[string]` | No | - | Attribute extensions to apply |

#### Example
```javascript
const songId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/songs/${songId}`);
```

#### Response Type: `SongsResponse`

---

### Playlists

**Get Playlist Endpoint:** `GET /v1/catalog/{storefront}/playlists/{id}`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include` | `[string]` | No | Relationships: `tracks`, `curator` |
| `l` | `string` | No | Language tag for localization |

**Get Playlist Tracks:** `GET /v1/catalog/{storefront}/playlists/{id}/tracks`

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `limit` | `integer` | No | 25 | **100** | Number of tracks to return |
| `offset` | `integer` | No | 0 | - | Pagination offset |

#### Example
```javascript
const playlistId = 'pl.123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/playlists/${playlistId}`);

// Get tracks with pagination
await music.api.music(`/v1/catalog/{{storefrontId}}/playlists/${playlistId}/tracks`, {
  limit: 100,
  offset: 0
});
```

#### Response Type: `PlaylistsResponse`

---

### Artists

**Get Multiple Artists Endpoint:** `GET /v1/catalog/{storefront}/artists`

#### Query Parameters

| Parameter | Type | Required | Max | Description |
|-----------|------|----------|-----|-------------|
| `ids` | `[string]` | Yes | **25** | Artist identifiers |
| `include` | `[string]` | No | - | Relationships: `albums`, `songs`, `playlists`, `music-videos` |
| `l` | `string` | No | - | Language tag for localization |

#### Example
```javascript
const artistId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/artists/${artistId}`);
```

#### Response Type: `ArtistsResponse`

---

### Charts

**Endpoint:** `GET /v1/catalog/{storefront}/charts`

#### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `types` | `[string]` | Yes | - | - | Chart types: `albums`, `songs`, `music-videos`, `playlists` |
| `limit` | `integer` | No | 20 | **200** | Number of chart entries |
| `genre` | `string` | No | - | Genre ID to filter charts |
| `l` | `string` | No | - | Language tag for localization |

#### Example
```javascript
const queryParameters = { types: ['songs', 'albums'], limit: 50, l: 'en-us' };
await music.api.music('/v1/catalog/{{storefrontId}}/charts', queryParameters);
```

#### Response Type: `ChartResponse`

---

## Personalized Content

> **Note:** These endpoints require user authorization (Music User Token).

### Library - Adding Content

**Endpoint:** `POST /v1/me/library`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | `[string]` | Yes | Resource IDs to add (catalog IDs with type prefix) |

#### Example
```javascript
const playlistId = 'pl.23456789';
await music.api.music('/v1/me/library', { ids: [playlistId] }, {
  fetchOptions: { method: 'POST' }
});
```

---

### Library Albums

**Endpoint:** `GET /v1/me/library/albums`

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `limit` | `integer` | No | 25 | **100** | Number of albums to return |
| `offset` | `integer` | No | 0 | - | Pagination offset |
| `include` | `[string]` | No | - | Relationships to include |

---

### Recommendations

**Endpoint:** `GET /v1/me/recommendations`

```javascript
await music.api.music('/v1/me/recommendations');
```

---

### Recently Played

**Endpoint:** `GET /v1/me/recent/played`

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `limit` | `integer` | No | 10 | **10** | Number of items to return |
| `offset` | `integer` | No | 0 | - | Pagination offset |

```javascript
await music.api.music('/v1/me/recent/played', { limit: 10 });
```

---

### Heavy Rotation

**Endpoint:** `GET /v1/me/history/heavy-rotation`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | `integer` | No | Number of items to return |
| `offset` | `string` | No | Pagination offset |

```javascript
await music.api.music('/v1/me/history/heavy-rotation');
```

---

## Storefronts

**Endpoint:** `GET /v1/storefronts`

| Parameter | Type | Required | Max | Description |
|-----------|------|----------|-----|-------------|
| `ids` | `[string]` | No | - | Storefront IDs (ISO 3166 alpha-2 codes) |
| `l` | `string` | No | - | Language tag for localization |

```javascript
// Get specific storefront
await music.api.music('/v1/storefronts/us');

// Get multiple storefronts
await music.api.music('/v1/storefronts', { ids: ['us', 'jp'] });
```

---

## HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Creation request successful |
| 202 | Accepted | Modification request accepted (may not be complete) |
| 204 | No Content | Modification successful, no response body |
| 400 | Bad Request | Request malformed or invalid |
| 401 | Unauthorized | Developer token missing or invalid |
| 403 | Forbidden | Music user token invalid or incorrect authentication |
| 404 | Not Found | Requested resource doesn't exist |
| 405 | Method Not Allowed | HTTP method not supported for endpoint |
| 409 | Conflict | Conflict with current resource state |
| 413 | Payload Too Large | Request body too large |
| 414 | URI Too Long | Request URI too long |
| 429 | Too Many Requests | Rate limit exceeded (retry later) |
| 500 | Internal Server Error | Server error occurred |
| 501 | Not Implemented | Endpoint reserved for future use |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Rate Limiting

The Apple Music API limits requests per developer token within a time period. Exceeding the limit results in `429 Too Many Requests` errors. The limit resets automatically after the request rate decreases.

**Best practices:**
- Implement exponential backoff on 429 responses
- Cache responses when possible
- Use batch endpoints (e.g., multiple IDs) to reduce request count
