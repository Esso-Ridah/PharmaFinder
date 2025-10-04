import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { api } from '../lib/api';
import { useGeolocation, calculateDistance, formatDistance } from '../hooks/useGeolocation';

interface PharmacyWithDistance {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  distance?: number;
  is_open?: boolean;
  opening_hours?: string;
  services?: string[];
}

const MapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');

  // Get user location
  const { latitude, longitude, error: locationError, loading: locationLoading, requestLocation } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  // Fetch pharmacies
  const { data: pharmacies = [], isLoading } = useQuery(
    'pharmacies-map',
    () => api.pharmacies.list({ skip: 0, limit: 100 }).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Calculate distances and filter pharmacies
  const processedPharmacies: PharmacyWithDistance[] = React.useMemo(() => {
    let result = pharmacies.map(pharmacy => ({
      ...pharmacy,
      // Mock coordinates for Lomé area
      latitude: 6.1319 + (Math.random() - 0.5) * 0.1,
      longitude: 1.2228 + (Math.random() - 0.5) * 0.1,
      distance: latitude && longitude
        ? calculateDistance(latitude, longitude, 6.1319 + (Math.random() - 0.5) * 0.1, 1.2228 + (Math.random() - 0.5) * 0.1)
        : undefined,
      is_open: Math.random() > 0.3, // 70% chance of being open
      opening_hours: '8h00 - 19h00',
      services: ['Conseil pharmaceutique', 'Livraison', 'Test rapide'].slice(0, Math.floor(Math.random() * 3) + 1),
    }));

    // Filter by search query
    if (searchQuery) {
      result = result.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by distance
    if (latitude && longitude) {
      result = result.filter(pharmacy => !pharmacy.distance || pharmacy.distance <= maxDistance);
    }

    // Sort
    if (sortBy === 'distance' && latitude && longitude) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [pharmacies, latitude, longitude, searchQuery, maxDistance, sortBy]);

  const handlePharmacySelect = (pharmacyId: string) => {
    setSelectedPharmacy(selectedPharmacy === pharmacyId ? null : pharmacyId);
  };

  const selectedPharmacyData = processedPharmacies.find(p => p.id === selectedPharmacy);

  return (
    <>
      <Head>
        <title>Carte des Pharmacies - PharmaFinder</title>
        <meta name="description" content="Trouvez les pharmacies les plus proches de vous avec notre carte interactive" />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-primary-600 hover:text-primary-700">
                  ← Accueil
                </Link>
                <div className="text-gray-300">|</div>
                <h1 className="text-xl font-semibold text-gray-900">Carte des Pharmacies</h1>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline btn-sm flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Location */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une pharmacie par nom ou adresse..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Location Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {locationLoading ? (
                  <div className="flex items-center text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    <span className="text-sm">Localisation en cours...</span>
                  </div>
                ) : latitude && longitude ? (
                  <div className="flex items-center text-green-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">Position détectée</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-gray-500">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {locationError || 'Position non détectée'}
                      </span>
                    </div>
                    <button
                      onClick={requestLocation}
                      className="btn-outline btn-sm"
                    >
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Localiser
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {processedPharmacies.length} pharmacie{processedPharmacies.length > 1 ? 's' : ''} trouvée{processedPharmacies.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance maximale
                    </label>
                    <select
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={1}>1 km</option>
                      <option value={2}>2 km</option>
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'distance' | 'name')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="distance">Distance</option>
                      <option value="name">Nom alphabétique</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setMaxDistance(10);
                        setSortBy('distance');
                      }}
                      className="btn-outline btn-sm w-full"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pharmacy List */}
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Chargement des pharmacies...</p>
                </div>
              ) : processedPharmacies.length === 0 ? (
                <div className="text-center py-8">
                  <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Aucune pharmacie trouvée</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                processedPharmacies.map((pharmacy, index) => (
                  <motion.div
                    key={pharmacy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handlePharmacySelect(pharmacy.id)}
                    className={`card cursor-pointer transition-all ${
                      selectedPharmacy === pharmacy.id
                        ? 'ring-2 ring-primary-500 border-primary-200'
                        : 'card-hover'
                    }`}
                  >
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {pharmacy.name}
                          </h3>
                          <div className="flex items-center mt-1 space-x-2">
                            {pharmacy.is_verified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Vérifiée
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              pharmacy.is_open
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {pharmacy.is_open ? 'Ouverte' : 'Fermée'}
                            </span>
                          </div>
                        </div>
                        {pharmacy.distance && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary-600">
                              {formatDistance(pharmacy.distance)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start">
                          <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-2">{pharmacy.address}</span>
                        </div>

                        {pharmacy.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{pharmacy.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{pharmacy.opening_hours}</span>
                        </div>
                      </div>

                      {pharmacy.services && pharmacy.services.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {pharmacy.services.slice(0, 2).map((service, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {service}
                              </span>
                            ))}
                            {pharmacy.services.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{pharmacy.services.length - 2} autres
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex space-x-2">
                        <Link
                          href={`/pharmacies/${pharmacy.id}`}
                          className="btn-primary btn-sm flex-1 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Voir produits
                        </Link>
                        {pharmacy.phone && (
                          <a
                            href={`tel:${pharmacy.phone}`}
                            className="btn-outline btn-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PhoneIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Map Placeholder */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-300px)] flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Carte Interactive
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Intégration avec Google Maps ou OpenStreetMap pour une expérience optimale
                  </p>
                  {selectedPharmacyData && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 max-w-sm mx-auto">
                      <h4 className="font-medium text-primary-900 mb-2">
                        Pharmacie sélectionnée
                      </h4>
                      <p className="text-sm text-primary-700">
                        {selectedPharmacyData.name}
                      </p>
                      <p className="text-xs text-primary-600 mt-1">
                        {selectedPharmacyData.address}
                      </p>
                      {selectedPharmacyData.distance && (
                        <p className="text-xs text-primary-600 mt-1">
                          Distance: {formatDistance(selectedPharmacyData.distance)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" className="btn-primary">
                  Rechercher un médicament
                </Link>
                <Link href="/pharmacies" className="btn-outline">
                  Liste des pharmacies
                </Link>
                <button
                  onClick={requestLocation}
                  className="btn-outline"
                  disabled={locationLoading}
                >
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {locationLoading ? 'Localisation...' : 'Me localiser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapPage;