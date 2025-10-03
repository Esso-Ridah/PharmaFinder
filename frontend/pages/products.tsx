import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
// Temporairement supprimé à cause de problèmes d'imports
// import * as HeroIcons from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import Head from 'next/head';
import { api, Product, Category } from '../lib/api';

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [requiresPrescription, setRequiresPrescription] = useState<boolean | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery(
    'categories',
    () => api.categories.list().then(res => res.data)
  );

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery(
    ['products', searchQuery, selectedCategory, requiresPrescription],
    () => api.products.search({
      query: searchQuery || undefined,
      category_id: selectedCategory || undefined,
      requires_prescription: requiresPrescription ?? undefined,
      limit: 50,
    }).then(res => res.data),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  return (
    <>
      <Head>
        <title>Médicaments Disponibles - PharmaFinder</title>
        <meta name="description" content="Recherchez parmi des milliers de médicaments disponibles dans nos pharmacies partenaires" />
      </Head>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-display font-bold text-white sm:text-5xl">
                Catalogue des Médicaments
              </h1>
              <p className="mt-4 text-xl text-primary-100">
                Recherchez parmi des milliers de médicaments disponibles
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un médicament (ex: Paracétamol, Amoxicilline...)"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prescription Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription
                </label>
                <select
                  value={requiresPrescription === null ? '' : requiresPrescription.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRequiresPrescription(
                      value === '' ? null : value === 'true'
                    );
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tous les médicaments</option>
                  <option value="false">Sans ordonnance</option>
                  <option value="true">Sur ordonnance</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setRequiresPrescription(null);
                  }}
                  className="btn-outline w-full"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Recherche en cours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Erreur lors de la recherche</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-lg text-gray-600">
                  <span className="font-semibold text-primary-600">
                    {products.length}
                  </span>{' '}
                  médicament{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="card card-hover"
                    >
                      <div className="card-body">
                        {/* Header */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {product.name}
                            </h3>
                            {product.requires_prescription && (
                              <div className="flex items-center ml-2">
                                <span className="text-warning-500">⚠️</span>
                              </div>
                            )}
                          </div>
                          
                          {product.generic_name && (
                            <p className="text-sm text-gray-500 mb-1">
                              {product.generic_name}
                            </p>
                          )}
                          
                          {product.manufacturer && (
                            <p className="text-xs text-gray-400">
                              {product.manufacturer}
                            </p>
                          )}
                        </div>

                        {/* Dosage */}
                        {product.dosage && (
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {product.dosage}
                            </span>
                          </div>
                        )}

                        {/* Prescription Badge */}
                        {product.requires_prescription && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                              <span className="mr-1">⚠️</span>
                              Ordonnance obligatoire
                            </span>
                          </div>
                        )}

                        {/* Description */}
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {product.description}
                          </p>
                        )}

                        {/* Category */}
                        {product.category && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {product.category.name}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                          <Link
                            href={`/products/${product.id}/order`}
                            className="btn-primary btn-sm w-full text-center"
                          >
                            <span className="mr-1">🛒</span>
                            Commander
                          </Link>
                          <div className="flex space-x-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="btn-outline btn-sm flex-1 text-center"
                            >
                              <span className="mr-1">🏪</span>
                              Pharmacies
                            </Link>
                            <Link
                              href={`/products/${product.id}/availability`}
                              className="btn-outline btn-sm"
                            >
                              <span>💰</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <span className="text-6xl">🔍</span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucun médicament trouvé
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Essayez avec d'autres mots-clés ou modifiez vos filtres
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <span className="text-warning-500 mr-2 text-xl">⚠️</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Important à savoir
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  • Les médicaments marqués avec ⚠️ nécessitent une ordonnance médicale
                </p>
                <p>
                  • Les prix et disponibilités peuvent varier selon les pharmacies
                </p>
                <p>
                  • Vérifiez toujours avec votre pharmacien avant de prendre un médicament
                </p>
                <p>
                  • En cas de doute, consultez un professionnel de santé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;