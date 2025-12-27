# Migrating to MusicKit on the Web 3

## Main Changes from v1 to v3

- `configure()` is now async. It returns a `Promise`.
- No more support for declarative HTML. Support for the `declarativeMarkup` configuration option has been removed. Consider using MusicKit Web Components.
- Flattened APIs. You no longer need to use the `player` object on the instance. For example, in v1 `music.player.play()` becomes `music.play()` in v3.
- New pass-through API to access the [Apple Music API](https://developer.apple.com/documentation/applemusicapi/).
- `setQueue` in v1 would queue up songs that were unplayable. In v3, only songs that are playable will be included in the queue.

---

## API Changes Table

| v1 | v3 | Notes |
|----|----|----|
| `const music = MusicKit.configure({})` | `const music = await MusicKit.configure({})` | You should wait for the promise to resolve before using `MusicKit.getInstance()` |
| `MusicKit.configure({ declarativeMarkup: true })` | Removed | Use MusicKit Web Components instead. See [Getting Started](../essentials/getting-started.md) |
| `music.api.album(1025210938)` | `music.api.music('v1/catalog/{{storefrontId}}/albums/1025210938')` | See [API Reference](../reference/javascript/api.md) for more information |

---

## Migration Checklist

1. **Update configure() calls** - Make them async with `await`
2. **Remove declarativeMarkup** - Switch to Web Components
3. **Flatten player calls** - Change `music.player.play()` to `music.play()`
4. **Update API calls** - Use the new passthrough API method
5. **Handle queue changes** - Only playable songs are now included
