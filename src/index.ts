/**
 * exif-geo-utils
 * Lightweight GPS coordinate utilities for image geotagging.
 *
 * Convert between DMS and decimal degrees, validate coordinates,
 * calculate distances, and format for EXIF metadata.
 *
 * @see https://geoimagetagger.com
 * @author Tosief Abbas
 * @license MIT
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: "N" | "S" | "E" | "W";
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface DMSCoordinate {
  latitude: DMS;
  longitude: DMS;
}

export interface ExifGPS {
  GPSLatitude: [number, number, number];
  GPSLatitudeRef: "N" | "S";
  GPSLongitude: [number, number, number];
  GPSLongitudeRef: "E" | "W";
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ─── Conversion ──────────────────────────────────────────────────────

/**
 * Convert decimal degrees to DMS (degrees, minutes, seconds).
 *
 * @example
 * decimalToDMS(43.6426, "lat")
 * // { degrees: 43, minutes: 38, seconds: 33.36, direction: "N" }
 */
export function decimalToDMS(
  decimal: number,
  type: "lat" | "lng"
): DMS {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = parseFloat(((minutesFloat - minutes) * 60).toFixed(4));

  let direction: DMS["direction"];
  if (type === "lat") {
    direction = decimal >= 0 ? "N" : "S";
  } else {
    direction = decimal >= 0 ? "E" : "W";
  }

  return { degrees, minutes, seconds, direction };
}

/**
 * Convert DMS (degrees, minutes, seconds) to decimal degrees.
 *
 * @example
 * dmsToDecimal({ degrees: 43, minutes: 38, seconds: 33.36, direction: "N" })
 * // 43.6426
 */
export function dmsToDecimal(dms: DMS): number {
  const decimal = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  const sign = dms.direction === "S" || dms.direction === "W" ? -1 : 1;
  return parseFloat((sign * decimal).toFixed(6));
}

/**
 * Convert a coordinate pair from decimal to DMS.
 */
export function coordinateToDMS(coord: Coordinate): DMSCoordinate {
  return {
    latitude: decimalToDMS(coord.latitude, "lat"),
    longitude: decimalToDMS(coord.longitude, "lng"),
  };
}

/**
 * Convert a DMS coordinate pair to decimal.
 */
export function dmsToCoordinate(dms: DMSCoordinate): Coordinate {
  return {
    latitude: dmsToDecimal(dms.latitude),
    longitude: dmsToDecimal(dms.longitude),
  };
}

// ─── EXIF Formatting ─────────────────────────────────────────────────

/**
 * Format a coordinate pair for EXIF GPS metadata.
 * Returns the GPS tags in the format expected by EXIF writers.
 *
 * @example
 * toExifGPS({ latitude: 43.6426, longitude: -79.3871 })
 * // {
 * //   GPSLatitude: [43, 38, 33.36],
 * //   GPSLatitudeRef: "N",
 * //   GPSLongitude: [79, 23, 13.56],
 * //   GPSLongitudeRef: "W"
 * // }
 */
export function toExifGPS(coord: Coordinate): ExifGPS {
  const lat = decimalToDMS(coord.latitude, "lat");
  const lng = decimalToDMS(coord.longitude, "lng");

  return {
    GPSLatitude: [lat.degrees, lat.minutes, lat.seconds],
    GPSLatitudeRef: lat.direction as "N" | "S",
    GPSLongitude: [lng.degrees, lng.minutes, lng.seconds],
    GPSLongitudeRef: lng.direction as "E" | "W",
  };
}

/**
 * Parse EXIF GPS tags back to a decimal coordinate pair.
 */
export function fromExifGPS(exif: ExifGPS): Coordinate {
  return {
    latitude: dmsToDecimal({
      degrees: exif.GPSLatitude[0],
      minutes: exif.GPSLatitude[1],
      seconds: exif.GPSLatitude[2],
      direction: exif.GPSLatitudeRef,
    }),
    longitude: dmsToDecimal({
      degrees: exif.GPSLongitude[0],
      minutes: exif.GPSLongitude[1],
      seconds: exif.GPSLongitude[2],
      direction: exif.GPSLongitudeRef,
    }),
  };
}

// ─── Validation ──────────────────────────────────────────────────────

/**
 * Check if a latitude value is valid (-90 to 90).
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === "number" && !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Check if a longitude value is valid (-180 to 180).
 */
