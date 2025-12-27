# MKError

MusicKit on the Web uses error codes to describe errors that may occur when using MusicKit, including server and local errors.

## Error Codes

### Authorization Errors

| Code | Description |
|------|-------------|
| `ACCESS_DENIED` | You don't have permission to access the endpoint, MediaItem, or content |
| `AUTHORIZATION_ERROR` | The authorization was rejected |
| `TOKEN_EXPIRED` | The user token has expired |
| `UNAUTHORIZED_ERROR` | Request wasn't accepted because authorization is missing or invalid due to an issue with the developer token |

### Content Errors

| Code | Description |
|------|-------------|
| `AGE_VERIFICATION` | Action blocked due to age verification |
| `CONTENT_EQUIVALENT` | The content has an equivalent for the user's storefront |
| `CONTENT_RESTRICTED` | You don't have permission to access this content, due to content restrictions |
| `CONTENT_UNAVAILABLE` | The content requested is not available |
| `CONTENT_UNSUPPORTED` | The content is not supported on the current platform |

### Configuration Errors

| Code | Description |
|------|-------------|
| `CONFIGURATION_ERROR` | A MusicKit on the Web configuration error |
| `INVALID_ARGUMENTS` | The parameters provided for this method are invalid |
| `UNSUPPORTED_ERROR` | The operation is not supported |

### DRM & Playback Errors

| Code | Description |
|------|-------------|
| `MEDIA_CERTIFICATE` | The VM certificate could not be applied |
| `MEDIA_DESCRIPTOR` | The MediaItem descriptor is invalid |
| `MEDIA_KEY` | A DRM key could not be generated |
| `MEDIA_LICENSE` | A DRM license error |
| `MEDIA_PLAYBACK` | A media playback error |
| `MEDIA_SESSION` | An EME session could not be created |
| `OUTPUT_RESTRICTED` | Content cannot be played due to HDCP error |
| `PLAYREADY_CBC_ENCRYPTION_ERROR` | Browser supports Playready DRM but not CBCS encryption |
| `WIDEVINE_CDM_EXPIRED` | Browser's Widevine CDM implementation is old and insecure |

### Network & Server Errors

| Code | Description |
|------|-------------|
| `INTERNAL_ERROR` | An error internal to media-api occurred |
| `NETWORK_ERROR` | A network error |
| `NOT_FOUND` | The resource was not found |
| `PARSE_ERROR` | Error encountered while parsing results |
| `QUOTA_EXCEEDED` | You have exceeded the Apple Music API quota |
| `REQUEST_ERROR` | A request error has occurred |
| `SERVER_ERROR` | A server error has occurred |
| `SERVICE_UNAVAILABLE` | The MusicKit service could not be reached |

### Subscription & Device Errors

| Code | Description |
|------|-------------|
| `DEVICE_LIMIT` | You have reached your device limit |
| `STREAM_UPSELL` | A stream contention - Upsell error has occurred |
| `SUBSCRIPTION_ERROR` | The user's Apple Music subscription has expired |

### Other Errors

| Code | Description |
|------|-------------|
| `UNKNOWN_ERROR` | An unknown error |
| `USER_INTERACTION_REQUIRED` | Playback requires user interaction first and cannot be automatically started on page load. See [HTMLMediaElement.play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play#usage_notes) |

---

## Handling Errors

Errors can be caught when using async methods or by listening to the `mediaPlaybackError` event:

```javascript
const music = MusicKit.getInstance();

// Method 1: Try/catch with async methods
try {
  await music.setQueue({ song: 'invalid-id' });
} catch (error) {
  console.log(error.errorCode); // e.g., 'NOT_FOUND'
}

// Method 2: Listen for playback errors
music.addEventListener('mediaPlaybackError', (event) => {
  console.log(event.error.errorCode);
});
```
