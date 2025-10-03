import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { api } from '../../../lib/api';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import AddToCartButton from '../../../components/AddToCartButton';

const PharmacyPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default value

  // Fonction pour calculer les items par page en fonction de la taille d'écran
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Basé sur la résolution et la taille d'écran
        if (width >= 1536) { // 2xl screens
          return Math.floor(height / 200) * 5; // ~25-30 items
        } else if (width >= 1280) { // xl screens
          return Math.floor(height / 200) * 4; // ~20-24 items
        } else if (width >= 1024) { // lg screens
          return Math.floor(height / 250) * 3; // ~12-18 items
        } else if (width >= 768) { // md screens
          return Math.floor(height / 300) * 2; // ~8-12 items
        } else { // sm screens
          return Math.floor(height / 400); // ~4-8 items
        }
      }
      return 20; // fallback
    };

    setItemsPerPage(calculateItemsPerPage());

    const handleResize = () => setItemsPerPage(calculateItemsPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: pharmacy, isLoading, error } = useQuery(
    ['pharmacy', id],
    async () => {
      if (!id || typeof id !== 'string') return null;
      const response = await api.pharmacies.getById(id);
      return response.data;
    },
    {
      enabled: !!id,
      retry: 1,
    }
  );

  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery(
    ['pharmacy-inventory', id, currentPage, itemsPerPage],
    async () => {
      if (!id || typeof id !== 'string') return { items: [], total: 0 };
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await api.pharmacies.getInventory(id, {
        in_stock_only: true,
        limit: itemsPerPage,
        skip: skip
      });
      return {
        items: response.data,
        total: response.headers?.['x-total-count'] ? parseInt(response.headers['x-total-count']) : response.data.length
      };
    },
    {
      enabled: !!id,
      retry: 1,
    }
  );

  const inventory = inventoryData?.items || [];
  const totalItems = inventoryData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pharmacie non trouvée</h1>
          <p className="text-gray-500 mb-6">Cette pharmacie n'existe pas ou a été supprimée.</p>
          <Link href="/pharmacies" className="btn-primary">
            Retour aux pharmacies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pharmacy Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {pharmacy.name}
                </h1>
                {pharmacy.is_verified && (
                  <CheckBadgeIcon className="h-8 w-8 text-primary-600" title="Pharmacie vérifiée" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  {pharmacy.address && (
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900">{pharmacy.address}</p>
                        {pharmacy.city && (
                          <p className="text-sm text-gray-500">{pharmacy.city}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {pharmacy.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {pharmacy.phone}
                      </a>
                    </div>
                  )}

                  {pharmacy.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={`mailto:${pharmacy.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {pharmacy.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Hours */}
                <div>
                  {pharmacy.opening_hours && (
                    <div className="flex items-start gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Horaires d'ouverture</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          {Object.entries(pharmacy.opening_hours || {}).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}:</span>
                              <span>{hours || 'Fermé'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="ml-6">
              <div className="flex flex-col gap-2">
                <Link href={`/carte?pharmacy=${id}`} className="btn-outline">
                  Voir sur la carte
                </Link>
                {pharmacy.phone && (
                  <a href={`tel:${pharmacy.phone}`} className="btn-primary">
                    Appeler
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Produits disponibles
          </h2>

          {isLoadingInventory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : inventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventory.map((item: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-medium text-gray-900 mb-2 hover:text-primary-600">
                      {item.product.name}
                    </h3>
                  </Link>

                  {item.product.generic_name && (
                    <p className="text-sm text-gray-500 mb-2">
                      {item.product.generic_name}
                    </p>
                  )}

                  {item.product.dosage && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded mb-3">
                      {item.product.dosage}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-600">
                      {item.price} FCFA
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {item.quantity}
                    </span>
                  </div>

                  {item.is_sponsored && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Produit mis en avant
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <AddToCartButton
                      product={{
                        id: item.product.id,
                        name: item.product.name,
                        requires_prescription: item.product.requires_prescription || false
                      }}
                      pharmacy={{
                        id: pharmacy?.id || '',
                        name: pharmacy?.name || ''
                      }}
                      quantity={1}
                      className="btn-primary btn-sm w-full"
                    />
                    <Link
                      href={`/products/${item.product.id}`}
                      className="btn-outline btn-sm w-full text-center"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Aucun produit disponible pour le moment
              </p>
              <Link href="/products" className="btn-outline">
                Voir tous les produits
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} produits
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>

                {/* Pages numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default PharmacyPage;