export function isValidLongitude(lng: number): boolean {
  return typeof lng === "number" && !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Check if a coordinate pair is valid.
 */
export function isValidCoordinate(coord: Coordinate): boolean {
  return isValidLatitude(coord.latitude) && isValidLongitude(coord.longitude);
}

// ─── Distance ────────────────────────────────────────────────────────

/**
 * Calculate the distance between two coordinates using the Haversine formula.
 * Returns distance in meters.
 *
 * @example
 * haversineDistance(
 *   { latitude: 48.8566, longitude: 2.3522 },  // Paris
 *   { latitude: 51.5074, longitude: -0.1278 }   // London
 * )
 * // 343556 (meters)
 */
export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;

  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

// ─── Parsing ─────────────────────────────────────────────────────────

/**
 * Parse a DMS string to decimal degrees.
 * Supports formats like:
 * - "43°38'33.36\"N"
 * - "43 38 33.36 N"
 * - "N 43 38 33.36"
 *
 * @example
 * parseDMSString("43°38'33.36\"N")
 * // 43.6426
 */
export function parseDMSString(input: string): number | null {
  const cleaned = input.trim().toUpperCase();

  // Match patterns like: 43°38'33.36"N or N 43 38 33.36
  const patterns = [
    /^([NSEW])\s*(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*/,
    /^(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*([NSEW])$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let direction: string, degrees: number, minutes: number, seconds: number;

      if (/[NSEW]/.test(match[1]) && match[1].length === 1) {
        direction = match[1];
        degrees = parseFloat(match[2]);
        minutes = parseFloat(match[3]);
        seconds = parseFloat(match[4]);
      } else {
        degrees = parseFloat(match[1]);
        minutes = parseFloat(match[2]);
        seconds = parseFloat(match[3]);
        direction = match[4];
      }

      const decimal = degrees + minutes / 60 + seconds / 3600;
      const sign = direction === "S" || direction === "W" ? -1 : 1;
      return parseFloat((sign * decimal).toFixed(6));
    }
  }

  // Try plain decimal
  const num = parseFloat(cleaned);
  if (!isNaN(num)) return num;

  return null;
}

/**
 * Parse a coordinate string like "43.6426, -79.3871" or "43.6426 -79.3871".
 */
export function parseCoordinateString(input: string): Coordinate | null {
  const cleaned = input.trim();
  const parts = cleaned.split(/[,\s]+/).filter(Boolean);

  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isValidLatitude(lat) && isValidLongitude(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  return null;
}

// ─── Formatting ──────────────────────────────────────────────────────

/**
 * Format a decimal degree value as a DMS string.
 *
 * @example
 * formatDMS(43.6426, "lat")
 * // "43°38'33.36\"N"
 */
export function formatDMS(decimal: number, type: "lat" | "lng"): string {
  const dms = decimalToDMS(decimal, type);
  return `${dms.degrees}°${dms.minutes}'${dms.seconds}"${dms.direction}`;
}

/**
 * Format a coordinate pair as a DMS string.
 *
 * @example
 * formatCoordinateDMS({ latitude: 43.6426, longitude: -79.3871 })
 * // "43°38'33.36\"N, 79°23'13.56\"W"
 */
export function formatCoordinateDMS(coord: Coordinate): string {
  return `${formatDMS(coord.latitude, "lat")}, ${formatDMS(coord.longitude, "lng")}`;
}

/**
 * Format a coordinate pair as a decimal string.
 *
 * @example
 * formatCoordinateDecimal({ latitude: 43.6426, longitude: -79.3871 })
 * // "43.6426, -79.3871"
 */
export function formatCoordinateDecimal(coord: Coordinate): string {
  return `${coord.latitude}, ${coord.longitude}`;
}

/**
 * Generate a Google Maps URL for a coordinate.
 */
export function toGoogleMapsURL(coord: Coordinate): string {
  return `https://www.google.com/maps?q=${coord.latitude},${coord.longitude}`;
}

/**
 * Generate an OpenStreetMap URL for a coordinate.
 */
export function toOSMURL(coord: Coordinate, zoom: number = 15): string {
  return `https://www.openstreetmap.org/?mlat=${coord.latitude}&mlon=${coord.longitude}#map=${zoom}/${coord.latitude}/${coord.longitude}`;
}

// ─── Bounding Box ────────────────────────────────────────────────────

/**
 * Calculate a bounding box around a coordinate with a given radius in meters.
 */
export function boundingBox(
  center: Coordinate,
  radiusMeters: number
): BoundingBox {
  const latDelta = (radiusMeters / 6371000) * (180 / Math.PI);
  const lngDelta =
    (radiusMeters / (6371000 * Math.cos((center.latitude * Math.PI) / 180))) *
    (180 / Math.PI);

  return {
    north: parseFloat((center.latitude + latDelta).toFixed(6)),
    south: parseFloat((center.latitude - latDelta).toFixed(6)),
    east: parseFloat((center.longitude + lngDelta).toFixed(6)),
    west: parseFloat((center.longitude - lngDelta).toFixed(6)),
  };
}
