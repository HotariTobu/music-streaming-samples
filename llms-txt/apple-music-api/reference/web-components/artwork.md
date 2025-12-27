# Apple Music Artwork

Display content artwork — for example album covers, playlist art, or artist images.

## Basic Usage

```html
<apple-music-artwork></apple-music-artwork>
```

---

## Defining the Artwork Source in JavaScript

The `source` value can be an Artwork Object as returned from the Apple Music API. This provides the component with the aspect ratio of the image, so it can define the appropriate height before the image content loads, as well as the background color that can act as a placeholder while the image content loads.

```html
<apple-music-artwork width="250"></apple-music-artwork>

<script>
  // Example partial response from Apple Music API
  const album = {
    attributes: {
      artwork: {
        width: 3000,
        height: 3000,
        url: 'https://is2-ssl.mzstatic.com/image/thumb/Music124/v4/.../21UMGIM09915.rgb.jpg/{w}x{h}bb.{f}',
        bgColor: '5c3c23',
        textColor1: 'fceebe',
        textColor2: 'f6dea6',
        textColor3: 'dcca9f',
        textColor4: 'd7bd8b',
      },
      name: "Fearless (Taylor's Version)",
    },
  };

  const artwork = document.querySelector('apple-music-artwork');
  artwork.source = album.attributes.artwork;
  artwork.alt = album.attributes.name;
</script>
```

---

## Defining the Artwork Source in HTML

You can also pass the artwork template URL directly, which is the `attributes.url` property from the Artwork Object.

```html
<apple-music-artwork
  alt="Fearless (Taylor's Version)"
  source="https://is2-ssl.mzstatic.com/image/thumb/Music124/v4/.../21UMGIM09915.rgb.jpg/{w}x{h}bb.{f}"
  width="250"
></apple-music-artwork>
```

---

## Auto-Display Now Playing Artwork

If no `source` value is given, the component will automatically display the artwork contained in `nowPlayingItem` (when applicable).

---

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
| `alt` | `alt` | Alt text for the image | `string` | `undefined` |
| `lazyLoad` | `lazy-load` | If `true`, the loading attribute of the image will be set to lazy, which will instruct the browser to only load the image content when the element is visible on the page, if supported | `boolean` | `false` |
| `source` | `source` | Determines the artwork to display. Can be a templated artwork string or an Artwork object as returned from Media API | `Artwork \| string` | `undefined` |
| `width` | `width` | The width, in pixels, at which the artwork should be displayed. **Required** | `string` | - |
