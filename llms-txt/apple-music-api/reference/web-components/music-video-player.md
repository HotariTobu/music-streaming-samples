# Apple Music Video Player

A video player component for playing music videos from Apple Music.

## Basic Usage

```html
<apple-music-video-player></apple-music-video-player>
```

---

## Behavior

By default the `apple-music-video-player` will not be displayed when there is not a music video playing, and "take over" the full browser window when music video playback is initiated.

The player can be rendered inline by setting the `takeover` property to false:

```html
<apple-music-video-player takeover="false"></apple-music-video-player>
```

---

## Features

The video player includes:
- Video playback controls
- Play/Pause button
- Skip back/ahead buttons
- Progress slider with elapsed and remaining time
- Volume control slider
- Full screen toggle
- Close video button

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `takeover` | `takeover` | If `true`, the player will initially be hidden, and then enter full viewport mode when playback starts | `boolean` | `true` |

---

## Related Resources

For more information, see [Music Videos](https://developer.apple.com/documentation/applemusicapi/music_videos) in the Apple Music API documentation.
