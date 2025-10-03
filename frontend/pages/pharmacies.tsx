import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { api, Pharmacy } from '../lib/api';

const PharmaciesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: pharmacies = [], isLoading, error } = useQuery(
    'pharmacies',
    () => api.pharmacies.list({ verified_only: true }).then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatOpeningHours = (hours: Record<string, string> | null) => {
    if (!hours) return 'Horaires non disponibles';
    
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    
    if (todayHours && todayHours !== 'fermé') {
      return `Ouvert aujourd'hui : ${todayHours}`;
    }
    
    return 'Fermé aujourd\'hui';
  };

  return (
    <>
      <Head>
        <title>Pharmacies Partenaires - PharmaFinder</title>
        <meta name="description" content="Découvrez toutes nos pharmacies partenaires vérifiées à Lomé et environs" />
      </Head>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-display font-bold text-white sm:text-5xl">
                Nos Pharmacies Partenaires
              </h1>
              <p className="mt-4 text-xl text-primary-100">
                Découvrez toutes nos pharmacies vérifiées à Lomé et environs
              </p>
            </div>

            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une pharmacie par nom ou adresse..."
                  className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des pharmacies...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Erreur lors du chargement des pharmacies</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-8 text-center">
                <p className="text-lg text-gray-600">
                  <span className="font-semibold text-primary-600">
                    {filteredPharmacies.length}
                  </span>{' '}
                  pharmacie{filteredPharmacies.length > 1 ? 's' : ''} 
                  {searchQuery && ' trouvée(s)'}
                </p>
              </div>

              {/* Pharmacies Grid */}
              {filteredPharmacies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPharmacies.map((pharmacy, index) => (
                    <motion.div
                      key={pharmacy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="card card-hover"
                    >
                      <div className="card-body">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {pharmacy.name}
                            </h3>
                            {pharmacy.is_verified && (
                              <div className="flex items-center">
                                <CheckBadgeIcon className="h-5 w-5 text-success-500 mr-1" />
                                <span className="text-sm text-success-600">Vérifiée</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start mb-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 text-sm">
                            {pharmacy.address}
                          </p>
                        </div>

                        {/* Phone */}
                        {pharmacy.phone && (
                          <div className="flex items-center mb-3">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="text-gray-600 text-sm">
                              {pharmacy.phone}
                            </p>
                          </div>
                        )}

                        {/* Opening Hours */}
                        <div className="flex items-center mb-4">
                          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-gray-600 text-sm">
                            {formatOpeningHours(pharmacy.opening_hours)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <Link
                            href={`/pharmacies/${pharmacy.id}`}
                            className="btn-primary btn-sm flex-1 text-center"
                          >
                            Voir les produits
                          </Link>
                          {pharmacy.latitude && pharmacy.longitude && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-outline btn-sm"
                            >
                              <MapPinIcon className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <MagnifyingGlassIcon className="h-full w-full" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucune pharmacie trouvée
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery 
                      ? 'Essayez avec d\'autres mots-clés'
                      : 'Aucune pharmacie disponible pour le moment'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 sm:text-4xl">
              Vous êtes pharmacien ?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Rejoignez notre réseau et augmentez votre visibilité
            </p>
            <div className="mt-8">
              <Link href="/auth/register" className="btn-primary btn-lg">
                Devenir partenaire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmaciesPage;