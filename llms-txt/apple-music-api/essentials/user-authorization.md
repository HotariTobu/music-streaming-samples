# User Authorization

Allow users to sign in to their Apple Music account, authorize your app to access their Apple Music data, and play music directly from your application.

## Authorization

User authorization is required before your app can access any of the user's Apple Music data via the Apple Music API — including their music library — or for full playback of media. The `authorize` method will open the sign-in and authorization flow, which, when successful, will resolve the promise returned. If the user has previously authorized your app, and their [Music User Token (MUT)](https://developer.apple.com/documentation/applemusicapi/user_authentication_for_musickit) is still valid, then the `authorize` method will resolve without opening the authorize flow.

```javascript
const music = MusicKit.getInstance();
await music.authorize();
```

It's recommended to call the authorize method before any method that requires authorization, to make sure the MUT is available when needed. Alternatively, you can catch API request failures with status `"403"`, and then prompt the user to authorize your app, which gives you more control over when the authorization flow is opened.

[Learn more about handling requests and responses in the Apple Music API](https://developer.apple.com/documentation/applemusicapi/handling_requests_and_responses)

Without user authorization, or for users who do not have a valid Apple Music subscription, your app can still play previews of media from Apple Music, as well as make data requests that do not require the MUT.

```javascript
const music = MusicKit.getInstance();

// Music previews can be played without authorization:
await music.play();

// To play the full length of a song, check authorization before calling play():
await music.authorize();
await music.play();

// You should check authorization before accessing user's iCloud Music Library:
await music.authorize();
const { data: result } = await music.api.music('v1/me/library/albums');

// User's iCloud Music Library Albums
console.log(result.data);
```

## Unauthorization

Unauthorizes your application from using the user's Apple Music account. It will invalidate the music user token.

```javascript
await music.unauthorize();
```
