# Apple Music Progress

A progress bar component that displays playback progress and allows seeking.

## Basic Usage

```html
<apple-music-progress></apple-music-progress>
```

---

## Features

The progress component includes:
- **Elapsed time display** - Shows current playback position
- **Progress slider** - Visual progress indicator with seek functionality
- **Remaining time display** - Shows time remaining in the track

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `theme` | `theme` | Color theme. Can be `'light'`, `'dark'`, or `'auto'` | `string` | `'light'` |

---

## Example

```html
<!-- Light theme (default) -->
<apple-music-progress></apple-music-progress>

<!-- Dark theme -->
<apple-music-progress theme="dark"></apple-music-progress>

<!-- Auto theme (follows system preference) -->
<apple-music-progress theme="auto"></apple-music-progress>
```
