export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

// Fallback default coordinates (San Francisco City Center)
export const DEFAULT_COORDS: GeoPosition = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 15,
  timestamp: Date.now(),
};

class GeoService {
  /**
   * Retrieves the current user GPS coordinates with high accuracy
   */
  public async getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your device or browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed ?? undefined,
            heading: pos.coords.heading ?? undefined,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          let msg = 'Failed to obtain GPS coordinates.';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              msg = 'Location permission was denied. Please enable location permissions in browser settings.';
              break;
            case err.POSITION_UNAVAILABLE:
              msg = 'GPS signal is currently unavailable. Using approximate location.';
              break;
            case err.TIMEOUT:
              msg = 'Location request timed out. Please check your network connection.';
              break;
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  }

  /**
   * Starts watching user location in real-time
   */
  public watchPosition(
    onSuccess: (pos: GeoPosition) => void,
    onError: (err: Error) => void
  ): number | null {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      onError(new Error('Geolocation not supported.'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (pos) => {
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed ?? undefined,
          heading: pos.coords.heading ?? undefined,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        onError(new Error(err.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000,
      }
    );
  }

  public clearWatch(watchId: number) {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Reverse geocodes coordinates to street address
   */
  public async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SafeHer-AI-Safety-App/1.0',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 3).join(', ').trim();
        }
      }
    } catch {
      // Fallback
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}

export const geoService = new GeoService();
