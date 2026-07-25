const {
  decimalToDMS,
  dmsToDecimal,
  toExifGPS,
  fromExifGPS,
  isValidCoordinate,
  haversineDistance,
  parseDMSString,
  formatDMS,
  toGoogleMapsURL,
  boundingBox,
} = require("./dist/index.js");

let passed = 0;
let failed = 0;

function assert(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}`);
    console.log(`    Expected: ${e}`);
    console.log(`    Actual:   ${a}`);
    failed++;
  }
}

console.log("\n🧪 Testing exif-geo-utils\n");

// Decimal to DMS
const dms = decimalToDMS(43.6426, "lat");
assert("decimalToDMS degrees", dms.degrees, 43);
assert("decimalToDMS minutes", dms.minutes, 38);
assert("decimalToDMS direction", dms.direction, "N");

// DMS to Decimal
const dec = dmsToDecimal({ degrees: 43, minutes: 38, seconds: 33.36, direction: "N" });
assert("dmsToDecimal", dec, 43.6426);

// Negative longitude
const dmsW = decimalToDMS(-79.3871, "lng");
assert("decimalToDMS negative lng direction", dmsW.direction, "W");

// EXIF GPS
const exif = toExifGPS({ latitude: 43.6426, longitude: -79.3871 });
assert("toExifGPS latRef", exif.GPSLatitudeRef, "N");
assert("toExifGPS lngRef", exif.GPSLongitudeRef, "W");

// Round-trip EXIF
const roundTrip = fromExifGPS(exif);
assert("fromExifGPS round-trip lat", roundTrip.latitude, 43.6426);

// Validation
assert("isValidCoordinate valid", isValidCoordinate({ latitude: 43, longitude: -79 }), true);
assert("isValidCoordinate invalid lat", isValidCoordinate({ latitude: 999, longitude: -79 }), false);

// Haversine distance (Paris to London)
const dist = haversineDistance(
  { latitude: 48.8566, longitude: 2.3522 },
  { latitude: 51.5074, longitude: -0.1278 }
);
assert("haversineDistance Paris-London ~343km", dist > 340000 && dist < 350000, true);

// Parse DMS string
const parsed = parseDMSString("43°38'33.36\"N");
assert("parseDMSString", parsed, 43.6426);

// Format DMS
const formatted = formatDMS(43.6426, "lat");
assert("formatDMS contains degrees", formatted.includes("43°"), true);

// Google Maps URL
const url = toGoogleMapsURL({ latitude: 43.6426, longitude: -79.3871 });
assert("toGoogleMapsURL", url, "https://www.google.com/maps?q=43.6426,-79.3871");

// Bounding box
const bb = boundingBox({ latitude: 43.6426, longitude: -79.3871 }, 1000);
assert("boundingBox north > center", bb.north > 43.6426, true);
assert("boundingBox south < center", bb.south < 43.6426, true);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
