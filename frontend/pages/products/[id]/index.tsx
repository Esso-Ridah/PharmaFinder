import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import api from '../../../lib/api';
import {
  ShoppingCartIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ProductPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    async () => {
      if (!id || typeof id !== 'string') return null;
      const response = await api.products.getById(id);
      return response.data;
    },
    {
      enabled: !!id,
      retry: 1,
    }
  );

  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery(
    ['product-availability', id],
    async () => {
      if (!id || typeof id !== 'string') return [];
      const response = await api.products.getAvailability(id);
      return response.data;
    },
    {
      enabled: !!id,
      retry: 1,
    }
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <p className="text-gray-500 mb-6">Ce produit n'existe pas ou a été supprimé.</p>
            <Link href="/products" className="btn-primary">
              Retour aux produits
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={product.name}
      description={`${product.name} - ${product.generic_name || ''} ${product.manufacturer || ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.generic_name && (
                  <p className="text-lg text-gray-600 mb-2">
                    {product.generic_name}
                  </p>
                )}
                {product.manufacturer && (
                  <p className="text-sm text-gray-500">
                    Fabriqué par {product.manufacturer}
                  </p>
                )}
              </div>

              {/* Dosage and Category */}
              <div className="flex flex-wrap gap-3 mb-6">
                {product.dosage && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {product.dosage}
                  </span>
                )}
                {product.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {product.category.name}
                  </span>
                )}
                {product.requires_prescription && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-800">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Ordonnance obligatoire
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {product.active_ingredient && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Principe actif
                    </h3>
                    <p className="text-gray-700">{product.active_ingredient}</p>
                  </div>
                )}

                {product.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}

                {product.contraindications && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Contre-indications
                    </h3>
                    <p className="text-gray-700">{product.contraindications}</p>
                  </div>
                )}

                {product.side_effects && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Effets secondaires
                    </h3>
                    <p className="text-gray-700">{product.side_effects}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Disponibilité
              </h2>

              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : availability.length > 0 ? (
                <div className="space-y-4">
                  {availability.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {item.pharmacy.name}
                        </h3>
                        {item.is_sponsored && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Partenaire
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {item.pharmacy.address}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {item.price} FCFA
                        </span>
                        <span className="text-sm text-gray-500">
                          Stock: {item.quantity}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/products/${id}/order?pharmacy=${item.pharmacy.id}`}
                          className="btn-primary btn-sm flex-1 text-center"
                        >
                          Commander
                        </Link>
                        <Link
                          href={`/pharmacies/${item.pharmacy.id}`}
                          className="btn-outline btn-sm"
                        >
                          Voir pharmacie
                        </Link>
                      </div>
                    </div>
                  ))}

                  {availability.length > 5 && (
                    <button className="w-full text-center text-primary-600 hover:text-primary-700 font-medium">
                      Voir toutes les pharmacies ({availability.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Ce produit n'est pas disponible pour le moment
                  </p>
                  <Link href="/products" className="btn-outline">
                    Voir d'autres produits
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button className="btn-outline flex-1 flex items-center justify-center gap-2">
                    <HeartIcon className="h-5 w-5" />
                    Favoris
                  </button>
                  <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <ShoppingCartIcon className="h-5 w-5" />
                    Comparer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;