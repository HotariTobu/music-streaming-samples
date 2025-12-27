# Native WebViews

## User Authorization in WebViews

In a normal desktop or mobile web browser, MusicKit on the Web will use a separate tab or window to authorize the user when they choose to sign in.

However, the WebViews used inside most mobile applications usually do not support multiple web tabs or windows. In these cases, MusicKit will have to redirect the user to authorize using the only window available in the WebView.

### What Happens During Authorization

1. Your website loaded in the WebView will be unloaded while the user signs in on the authorization website
2. Once the user signs in, they will be redirected back to the same URL on your website they were on before
3. Since your website was unloaded, MusicKit will not know which action you attempted to perform
4. The user will need to retrace their steps in your user interface to complete the action

---

## Improving the User Experience

You can help improve the experience for the user by implementing the following logic:

1. **Before authorization** - Check `MusicKit.getInstance().isAuthorized` to see if authorization has been granted. If not authorized, save some information in [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) that remembers the pending API action.

2. **Make the authorize call** - Call `MusicKit.getInstance().authorize()`

3. **Authorization flow** - Your website will unload and the user will go through the MusicKit authorization flow. Once complete, they return to your website at the same URL.

4. **On page load** - If the sessionStorage data exists, check `MusicKit.getInstance().isAuthorized`. If `true`, attempt the MusicKit API call again. Be sure to clean up the sessionStorage state so the action is not accidentally repeated.

---

## Important Considerations

> **Important:** Most browsers require user interaction to start playback. If your app was unloaded for the authorization flow, then loaded again after successful authorization, the user will still need to trigger play via a click event again. You cannot start playback directly after page load.

---

## Example Implementation

```javascript
// Before making an API call that requires authorization
async function playAlbum(albumId) {
  const music = MusicKit.getInstance();

  if (!music.isAuthorized) {
    // Save pending action to sessionStorage
    sessionStorage.setItem('pendingAction', JSON.stringify({
      action: 'playAlbum',
      albumId: albumId
    }));

    // Initiate authorization (page will unload in WebView)
    await music.authorize();
    return;
  }

  // Proceed with playback
  await music.setQueue({ album: albumId, startPlaying: true });
}

// On page load, check for pending actions
document.addEventListener('musickitloaded', async function() {
  const music = await MusicKit.configure({ /* config */ });

  const pendingAction = sessionStorage.getItem('pendingAction');
  if (pendingAction && music.isAuthorized) {
    const { action, albumId } = JSON.parse(pendingAction);
    sessionStorage.removeItem('pendingAction');

    if (action === 'playAlbum') {
      // Note: User will need to click to trigger playback
      // due to browser autoplay restrictions
    }
  }
});
```
