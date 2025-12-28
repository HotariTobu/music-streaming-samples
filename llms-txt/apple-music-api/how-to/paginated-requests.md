# Paginated Requests

**See:** [Apple Music API: Fetching Resources by Page](https://developer.apple.com/documentation/applemusicapi/fetching_resources_by_page)

The [Apple Music API](https://developer.apple.com/documentation/applemusicapi) supports pagination for requests that return an array of objects using the `limit` and `offset` query parameters. `limit` sets the maximum number of objects returned in a single response, and `offset` determines the first object in the response. The `next` property, adjacent to the nested `data` property in the API response, indicates at least one additional page of objects is available.

## Limit Constraints by Endpoint

| Endpoint Type | Default | Maximum |
|---------------|---------|---------|
| Search results | 5 | 25 |
| Playlist tracks | 25 | 100 |
| Library albums/songs | 25 | 100 |
| Charts | 20 | 200 |
| Recently played | 10 | 10 |
| Heavy rotation | - | - |
| Recommendations | - | - |

## Pagination Query Parameter Usage

This example is meant to explain the use of the query params, but is likely more simple than an actual app would use.

```javascript
const playlistId = 'pl.9b8a976ba78741d9925e6e9a050703de';
const urlPath = `/v1/catalog/{{storefrontId}}/playlists/${playlistId}/tracks`;

// Fetch first page of results, limiting the size of the page
const { data: { data: pageOneData = [] } } = await music.api.music(urlPath, { limit: 10 });

// Fetch the second page, which is starting with the object in the index
// position that is after the last item in the previous page (0-based)
const { data: { data: pageTwoData = [] } } = await music.api.music(urlPath, { limit: 10, offset: 10 });
```

## The `next` Property on Responses

On API endpoints that support pagination query parameters, the response will also contain a `next` property adjacent to the `data` property whenever there is at least one more object on the *next* page. The value of this property is the root-relative URL, with the `offset` query param already set.

```javascript
const playlistId = 'pl.9b8a976ba78741d9925e6e9a050703de';
const urlPath = `/v1/catalog/{{storefrontId}}/playlists/${playlistId}/tracks`;

const { data: { next } } = await music.api.music(urlPath, { limit: 10 });

console.log(next);
// '/v1/catalog/us/playlists/pl.9b8a976ba78741d9925e6e9a050703de/tracks?offset=10'
```

> **Tip**
>
> The value of the `next` property can be used directly in the passthrough API method, for example:
>
> ```javascript
> const playlistId = 'pl.9b8a976ba78741d9925e6e9a050703de';
> const pageOneUrl = `/v1/catalog/{{storefrontId}}/playlists/${playlistId}/tracks`;
>
> const { data: { data: pageOneData, next: pageTwoUrl } } = await music.api.music(pageOneUrl, { limit: 10 });
> const { data: { data: pageTwoData } } = await music.api.music(pageTwoUrl, { limit: 10 });
> ```
>
> The `next` property includes the `offset` query parameter to get the next page of results, but does not carry over the `limit` parameter. If you want to continue to fetch pages of non-default size, you'd need to still provide the `limit` parameter.

## Example: Async Loop to Fetch All Pages and Initiate Playback

This example uses the presence of the `next` property on the response to fetch additional pages until we have all objects in a single array and then starts playback.

```javascript
const pageSize = 25;
const playlistId = 'pl.9b8a976ba78741d9925e6e9a050703de';
const urlPath = `/v1/catalog/{{storefrontId}}/playlists/${playlistId}/tracks`;

const tracks = [];
const music = MusicKit.getInstance();

let hasNextPage = true;

while (hasNextPage) {
  const queryParameters = {
    // Page size is always consistent
    limit: pageSize,
    // The length of the list of objects
    // is also the index of the next object,
    // assuming we started with the 0th object
    offset: tracks.length,
  };

  // Make a request for the next page
  const { data: { data: dataForPage = [], next } } = await music.api.music(urlPath, queryParameters);

  // Push the results to the cumulative array of objects
  tracks.push(...dataForPage);

  // Cast the `next` property to a boolean, where `undefined`
  // becomes `false`, but any URL value would be `true`
  //
  // When this is `false`, then the loop stops
  hasNextPage = !!next;
}

// Outside of the loop, `tracks` now contains results from all pages

// Initiate playback of the `tracks`
await music.setQueue({ items: tracks });
await music.play();
```
