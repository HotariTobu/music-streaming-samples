# Queue

The Queue represents an ordered list of MediaItems to play, and a pointer to the currently playing item.

## Accessing the Queue

```javascript
const music = MusicKit.getInstance();

// Via setQueue return value
const queue = await music.setQueue({ album: '1025210938' });
console.log(queue.items); // log the MediaItems in the queue

// Via queue property
console.log(music.queue.items);
```

---

## Properties

### currentItem

- **Type:** `MediaItem`
- The item at the `queue.position` index within the `queue.items` array
- This is the `nowPlayingItem` when the Queue is the current queue for the MusicKit Instance

### isEmpty

- **Type:** `Boolean`
- `true` if the `length` of the queue is `0`

### items

- **Type:** `Array<MediaItem>`
- An array of all the MediaItems in the queue

### length

- **Type:** `Number`
- The number of items in the queue

### nextPlayableItem

- **Type:** `MediaItem`
- The next item after the `currentItem` within the queue

### position

- **Type:** `Number`
- The index position of the `nowPlayingItem` in the `Queue.items` Array

### previousPlayableItem

- **Type:** `MediaItem`
- The previous item before the `currentItem` within the queue

---

# QueueOptions

Queue Options are used to instruct MusicKit to generate or amend a queue, for example using the `MusicKitInstance.setQueue()` method.

## Content Options

### Setting Queue Content by IDs

The most common way to select media items is via the ID(s) of the content from the Apple Music catalog. The property name indicates the type and the value represents the ID(s).

**Singular/Plural forms:**
- `album` / `albums`
- `musicVideo` / `musicVideos`
- `playlist` / `playlists`
- `song` / `songs`

```javascript
const music = MusicKit.getInstance();

// Single item (singular form with string)
await music.setQueue({ song: '123' });

// Multiple items (plural form with array)
await music.setQueue({ songs: ['123', '456'] });

// Create queue from playlist and start playing
await music.setQueue({
  playlist: 'pl.d133de76fb4f4ccf98846231899874c0',
  startPlaying: true
});

// Add song after currently playing one
await music.playNext({ song: '1561837008' });
```

### Setting Queue Content by URL

You can provide a URL reference without needing to know the content type. URLs are commonly found under `attributes` in Apple Music API responses.

```javascript
const music = MusicKit.getInstance();
const playlistURL = 'https://music.apple.com/us/playlist/pl.d133de76fb4f4ccf98846231899874c0';

await music.setQueue({ url: playlistURL });
```

---

## Playback Options

### repeatMode

- **Type:** `PlayerRepeatMode`
- **Default:** `undefined`
- Updates the `repeatMode` on the MusicKit Instance when setting the new queue
- If not set, `repeatMode` will not be changed

### startPlaying

- **Type:** `Boolean`
- **Default:** `false`
- Whether to start playback when the queue is updated
- If not set to `true` when `setQueue()` is called, current playback will stop

### startTime

- **Type:** `Number`
- **Default:** `0`
- The number of seconds to seek to in the current queue item after it is created
