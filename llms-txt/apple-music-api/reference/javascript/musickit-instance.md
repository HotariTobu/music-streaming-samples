# MusicKit Instance

The MusicKit instance is a singleton accessible via `MusicKit.configure()` or `MusicKit.getInstance()`.

## Properties

### api
- **Type:** `MusicKitAPI`
- Access to the passthrough API method for Apple Music API requests

### bitrate
- **Type:** `MusicKit.PlaybackBitrate`
- The target bit rate for playback

### currentPlaybackDuration
- **Type:** `Number` *read-only*
- Duration of the nowPlayingItem in seconds

### currentPlaybackProgress
- **Type:** `Number` *read-only*
- Progress percentage between 0 and 1

### currentPlaybackTime
- **Type:** `Number` *read-only*
- Current play head position in seconds

### currentPlaybackTimeRemaining
- **Type:** `Number` *read-only*
- Remaining playback time in seconds

### isAuthorized
- **Type:** `Boolean` *read-only*
- True after user successfully authorizes

### isPlaying
- **Type:** `Boolean` *read-only*
- Indicates if player is in playing state

### nowPlayingItem
- **Type:** `MediaItem` or `undefined` *read-only*
- Currently playing MediaItem from Queue

### nowPlayingItemIndex
- **Type:** `Number` *read-only*
- Index of nowPlayingItem in current Queue

### playbackRate
- **Type:** `Number`
- Speed of playback (default: 1.0)

### playbackState
- **Type:** `MusicKit.PlaybackStates` *read-only*
- Current playback state

### previewOnly
- **Type:** `Boolean`
- Set to true to restrict to preview assets only

### queue
- **Type:** `Queue` *read-only*
- Current playback queue

### repeatMode
- **Type:** `MusicKit.PlayerRepeatMode`
- Control repeat behavior

### shuffleMode
- **Type:** `MusicKit.PlayerShuffleMode`
- Control shuffle behavior

### storefrontCountryCode
- **Type:** `String` *read-only*
- User's storefront ID (defaults to 'us')

### storefrontId
- **Type:** `String` *read-only*
- Configured storefront ID

### videoContainerElement
- **Type:** `HTMLVideoElement` or `undefined`
- Container for video playback

### volume
- **Type:** `Number`
- Volume between 0 (muted) and 1 (loudest)

---

## Methods

### addEventListener
Listen to events on the MusicKit Instance.

```javascript
addEventListener(name: String, callback: Function, options?: Object): void
```

### authorize
Opens sign-in and authorization flow.

```javascript
authorize(): Promise<String | void>
```

### changeToMediaAtIndex
Begin playing MediaItem at specified index.

```javascript
changeToMediaAtIndex(index: Number): Promise<void>
```

### changeToMediaItem
Begin playing a specific MediaItem.

```javascript
changeToMediaItem(descriptor: MediaItem | String): Promise<void>
```

### clearQueue
Clears the queue of MediaItems.

```javascript
clearQueue(): Promise<Queue>
```

### mute / unmute
Control audio muting.

```javascript
mute(): void
unmute(): Promise<void>
```

### pause
Pause playback.

```javascript
pause(): void
```

### play
Initiate playback.

```javascript
play(): void
```

### playAt
Insert MediaItem(s) at position in queue.

```javascript
playAt(position: Number, options: QueueOptions): Promise<Queue | void>
```

### playLater
Add MediaItem(s) to end of queue.

```javascript
playLater(options: QueueOptions): Promise<Queue | void>
```

### playNext
Insert MediaItem(s) after nowPlayingItem.

```javascript
playNext(options: QueueOptions, clear?: Boolean): Promise<Queue | void>
```

### removeEventListener
Remove event listener.

```javascript
removeEventListener(name: String, callback: Function): void
```

### seekBackward / seekForward
Seek play head by predetermined seconds.

```javascript
seekBackward(): Promise<void>
seekForward(): Promise<void>
```

### seekToTime
Set play head to specified time.

```javascript
seekToTime(time: Number): Promise<void>
```

### setQueue
Set current playback queue.

```javascript
setQueue(options: QueueOptions): Promise<Queue | void>
```

### skipToNextItem / skipToPreviousItem
Navigate queue items.

```javascript
skipToNextItem(): Promise<void>
skipToPreviousItem(): Promise<void>
```

### stop
Stop currently playing item.

```javascript
stop(): Promise<void>
```

### unauthorize
Revoke user authorization.

```javascript
unauthorize(): Promise<void>
```
