// Location utility functions for ZIP code distance calculations

interface ZipCodeData {
  zip: string;
  lat: number;
  lng: number;
}

// Sample ZIP code coordinates for common areas
const ZIP_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  '90210': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills
  '90403': { lat: 34.0194, lng: -118.4912 }, // Santa Monica
  '10001': { lat: 40.7505, lng: -73.9971 },  // NYC
  '94102': { lat: 37.7849, lng: -122.4094 }, // San Francisco
  '60601': { lat: 41.8827, lng: -87.6233 },  // Chicago
  '33101': { lat: 25.7617, lng: -80.1918 },  // Miami
  '75201': { lat: 32.7767, lng: -96.7970 },  // Dallas
  '98101': { lat: 47.6062, lng: -122.3321 }, // Seattle
  '30301': { lat: 33.7490, lng: -84.3880 },  // Atlanta
  '02101': { lat: 42.3601, lng: -71.0589 },  // Boston
};

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get coordinates for a ZIP code
 */
export function getZipCoordinates(zip: string): { lat: number; lng: number } | null {
  return ZIP_COORDINATES[zip] || null;
}

/**
 * Calculate distance between two ZIP codes
 */
export function calculateZipDistance(zip1: string, zip2: string): number | null {
  const coords1 = getZipCoordinates(zip1);
  const coords2 = getZipCoordinates(zip2);
  
  if (!coords1 || !coords2) {
    return null;
  }
  
  return calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
}

/**
 * Filter and sort listings by distance from user's ZIP code
 */
export function filterListingsByDistance(
  listings: any[],
  userZip: string,
  maxDistance: number = 25
): { nearby: any[], distant: any[] } {
  const nearby: any[] = [];
  const distant: any[] = [];
  
  const userCoords = getZipCoordinates(userZip);
  
  if (!userCoords) {
    // If user ZIP is not in our database, return all as distant
    return { nearby: [], distant: listings };
  }
  
  for (const listing of listings) {
    if (!listing.zip) {
      // If listing has no ZIP, consider it distant
      distant.push({ ...listing, distance: null });
      continue;
    }
    
    const distance = calculateZipDistance(userZip, listing.zip);
    
    if (distance === null) {
      // Unknown ZIP, consider distant
      distant.push({ ...listing, distance: null });
    } else if (distance <= maxDistance) {
      nearby.push({ ...listing, distance });
    } else {
      distant.push({ ...listing, distance });
    }
  }
  
  // Sort by distance
  nearby.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  distant.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  
  return { nearby, distant };
}

/**
 * Add more ZIP codes dynamically (for expansion)
 */
export function addZipCoordinate(zip: string, lat: number, lng: number): void {
  ZIP_COORDINATES[zip] = { lat, lng };
}