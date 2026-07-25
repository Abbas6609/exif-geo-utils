# exif-geo-utils

Lightweight GPS coordinate utilities for image geotagging — convert between DMS and decimal degrees, validate coordinates, calculate distances, and format for EXIF metadata.

Built for [GeoImageTagger](https://geoimagetagger.com) — an AI-powered image geotagging and metadata editor.

## Install

```bash
npm install exif-geo-utils
```

## Usage

### Convert Decimal to DMS

```js
import { decimalToDMS, formatDMS } from "exif-geo-utils";

const dms = decimalToDMS(43.6426, "lat");
// { degrees: 43, minutes: 38, seconds: 33.36, direction: "N" }

formatDMS(43.6426, "lat");
// "43°38'33.36\"N"
```

### Convert DMS to Decimal

```js
import { dmsToDecimal } from "exif-geo-utils";

dmsToDecimal({ degrees: 43, minutes: 38, seconds: 33.36, direction: "N" });
// 43.6426
```

### Format for EXIF Metadata

```js
import { toExifGPS, fromExifGPS } from "exif-geo-utils";

const exif = toExifGPS({ latitude: 43.6426, longitude: -79.3871 });
// {
//   GPSLatitude: [43, 38, 33.36],
//   GPSLatitudeRef: "N",
//   GPSLongitude: [79, 23, 13.56],
//   GPSLongitudeRef: "W"
// }

const coord = fromExifGPS(exif);
// { latitude: 43.6426, longitude: -79.3871 }
```

### Parse DMS Strings

```js
import { parseDMSString, parseCoordinateString } from "exif-geo-utils";

parseDMSString("43°38'33.36\"N");
// 43.6426

parseCoordinateString("43.6426, -79.3871");
// { latitude: 43.6426, longitude: -79.3871 }
```

### Validate Coordinates

```js
import { isValidCoordinate } from "exif-geo-utils";

isValidCoordinate({ latitude: 43.6426, longitude: -79.3871 }); // true
isValidCoordinate({ latitude: 999, longitude: -79.3871 });      // false
```

### Calculate Distance (Haversine)

```js
import { haversineDistance } from "exif-geo-utils";

haversineDistance(
  { latitude: 48.8566, longitude: 2.3522 },   // Paris
  { latitude: 51.5074, longitude: -0.1278 }    // London
);
// 343556 (meters)
```

### Generate Map URLs

```js
import { toGoogleMapsURL, toOSMURL } from "exif-geo-utils";

toGoogleMapsURL({ latitude: 43.6426, longitude: -79.3871 });
// "https://www.google.com/maps?q=43.6426,-79.3871"

toOSMURL({ latitude: 43.6426, longitude: -79.3871 });
// "https://www.openstreetmap.org/?mlat=43.6426&mlon=-79.3871#map=15/43.6426/-79.3871"
```

### Bounding Box

```js
import { boundingBox } from "exif-geo-utils";

boundingBox({ latitude: 43.6426, longitude: -79.3871 }, 1000);
// { north: 43.6516, south: 43.6336, east: -79.3747, west: -79.3995 }
```

## API Reference

| Function | Description |
|---|---|
| `decimalToDMS(decimal, type)` | Convert decimal degrees to DMS |
| `dmsToDecimal(dms)` | Convert DMS to decimal degrees |
| `coordinateToDMS(coord)` | Convert coordinate pair to DMS |
| `dmsToCoordinate(dms)` | Convert DMS pair to coordinate |
| `toExifGPS(coord)` | Format coordinate for EXIF GPS tags |
| `fromExifGPS(exif)` | Parse EXIF GPS tags to coordinate |
| `isValidLatitude(lat)` | Validate latitude (-90 to 90) |
| `isValidLongitude(lng)` | Validate longitude (-180 to 180) |
| `isValidCoordinate(coord)` | Validate coordinate pair |
| `haversineDistance(a, b)` | Distance between two points in meters |
| `parseDMSString(input)` | Parse DMS string to decimal |
| `parseCoordinateString(input)` | Parse "lat, lng" string |
| `formatDMS(decimal, type)` | Format decimal as DMS string |
| `formatCoordinateDMS(coord)` | Format pair as DMS string |
| `formatCoordinateDecimal(coord)` | Format pair as decimal string |
| `toGoogleMapsURL(coord)` | Google Maps link |
| `toOSMURL(coord, zoom?)` | OpenStreetMap link |
| `boundingBox(center, radius)` | Bounding box around a point |

## Why this package?

Working with GPS coordinates in image metadata is surprisingly tricky. Different tools use different formats — EXIF stores GPS as arrays of degrees/minutes/seconds, Google Maps uses decimal degrees, and many cameras output DMS strings with direction letters.

This package was extracted from [GeoImageTagger](https://geoimagetagger.com), where we handle thousands of coordinate conversions daily across our image tools:

- **[Metadata Viewer](https://geoimagetagger.com/tools/metadata-viewer)** — reads GPS coordinates from EXIF, IPTC, and XMP tags and displays them on an interactive map. Uses `fromExifGPS()` and `toGoogleMapsURL()` under the hood.
- **[Metadata Editor](https://geoimagetagger.com/tools/metadata-editor)** — lets users manually set or correct GPS coordinates in their photos. Uses `toExifGPS()` to write coordinates back to EXIF format and `isValidCoordinate()` for input validation.
- **[AI Location Finder](https://geoimagetagger.com/tools/location-finder)** — uses AI to detect where a photo was taken from visual landmarks. Returns decimal coordinates that are converted to EXIF-compatible format using `coordinateToDMS()`.
- **[EXIF Remover](https://geoimagetagger.com/tools/exif-remover)** — strips GPS and other sensitive metadata from images before sharing online. Uses coordinate parsing to show users exactly what location data is being removed.

### Common workflows

| If you need to... | Use this with... |
|---|---|
| Add GPS to photos for Local SEO | [GeoImageTagger](https://geoimagetagger.com) + `toExifGPS()` |
| View where a photo was taken | [Metadata Viewer](https://geoimagetagger.com/tools/metadata-viewer) + `fromExifGPS()` |
| Remove location data for privacy | [EXIF Remover](https://geoimagetagger.com/tools/exif-remover) |
| Compress geotagged images | [Image Compressor](https://geoimagetagger.com/tools/image-compressor) (preserves metadata) |
| Convert HEIC to JPG with GPS intact | [Image Converter](https://geoimagetagger.com/tools/image-converter) |
| Edit photos and keep metadata | [Image Editor](https://geoimagetagger.com/tools/image-editor) |
| Add watermarks to geotagged photos | [Watermark Tool](https://geoimagetagger.com/tools/watermark) |

All tools are free, work in the browser, and require no sign-up.

## License

MIT © [Tosief Abbas](https://geoimagetagger.com)
