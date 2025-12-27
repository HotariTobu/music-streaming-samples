# Getting Started

Some basic setup is required before you begin to use MusicKit on the Web.

## Overview

MusicKit on the Web uses JSON Web Tokens (JWTs) to interact with the [Apple Music API](https://developer.apple.com/documentation/applemusicapi). You must have a signed developer token in order to initialize MusicKit on the Web.

> **Important**
>
> You use a developer token to authenticate yourself as a trusted developer and member of the Apple Developer Program and to use MusicKit on the Web. You can find more information about creating an Apple Music developer token in [Getting Keys and Creating Tokens](https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens).
>
> Token validity is checked up-front by MusicKit on the Web and it must be valid and not expired in order to continue with any further functionality.

## Embedding MusicKit on the Web in Your Webpage

Use the script tags and link to Apple's hosted version of MusicKit on the Web:

```html
<script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" data-web-components async></script>
```

In the example above, there are two *optional* attributes.

The `data-web-components` attribute instructs MusicKit to also load the Web Components, making them available for your application to very quickly add playback controls. If you are only making requests for data, and not supporting playback, then you would not necessarily need to include the Web Components.

The `async` attribute is a web standard for the `<script>` tag which instructs the browser to not block rendering of the page based on the loading of the JavaScript file in the `src` attribute. This is recommended, as MusicKit on the Web itself is initialized asynchronously; see [the `musickitloaded` event](#the-musickitloaded-event) documentation below.

## Configuring MusicKit on the Web

You can configure MusicKit on the Web with a default markup setup to quickly get you started with the library, or with JavaScript to give you more control over the customization of your player. To configure the library using only markup, use the following meta tags:

```html
<head>
  ...
  <meta name="apple-music-developer-token" content="DEVELOPER-TOKEN" />
  <meta name="apple-music-app-name" content="My Cool Web App" />
  <meta name="apple-music-app-build" content="1978.4.1" />
  ...
</head>
```

Configuring the library with JavaScript:

```javascript
document.addEventListener('musickitloaded', async function () {
  // Call configure() to configure an instance of MusicKit on the Web.
  try {
    await MusicKit.configure({
      developerToken: 'DEVELOPER-TOKEN',
      app: {
        name: 'My Cool Web App',
        build: '1978.4.1',
      },
    });
  } catch (err) {
    // Handle configuration error
  }

  // MusicKit instance is available
  const music = MusicKit.getInstance();
});
```

If using the meta tags to configure MusicKit, you would not need to make a `MusicKit.configure(...)` call. However, you still need to wait for [the `musickitloaded` event](#the-musickitloaded-event) before you can access the MusicKit global or configured instance.

## The `musickitloaded` event

MusicKit on the web is initialized asynchronously, which means the `MusicKit` global is not available immediately after the JavaScript file is evaluated. Instead a `musickitloaded` event is fired on the `document` when the `MusicKit` global is available.

Here is an example of how to listen for the `musickitloaded` event on the document:

```javascript
document.addEventListener('musickitloaded', async function () {
  // MusicKit global is now defined.
});
```

> **Important**
>
> You won't see this event listener wrapper in all examples within this documentation, but you may need to add it in your code if you see an error in console similar to:
>
> `ReferenceError: Can't find variable: MusicKit`
