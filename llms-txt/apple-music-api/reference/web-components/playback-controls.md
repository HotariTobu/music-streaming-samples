# Apple Music Playback Controls

A lockup containing play/pause, skip, shuffle, and repeat controls.

## Basic Usage

```html
<apple-music-playback-controls></apple-music-playback-controls>
```

---

## Features

The playback controls include:
- **Shuffle toggle** - Enable/disable shuffle mode
- **Previous button** - Skip to previous track
- **Play/Pause button** - Toggle playback
- **Next button** - Skip to next track
- **Repeat toggle** - Cycle through repeat modes (off, all, one)

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `theme` | `theme` | Color theme. Can be `'light'`, `'dark'`, or `'auto'` | `string` | `'light'` |

---

## Example

```html
<!-- Light theme (default) -->
<apple-music-playback-controls></apple-music-playback-controls>

<!-- Dark theme -->
<apple-music-playback-controls theme="dark"></apple-music-playback-controls>

<!-- Auto theme (follows system preference) -->
<apple-music-playback-controls theme="auto"></apple-music-playback-controls>
```
