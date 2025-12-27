# Album Art & Images

MusicKit on the Web makes it easy to add images for content from the Apple Music Catalog, for example album covers or playlist art.

The Apple Music API responses will often contain `Artwork` Objects, which can be used to render these images in your app. There are also various values related to the image, such as colors pulled algorithmically from the image contents that can be used for content-specific designs in your app.

## The Artwork Object

**See:** [Apple Music API: Artwork](https://developer.apple.com/documentation/applemusicapi/artwork)

`Artwork` objects are found on responses from the Apple Music API, usually under the `attributes.artwork` property for a resource.

```javascript
const { data: { data: [album] } } = await music.api.music('/v1/catalog/{{storefrontId}}/albums/1560735414');
const artwork = album.attributes.artwork;
```

Here is an example of the `Artwork` object from an Apple Music API response:

```json
{
  "artwork": {
    "width": 3000,
    "height": 3000,
    "url": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/33/fd/32/33fd32b1-0e43-9b4a-8ed6-19643f23544e/21UMGIM26092.rgb.jpg/{w}x{h}bb.jpg",
    "bgColor": "675f9a",
    "textColor1": "f3f6fb",
    "textColor2": "fbeaf0",
    "textColor3": "d7d8e8",
    "textColor4": "decedf"
  }
}
```

> **Important**
>
> Though the Artwork object response has a url property, the value is actually a templated string with placeholder segments `{w}` and `{h}`, which need to be replaced before it can be used as a valid image URL. The [formatArtworkURL](#using-formatartworkurl-to-generate-image-urls) method can be used to simplify using the artwork.url property to generate a valid image URL.

---

## Generating Images from the Artwork Object

### Using the Artwork Web Component

**See:** [Reference: Web Components: Artwork](../reference/web-components/artwork.md)

The `<apple-music-artwork>` component will handle the width and height replacement, set a background color to show while artwork is loading, and supply different image sources for different device pixel ratios. Your app just needs to determine the desired display width, and configure the component appropriately.

**Example:**

In the example below, the `<apple-music-artwork>` component uses the above example `Artwork` object from the Apple Music API. The `width` attribute is setting the desired display width, which the web component uses to create a `<picture>` tag with the various dimensions needed to support modern Retina displays seamlessly.

```html
<apple-music-artwork alt="Lorem Ipsum" width="250"></apple-music-artwork>

<script>
  const artworkElement = document.querySelector('apple-music-artwork');
  artworkElement.source = album.attributes.artwork;
</script>
```

You can also provide just the URL property as the source, which will result in a generic background color, and requires passing the `width` attribute still to determine the display dimensions.

```html
<apple-music-artwork
  alt="Lorem Ipsum"
  source="https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/33/fd/32/33fd32b1-0e43-9b4a-8ed6-19643f23544e/21UMGIM26092.rgb.jpg/{w}x{h}bb.jpg"
  width="250"
></apple-music-artwork>
```

> **Tip**
>
> Remember to add an `alt` attribute to the artwork component, which will be used as the accessible text description for the image.

---

### Using formatArtworkURL to Generate Image URLs

The `formatArtworkURL` method takes an `Artwork` object, and an optional height and width. It returns a URL string that can be used as an image source.

If the `width` or `height` arguments are not passed, this method will use the maximum values, which come from the `Artwork` object itself.

```javascript
const imgSrc = MusicKit.formatArtworkURL(artwork, 200, 200);

console.log(imgSrc);
// "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/33/fd/32/33fd32b1-0e43-9b4a-8ed6-19643f23544e/21UMGIM26092.rgb.jpg/200x200bb.jpg"
```

> **Important**
>
> The actual content dimensions of the image output by the image service that supports these artwork URLs will vary based on the input dimensions. It will always maintain the original height-to-width ratio, and will fit the resulting image within the bounding box of the dimensions provided.
>
> For example, if the original image is, 3000px by 3000px, a square aspect ratio, and you provide a width of 200px and a height of 100px, the resulting image will be 100px by 100px, the maximum size that could fit within the box of the dimensions provided.
