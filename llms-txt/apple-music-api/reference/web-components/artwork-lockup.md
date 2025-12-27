# Apple Music Artwork Lockup

A lockup that displays artwork for a given content type with controls to initiate playback and add content to library.

## Basic Usage

```html
<apple-music-artwork-lockup type="album" content-id="1552791073"></apple-music-artwork-lockup>
```

---

## Supported Content Types

The lockup supports different content types:

- **Playlist Lockup** - Display playlist artwork with play and add controls
- **Album Lockup** - Display album artwork with play and add controls
- **Song Lockup** - Display song artwork with play and add controls
- **Music Video Lockup** - Display music video artwork with play and add controls

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `contentId` | `content-id` | The content ID | `string` | `undefined` |
| `type` | `type` | The type of content for this lockup. Can be `album`, `musicVideo`, `playlist`, or `song` | `string` | `undefined` |

---

## Examples

```html
<!-- Album lockup -->
<apple-music-artwork-lockup type="album" content-id="1552791073"></apple-music-artwork-lockup>

<!-- Playlist lockup -->
<apple-music-artwork-lockup type="playlist" content-id="pl.d133de76fb4f4ccf98846231899874c0"></apple-music-artwork-lockup>

<!-- Song lockup -->
<apple-music-artwork-lockup type="song" content-id="1561837008"></apple-music-artwork-lockup>

<!-- Music video lockup -->
<apple-music-artwork-lockup type="musicVideo" content-id="1564535330"></apple-music-artwork-lockup>
```
