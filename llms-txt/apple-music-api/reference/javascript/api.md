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
```javascript
const queryParameters = { term: 'Taylor Swift', types: ['albums', 'artists', 'songs'], l: 'en-us' };
await music.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
```

### Albums
```javascript
// Single album
const albumId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/albums/${albumId}`);

// Multiple albums
const queryParameters = { ids: ['123', '456'] };
await music.api.music('/v1/catalog/{{storefrontId}}/albums', queryParameters);
```

### Songs
```javascript
const songId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/songs/${songId}`);
```

### Playlists
```javascript
const playlistId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/playlists/${playlistId}`);
```

### Artists
```javascript
const artistId = '123456789';
await music.api.music(`/v1/catalog/{{storefrontId}}/artists/${artistId}`);
```

### Charts
```javascript
const queryParameters = { types: ['most-played'], l: 'en-us' };
await music.api.music('/v1/catalog/{{storefrontId}}/charts', queryParameters);
```

---

## Personalized Content

### Library - Adding Content
```javascript
const playlistId = 'pl.23456789';
await music.api.music('/v1/me/library', { ids: [playlistId] }, {
  fetchOptions: { method: 'POST' }
});
```

### Recommendations
```javascript
await music.api.music('/v1/me/recommendations');
```

### Recently Played
```javascript
await music.api.music('/v1/me/recent/played');
```

### Heavy Rotation
```javascript
await music.api.music('/v1/me/history/heavy-rotation');
```

---

## Storefronts

```javascript
// Get specific storefront
await music.api.music('/v1/storefronts/us');

// Get multiple storefronts
await music.api.music('/v1/storefronts', { ids: ['us', 'jp'] });
```
