# Playing Music Videos

Integrate Music Videos for playback in your website.

## Overview

> **Important**
>
> In order to play [Music Videos](https://developer.apple.com/documentation/applemusicapi/music_videos) there must be a video container specified to tell MusicKit where to inject the video player.

There are two ways to specify a video container.

### Option 1: Using a predefined element ID

Adding an element with an id of `apple-music-video-container`:

```html
<div id="apple-music-video-container"></div>
```

### Option 2: Assigning an element programmatically

Assigning an element to the `videoContainerElement` property on the MusicKit instance:

```javascript
const music = MusicKit.getInstance();
const el = document.getElementById('some-element-id');
music.videoContainerElement = el;
```

## Playback

With a video container set, music videos can be queued and played like any other content type:

```javascript
const music = MusicKit.getInstance();
await music.setQueue({ musicVideo: '1565280313' });
await music.play();
```

For more information, see [Music Videos](https://developer.apple.com/documentation/applemusicapi/music_videos).
