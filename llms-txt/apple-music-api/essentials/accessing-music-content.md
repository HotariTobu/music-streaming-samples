# Accessing Music Content via the Apple Music API

MusicKit on the Web's [passthrough API method](./reference/javascript/api.md) is able to make requests to the [Apple Music API](https://developer.apple.com/documentation/applemusicapi), which gives your app access to the entire Apple Music catalog as well as users' iCloud Music Library.

The [passthrough API method](./reference/javascript/api.md) can make requests to any API documented under the [Apple Music API](https://developer.apple.com/documentation/applemusicapi), with the added convenience of automatically decorating requests with the [Developer Token provided during MusicKit configuration](./getting-started.md#configuring-musickit-on-the-web), as well as the [Music User Token](./user-authorization.md), where necessary, after the user has authorized your app.

## Example making a non-personalized API request

```javascript
const music = MusicKit.getInstance();

const result = await music.api.music(
  `/v1/catalog/us/search`,
  { term: 'SEARCH_TERM', types: 'albums'}
);
```

## Cloud Library API

The Cloud Library gives you access to all the media saved by a user from Apple Music to their Cloud Library.

You can access the Cloud Library API through [Apple Music Web Service API](https://developer.apple.com/documentation/applemusicapi/) methods that start with `v1/me/library`.

### Example

```javascript
const music = MusicKit.getInstance();

// You should check authorization before accessing user's iCloud Music Library:
await music.authorize();

const result = await music.api.music('v1/me/library/albums');
```
