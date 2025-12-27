# MusicKit on the Web (v3) Documentation

MusicKit on the Web is a JavaScript library that allows you to integrate Apple Music into your web applications. This documentation covers MusicKit JS v3.

**Official Documentation:** https://js-cdn.music.apple.com/musickit/v3/docs/

---

## Essentials

Get started with MusicKit on the Web.

- [Getting Started](essentials/getting-started.md) - Setup and configuration
- [User Authorization](essentials/user-authorization.md) - Sign in and authorize users
- [Accessing Music Content](essentials/accessing-music-content.md) - Fetch catalog and library data

---

## How-To Guides

Practical guides for common tasks.

- [HTML Embeds](how-to/html-embeds.md) - Embed Apple Music content
- [Paginated Requests](how-to/paginated-requests.md) - Handle large result sets
- [Playing Stations](how-to/playing-stations.md) - Play Apple Music radio stations
- [Playing Music Videos](how-to/playing-music-videos.md) - Video playback setup
- [Using Album Art](how-to/using-album-art.md) - Display artwork images

---

## Reference

### JavaScript API

Core JavaScript API documentation.

- [MusicKit](reference/javascript/musickit.md) - Global namespace and configuration
- [MusicKit Instance](reference/javascript/musickit-instance.md) - Instance properties and methods
- [API](reference/javascript/api.md) - Passthrough API for Apple Music API requests
- [Events](reference/javascript/events.md) - Event handling and callbacks
- [MKError](reference/javascript/mkerror.md) - Error codes and handling
- [Queue](reference/javascript/queue.md) - Queue management and QueueOptions

### Web Components

Pre-built UI components for Apple Music integration.

- [Artwork](reference/web-components/artwork.md) - Display album art and images
- [Artwork Lockup](reference/web-components/artwork-lockup.md) - Content lockup with controls
- [Card Player](reference/web-components/card-player.md) - Full-featured player card
- [Music Video Player](reference/web-components/music-video-player.md) - Video playback component
- [Playback Controls](reference/web-components/playback-controls.md) - Play, pause, skip controls
- [Progress](reference/web-components/progress.md) - Playback progress bar
- [Volume](reference/web-components/volume.md) - Volume control slider

---

## Tech Notes

Additional technical information and migration guides.

- [Migrating to v3](tech-notes/migrating-to-v3.md) - Upgrade from v1 to v3
- [Native WebViews](tech-notes/native-webviews.md) - Mobile app WebView considerations
- [Support](tech-notes/support.md) - Get help and report issues

---

## Quick Start

```html
<script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" async></script>
```

```javascript
document.addEventListener('musickitloaded', async function() {
  const music = await MusicKit.configure({
    developerToken: 'YOUR_DEVELOPER_TOKEN',
    app: {
      name: 'My App',
      build: '1.0.0'
    }
  });

  // Authorize user
  await music.authorize();

  // Search for content
  const { data } = await music.api.music('/v1/catalog/{{storefrontId}}/search', {
    term: 'Taylor Swift',
    types: ['songs', 'albums']
  });

  // Play a song
  await music.setQueue({ song: '1561837008', startPlaying: true });
});
```
