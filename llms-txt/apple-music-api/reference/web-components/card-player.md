# Apple Music Card Player

A full-featured card player component that automatically updates with information from the `nowPlayingItem`.

## Basic Usage

```html
<apple-music-card-player></apple-music-card-player>
```

---

## Features

The card player includes:
- Album artwork display
- Play/Pause button
- Previous/Next track buttons
- Shuffle toggle
- Repeat toggle
- Automatic updates based on `nowPlayingItem`

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `theme` | `theme` | Color theme. Can be `'light'`, `'dark'`, or `'auto'` | `string` | `'light'` |

---

## Example

```html
<!-- Light theme (default) -->
<apple-music-card-player></apple-music-card-player>

<!-- Dark theme -->
<apple-music-card-player theme="dark"></apple-music-card-player>

<!-- Auto theme (follows system preference) -->
<apple-music-card-player theme="auto"></apple-music-card-player>
```
