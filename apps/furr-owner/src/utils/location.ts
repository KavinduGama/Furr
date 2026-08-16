import * as Location from 'expo-location';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance between two GPS coordinates in kilometers using Haversine formula.
 * Zero-cost alternative to Google Distance Matrix API.
 */
export function calculateDistanceKm(
  coord1: GeoCoordinate,
  coord2: GeoCoordinate
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Gets the user's current GPS location with high accuracy, falling back gracefully.
 */
export async function getCurrentLocation(): Promise<GeoCoordinate | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.warn('Error fetching device location:', error);
    return null;
  }
}
