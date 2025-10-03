import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { api, Product } from '../../lib/api';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const productId = id as string;

  const { data: product, isLoading, error } = useQuery(
    ['product', productId],
    () => api.products.getById(productId).then(res => res.data),
    {
      enabled: !!productId,
      retry: 1,
    }
  );

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Chargement... - PharmaFinder</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Head>
          <title>Produit non trouvé - PharmaFinder</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <Link href="/products" className="btn-primary">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - PharmaFinder</title>
        <meta name="description" content={`${product.name} - ${product.description || 'Disponible dans nos pharmacies partenaires'}`} />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.back()}
                className="btn-outline btn-sm mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Retour
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.generic_name && (
                  <p className="text-lg text-gray-600 mt-1">{product.generic_name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Info */}
            <div className="lg:col-span-2">
              <div className="card card-body">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du produit</h2>

                <div className="space-y-4">
                  {product.manufacturer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fabricant</label>
                      <p className="mt-1 text-sm text-gray-900">{product.manufacturer}</p>
                    </div>
                  )}

                  {product.dosage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dosage</label>
                      <p className="mt-1 text-sm text-gray-900">{product.dosage}</p>
                    </div>
                  )}

                  {product.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <p className="mt-1 text-sm text-gray-900">{product.category.name}</p>
                    </div>
                  )}

                  {product.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{product.description}</p>
                    </div>
                  )}

                  {product.requires_prescription && (
                    <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-warning-500 mr-2" />
                        <span className="text-sm font-medium text-warning-800">
                          Ordonnance obligatoire
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-warning-700">
                        Ce médicament nécessite une prescription médicale.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <div className="card card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/search?q=${encodeURIComponent(product.name)}`}
                    className="btn-primary w-full text-center"
                  >
                    <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                    Voir les pharmacies
                  </Link>

                  <button className="btn-outline w-full">
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Commander
                  </button>
                </div>
              </div>

              <div className="card card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Besoin d'aide ?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Consultez votre pharmacien</p>
                  <p>• Vérifiez la disponibilité</p>
                  <p>• Comparez les prix</p>
                </div>
                <Link href="/contact" className="btn-outline btn-sm mt-4">
                  Contacter le support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;