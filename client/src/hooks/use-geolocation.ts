import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    };

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    // Success handler for geolocation
    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    // Error handler for geolocation
    const onError = (error: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        error: getGeolocationErrorMessage(error),
        loading: false,
      }));
    };

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      defaultOptions
    );

    // Clean up by clearing the watch
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return state;
}

// Helper function to get a more user-friendly error message
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied. Please enable location services in your browser settings.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable. Please try again later.";
    case error.TIMEOUT:
      return "The request to get your location timed out. Please try again.";
    default:
      return "An unknown error occurred while trying to get your location.";
  }
}
