# MusicKit Global Namespace

Use the MusicKit namespace to configure MusicKit on the Web and access the singleton instance. It is also a global variable on the `window` object, and a namespace for other utils and enums.

## Methods

### configure

See [Getting Started: Configuring MusicKit on the Web](../../essentials/getting-started.md) for more information.

**Declaration:**
```typescript
configure(config: MusicKitConfiguration): Promise<MusicKitInstance>
```

**Parameters:**
- `config` **Required**
  - **Type:** `MusicKitConfiguration`

#### MusicKitConfiguration

The `MusicKitConfiguration` object supports the following properties:

- `developerToken` **Required**
  - **Type:** `String`
  - See: [Getting Started](../../essentials/getting-started.md)

- `app` **Required**
  - **Type:** `Object`
  - `app.name` **Required** - The name of your application during authorization
  - `app.build` *Optional* - Current build number or version
  - `app.icon` *Optional* - URL to the image (152px x 152px recommended)

- `bitrate` *Optional*
  - **Type:** `MusicKit.PlaybackBitrate`
  - Can be used to target a bit rate for playback

- `storefrontId` *Optional*
  - **Type:** `String`
  - Used for the `{{storefrontId}}` token in API paths

**Return Value:** Returns a Promise that resolves with the configured MusicKit Instance.

---

### getInstance

Access the configured MusicKit Instance singleton.

**Declaration:**
```typescript
getInstance(): MusicKitInstance
```

**Note:** `configure()` must have been called first. Otherwise returns `undefined`.

**Example:**
```javascript
const music = MusicKit.getInstance();
```

---

### formatArtworkURL

Takes an `artwork` object from Apple Music API responses and returns a usable image URL.

**Declaration:**
```typescript
formatArtworkURL(artwork: Object, width: Number, height: Number): String
```

**Parameters:**
- `artwork` **Required** - Artwork object from API response
- `width` *Optional* - Desired width (default: artwork.width)
- `height` *Optional* - Desired height (default: artwork.height)

**Return Value:** A URL string that can be used as an image source.

---

## Enums

### PlaybackBitrate

The playback bit rate of the music player.

- `MusicKit.PlaybackBitrate.HIGH` - 256 kbps
- `MusicKit.PlaybackBitrate.STANDARD` - 64 kbps

### PlaybackStates

The playback states of the music player.

- `MusicKit.PlaybackStates.none` - Player has not attempted to start playback
- `MusicKit.PlaybackStates.loading` - Loading of MediaItem has begun
- `MusicKit.PlaybackStates.playing` - Currently playing media
- `MusicKit.PlaybackStates.paused` - Playback has been paused
- `MusicKit.PlaybackStates.stopped` - Playback has been stopped
- `MusicKit.PlaybackStates.ended` - Playback of MediaItem has ended
- `MusicKit.PlaybackStates.seeking` - Player has started a seek operation
- `MusicKit.PlaybackStates.waiting` - Playback is delayed pending another operation
- `MusicKit.PlaybackStates.stalled` - Trying to fetch media data but not received yet
- `MusicKit.PlaybackStates.completed` - Playback of all MediaItems in queue has ended

### PlayerRepeatMode

Possible values for repeat mode.

- `MusicKit.PlayerRepeatMode.all` - Current queue will be repeated
- `MusicKit.PlayerRepeatMode.none` - No repeat mode
- `MusicKit.PlayerRepeatMode.one` - Current MediaItem will be repeated

### PlayerShuffleMode

Possible values for shuffle mode.

- `MusicKit.PlayerShuffleMode.off` - Queue will not be shuffled
- `MusicKit.PlayerShuffleMode.songs` - Queue will shuffle songs
