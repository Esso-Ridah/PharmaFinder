import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const {
    enableHighAccuracy = false,
    timeout = 5000,
    maximumAge = 0,
    watchPosition = false,
  } = options;

  useEffect(() => {
    let watchId: number | null = null;

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'Une erreur inconnue est survenue';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'L\'accès à la géolocalisation a été refusé';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Les informations de localisation ne sont pas disponibles';
          break;
        case error.TIMEOUT:
          errorMessage = 'La demande de géolocalisation a expiré';
          break;
      }

      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: errorMessage,
        loading: false,
      });
    };

    const startGeolocation = () => {
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          error: 'La géolocalisation n\'est pas supportée par ce navigateur',
          loading: false,
        }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const config = {
        enableHighAccuracy,
        timeout,
        maximumAge,
      };

      if (watchPosition) {
        watchId = navigator.geolocation.watchPosition(onSuccess, onError, config);
      } else {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, config);
      }
    };

    startGeolocation();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watchPosition]);

  const requestLocation = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par ce navigateur',
        loading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = 'Une erreur inconnue est survenue';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'L\'accès à la géolocalisation a été refusé';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Les informations de localisation ne sont pas disponibles';
            break;
          case error.TIMEOUT:
            errorMessage = 'La demande de géolocalisation a expiré';
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  };

  return {
    ...state,
    requestLocation,
  };
};

// Utility function to calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Helper function to format distance
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

export default useGeolocation;