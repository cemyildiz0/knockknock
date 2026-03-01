import type { MultiPolygon, Polygon, Position } from "geojson";

/**
 * Ray-casting algorithm to check if a point is inside a polygon ring.
 */
function pointInRing(point: [number, number], ring: Position[]): boolean {
  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];

    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a lng/lat point is inside a Polygon geometry.
 */
function pointInPolygon(point: [number, number], polygon: Polygon): boolean {
  const coords = polygon.coordinates;
  // Must be inside outer ring
  if (!pointInRing(point, coords[0])) return false;
  // Must not be inside any hole
  for (let i = 1; i < coords.length; i++) {
    if (pointInRing(point, coords[i])) return false;
  }
  return true;
}

/**
 * Check if a lng/lat point is inside a MultiPolygon geometry.
 */
export function pointInMultiPolygon(
  lng: number,
  lat: number,
  geometry: MultiPolygon | Polygon
): boolean {
  const point: [number, number] = [lng, lat];

  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry);
  }

  for (const polygonCoords of geometry.coordinates) {
    const polygon: Polygon = { type: "Polygon", coordinates: polygonCoords };
    if (pointInPolygon(point, polygon)) return true;
  }

  return false;
}
