# Events

Events and Event Handling in MusicKit on the Web.

## Loaded Event

The `MusicKit` global is not immediately available when the JS file is evaluated. Listen for the `musickitloaded` event on `document`:

```javascript
document.addEventListener('musickitloaded', async function () {
  // MusicKit global is now defined.
});
```

---

## Events Published on the MusicKit Instance

Listen via `addEventListener` method:

```javascript
const music = MusicKit.getInstance();
music.addEventListener('nowPlayingItemDidChange', ({ item: nowPlayingItem }) => {
  console.log('NOW PLAYING', nowPlayingItem.attributes.name);
});
```

---

## Event Reference

### Authorization Events

| Event | Description |
|-------|-------------|
| `authorizationStatusDidChange` | Authorization status has changed |
| `authorizationStatusWillChange` | Authorization status is about to change |

### Playback State Events

| Event | Description |
|-------|-------------|
| `playbackStateWillChange` | Playback state is about to change |
| `playbackStateDidChange` | Playback state has changed |
| `playbackTimeDidChange` | Current playback time has changed |
| `playbackDurationDidChange` | Playback duration has changed |
| `playbackProgressDidChange` | Playback progress has changed |
| `playbackBitrateDidChange` | Playback bit rate has changed |
| `playbackRateDidChange` | Playback rate has changed |
| `playbackVolumeDidChange` | Player volume has changed |

### Now Playing Events

| Event | Description |
|-------|-------------|
| `nowPlayingItemWillChange` | Currently playing MediaItem is about to change |
| `nowPlayingItemDidChange` | Currently playing MediaItem has changed |
| `metadataDidChange` | MediaItem's metadata has finished loading |

### Queue Events

| Event | Description |
|-------|-------------|
| `queueIsReady` | Queue data loaded and ready to play |
| `queueItemsDidChange` | Items in queue have changed |
| `queuePositionDidChange` | Current queue position has changed |

### Mode Events

| Event | Description |
|-------|-------------|
| `shuffleModeDidChange` | Shuffle mode has changed |
| `repeatModeDidChange` | Repeat mode has changed |

### Media Events

| Event | Description |
|-------|-------------|
| `mediaCanPlay` | Player has enough data to start playback |
| `mediaElementCreated` | New media element was created |
| `mediaItemStateDidChange` | MediaItem's state has changed |
| `mediaPlaybackError` | Player threw an MKError during playback |
| `mediaUpNext` | Next item should be shown |

### Track Events

| Event | Description |
|-------|-------------|
| `audioTrackAdded` | Audio track added to media element |
| `audioTrackChanged` | Playing audio track changed |
| `audioTrackRemoved` | Audio track removed from media element |
| `textTrackAdded` | Text track added |
| `textTrackChanged` | Playing text track changed |
| `textTrackRemoved` | Text track removed |

### Other Events

| Event | Description |
|-------|-------------|
| `configured` | MusicKit instance has been configured |
| `loaded` | MusicKit is loaded |
| `drmUnsupported` | Media playback fell back to preview mode |
| `capabilitiesChanged` | Playback control capabilities changed |
| `playerTypeDidChange` | Player type changed (e.g., music to video) |
| `storefrontCountryCodeDidChange` | Storefront country code changed |
| `storefrontIdentifierDidChange` | Storefront identifier changed |

---

## Event Callback Parameters

### playbackStateDidChange / playbackStateWillChange

```javascript
music.addEventListener('playbackStateDidChange', ({ oldState, state, nowPlayingItem }) => {
  console.log(`Changed from ${oldState} to ${state}`);
});
```

### nowPlayingItemDidChange

```javascript
music.addEventListener('nowPlayingItemDidChange', ({ item }) => {
  const { name, artistName } = item.attributes;
  console.log(`Now playing ${name} by ${artistName}`);
});
```
