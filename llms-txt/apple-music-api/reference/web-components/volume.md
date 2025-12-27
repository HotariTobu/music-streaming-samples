# Apple Music Volume

A volume control component with mute button and slider.

## Basic Usage

```html
<apple-music-volume></apple-music-volume>
```

---

## Features

The volume component includes:
- **Mute button** - Toggle audio mute
- **Volume slider** - Adjust volume level (0 to 1)

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `theme` | `theme` | Color theme. Can be `'light'`, `'dark'`, or `'auto'` | `string` | `'light'` |

---

## Example

```html
<!-- Light theme (default) -->
<apple-music-volume></apple-music-volume>

<!-- Dark theme -->
<apple-music-volume theme="dark"></apple-music-volume>

<!-- Auto theme (follows system preference) -->
<apple-music-volume theme="auto"></apple-music-volume>
```
