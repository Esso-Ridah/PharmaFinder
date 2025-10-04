import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { api, Pharmacy } from '../lib/api';
import { MapPinIcon, PhoneIcon, ClockIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PharmacyWithDistance extends Pharmacy {
  distance_km?: number;
}

const CartePage: NextPage = () => {
  const [pharmacies, setPharmacies] = useState<PharmacyWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          loadNearbyPharmacies(latitude, longitude);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          // Coordonnées par défaut de Lomé, Togo
          const defaultLocation = { lat: 6.1319, lng: 1.2228 };
          setUserLocation(defaultLocation);
          loadNearbyPharmacies(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      // Coordonnées par défaut de Lomé, Togo
      const defaultLocation = { lat: 6.1319, lng: 1.2228 };
      setUserLocation(defaultLocation);
      loadNearbyPharmacies(defaultLocation.lat, defaultLocation.lng);
    }
  }, []);

  const loadNearbyPharmacies = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await api.pharmacies.search({
        latitude: lat,
        longitude: lng,
        max_distance: 50, // 50km
        limit: 50
      });
      setPharmacies(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des pharmacies:', error);
      // Charger toutes les pharmacies en cas d'erreur
      try {
        const response = await api.pharmacies.list({ verified_only: true });
        setPharmacies(response.data);
      } catch (fallbackError) {
        console.error('Erreur de fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger Google Maps
  useEffect(() => {
    if (!window.google && !mapLoaded) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  // Initialiser la carte quand tout est prêt
  useEffect(() => {
    if (mapLoaded && userLocation && pharmacies.length > 0) {
      initializeMap();
    }
  }, [mapLoaded, userLocation, pharmacies]);

  const initializeMap = () => {
    if (!window.google || !userLocation) return;

    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const map = new window.google.maps.Map(mapElement, {
      center: userLocation,
      zoom: 12,
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Marqueur pour la position de l'utilisateur
    new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Votre position',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="15" fill="none" stroke="#3B82F6" stroke-width="2" opacity="0.3"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Marqueurs pour les pharmacies
    pharmacies.forEach((pharmacy) => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: pharmacy.latitude, lng: pharmacy.longitude },
          map: map,
          title: pharmacy.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="2"/>
                <path d="M12 16h8M16 12v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        // Info window pour chaque pharmacie
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-4 max-w-sm">
              <h3 class="font-bold text-lg text-gray-900">${pharmacy.name}</h3>
              <p class="text-gray-600 mt-1">${pharmacy.address}</p>
              <p class="text-gray-600">${pharmacy.city}</p>
              ${pharmacy.phone ? `<p class="text-blue-600 mt-2">📞 ${pharmacy.phone}</p>` : ''}
              ${pharmacy.distance_km ? `<p class="text-green-600 mt-1">📍 ${pharmacy.distance_km.toFixed(1)} km</p>` : ''}
              <button onclick="window.selectPharmacy('${pharmacy.id}')" 
                      class="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Voir détails
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedPharmacy(pharmacy);
        });
      }
    });
  };

  // Fonction globale pour sélectionner une pharmacie depuis la carte
  useEffect(() => {
    (window as any).selectPharmacy = (pharmacyId: string) => {
      const pharmacy = pharmacies.find(p => p.id === pharmacyId);
      if (pharmacy) {
        setSelectedPharmacy(pharmacy);
      }
    };
  }, [pharmacies]);

  const formatOpeningHours = (hours: Record<string, string> | undefined) => {
    if (!hours) return 'Horaires non disponibles';

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const todayIndex = new Date().getDay();
    const todayKey = days[todayIndex];
    const todayHours = hours[todayKey] || 'Fermé';

    return `Aujourd'hui: ${todayHours}`;
  };

  return (
    <>
      <Head>
        <title>Carte des Pharmacies - PharmaFinder</title>
        <meta name="description" content="Trouvez les pharmacies partenaires près de chez vous sur notre carte interactive" />
      </Head>


      <div className="min-h-screen bg-gray-50">
        {/* En-tête */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Vue sur carte</h1>
                  <p className="mt-2 text-gray-600">
                    Trouvez les pharmacies partenaires près de chez vous
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {pharmacies.length} pharmacies trouvées
                  </div>
                  {userLocation && (
                    <button
                      onClick={() => loadNearbyPharmacies(userLocation.lat, userLocation.lng)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Actualiser
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-96 lg:h-[600px] relative">
                  {loading ? (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement de la carte...</p>
                      </div>
                    </div>
                  ) : (
                    <div id="map" className="w-full h-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Liste et détails */}
            <div className="space-y-6">
              {/* Pharmacie sélectionnée */}
              {selectedPharmacy && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedPharmacy.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">{selectedPharmacy.address}</p>
                        <p className="text-gray-600">{selectedPharmacy.city}</p>
                      </div>
                    </div>

                    {selectedPharmacy.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-900">{selectedPharmacy.phone}</p>
                      </div>
                    )}

                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-gray-900">
                        {formatOpeningHours(selectedPharmacy.opening_hours)}
                      </p>
                    </div>

                    {selectedPharmacy.distance_km && (
                      <div className="flex items-center">
                        <ArrowPathIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-900">
                          À {selectedPharmacy.distance_km.toFixed(1)} km
                        </p>
                      </div>
                    )}

                    {selectedPharmacy.is_verified && (
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-green-500 mr-3" />
                        <p className="text-green-600 font-medium">Pharmacie vérifiée</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir les produits
                    </button>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Itinéraire
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des pharmacies */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    Pharmacies à proximité
                  </h3>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {pharmacies.slice(0, 10).map((pharmacy) => (
                    <button
                      key={pharmacy.id}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedPharmacy?.id === pharmacy.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{pharmacy.city}</span>
                        {pharmacy.distance_km && (
                          <span className="text-xs font-medium text-blue-600">
                            {pharmacy.distance_km.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartePage;