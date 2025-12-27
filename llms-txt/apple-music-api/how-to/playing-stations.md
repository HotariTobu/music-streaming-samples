# Playing Apple Music Stations

Play various types of Apple Music stations including Live Radio, Catalog Stations, and Personal Stations.

## Apple Music Live Radio

Play an Apple Music Live Radio station for a storefront.

### Request Music Data

To request data about the live stations available in a user's storefront:

```javascript
const music = MusicKit.getInstance();

await music.api.music('/v1/catalog/{{storefrontId}}/stations', {
  'filter[featured]': 'apple-music-live-radio',
});
```

**Sample Response:**

```json
{
  "data": {
    "data": [
      {
        "id": "ra.978194965",
        "type": "stations",
        "href": "/v1/catalog/us/stations/ra.978194965",
        "attributes": {
          "name": "Apple Music 1",
          ...
        }
      },
      {
        "id": "ra.1498155548",
        "type": "stations",
        "attributes": {
          "name": "Apple Music Hits",
          ...
        }
      },
      {
        "id": "ra.1498157166",
        "type": "stations",
        "attributes": {
          "name": "Apple Music Country",
          ...
        }
      }
    ]
  }
}
```

For more information on storefronts, see [Storefronts and Localization](https://developer.apple.com/documentation/applemusicapi/storefronts_and_localization).

### Playback with a Live Radio Station Identifier

```javascript
const music = MusicKit.getInstance();
await music.setQueue({ station: 'ra.1498155548' });
```

### Control Playback

With a queue set, call `play()` to initiate playback:

```javascript
const music = MusicKit.getInstance();
await music.play();
```

> **Important**
>
> You must call the `stop()` to end playback for live radio.

```javascript
const music = MusicKit.getInstance();
await music.stop();
```

For more information, see [Apple Music Stations](https://developer.apple.com/documentation/applemusicapi/apple_music_stations).

---

## Catalog Stations

Play a Catalog Station.

### Request Music Data

To request data about stations available in the Jazz genre:

```javascript
const music = MusicKit.getInstance();
await music.api.music('/v1/catalog/{{storefrontId}}/station-genres/1149486299/stations');
```

**Sample Response:**

```json
{
  "data": {
    "data": [
      {
        "id": "ra.985496511",
        "type": "stations",
        "href": "/v1/catalog/us/stations/ra.985496511",
        "attributes": {
          "name": "Smooth Jazz",
          "playParams": {
            "id": "ra.985496511",
            "kind": "radioStation",
            "format": "tracks",
            "stationHash": "CgkIBBoFv_f11QMQAg",
            "mediaType": 0
          },
          "mediaKind": "audio",
          "artwork": {...},
          "editorialNotes": {
            "name": "Smooth Jazz",
            "short": "Easy, breezy listening."
          },
          "url": "https://music.apple.com/us/station/smooth-jazz/ra.985496511",
          "isLive": false
        }
      }
    ]
  }
}
```

### Playback with a Catalog Station Identifier

```javascript
const music = MusicKit.getInstance();
await music.setQueue({ station: 'ra.985496511' });
await music.play();
```

For more information, see [Get a Catalog Station](https://developer.apple.com/documentation/applemusicapi/get_a_catalog_station).

---

## User's Personal Station

Play the current user's personal Apple Music Station.

### Request Music Data

To request data about the personal stations available:

```javascript
const music = MusicKit.getInstance();

await music.api.music('/v1/catalog/{{storefrontId}}/stations', {
  'filter[identity]': 'personal',
});
```

**Sample Response:**

```json
{
  "data": {
    "data": [
      {
        "id": "ra.u-57c785898174362a1abb70ff757aa95g",
        "type": "stations",
        "href": "/v1/catalog/us/stations/ra.u-57c785898174362a1abb70ff757aa95g",
        "attributes": {
          "name": "Jane Appleseed's Station",
          ...
        }
      }
    ]
  }
}
```

### Playback with a Personal Station Identifier

```javascript
const music = MusicKit.getInstance();
await music.setQueue({ station: 'ra.u-57c785898174362a1abb70ff757aa95g' });
await music.play();
```

For more information, see [Get The User's Personal Apple Music Station](https://developer.apple.com/documentation/applemusicapi/get_the_user_s_personal_apple_music_station).
