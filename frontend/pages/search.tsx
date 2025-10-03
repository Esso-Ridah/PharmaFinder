import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ClockIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { api } from '../lib/api';
import ProductInfoModal from '../components/ProductInfoModal';
import { useCart } from '../hooks/useCart';
import AddToCartButton from '../components/AddToCartButton';
import { useAuth } from '../hooks/useAuth';
import UnifiedSearchBar from '../components/UnifiedSearchBar';

interface SearchPageProps {
  initialQuery?: string;
  initialType?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', initialType = 'mixed' }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchType, setSearchType] = useState<string>(initialType);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  // Extract query parameters only on client side
  useEffect(() => {
    const { q, type } = router.query;
    if (q && typeof q === 'string') {
      setSearchQuery(q);
      setSearchType((type as string) || 'mixed');
      console.log('Setting query from router:', q);
    }
  }, [router.query]);

  // Debug logs
  console.log('SearchPage render:', {
    isReady: router.isReady,
    query: router.query,
    searchQuery
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [requiresPrescription, setRequiresPrescription] = useState<boolean | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Detect search type for filter display
  const getSearchTypeIcon = () => {
    switch (searchType) {
      case 'product': return '💊';
      case 'pharmacy': return '🏥';
      case 'location': return '📍';
      default: return '🔍';
    }
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'product': return 'Médicaments détectés';
      case 'pharmacy': return 'Pharmacies détectées';
      case 'location': return 'Localités détectées';
      default: return 'Recherche mixte';
    }
  };

  // Fetch categories
  const { data: categories = [] } = useQuery(
    'categories',
    () => api.categories.list().then(res => res.data),
    {
      retry: 1,
      staleTime: 300000, // 5 minutes
      onError: (error) => {
        console.warn('Categories fetch failed:', error);
      }
    }
  );

  // Search products
  const { data: productsRaw = [], isLoading: productsLoading, error: productsError } = useQuery(
    ['search', 'products', searchQuery, selectedCategory, requiresPrescription],
    async () => {
      console.log('🔍 React Query executing search with:', { searchQuery, selectedCategory, requiresPrescription });
      try {
        const res = await api.products.search({
          query: searchQuery || undefined,
          category_id: selectedCategory || undefined,
          requires_prescription: requiresPrescription ?? undefined,
          limit: 100, // Max allowed by backend, pagination will be done client-side
        });
        console.log('✅ API Response received:', res.data);
        console.log('📊 Number of products:', res.data.length);
        return res.data;
      } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
      }
    },
    {
      enabled: !!searchQuery,
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error) => {
        console.error('❌ React Query error:', error);
      },
      onSuccess: (data) => {
        console.log('✅ React Query success, data length:', data.length);
      }
    }
  );

  // Deduplicate products by ID (in case of duplicates from sponsored results)
  const products = React.useMemo(() => {
    const uniqueProductsMap = new Map();
    productsRaw.forEach(product => {
      if (!uniqueProductsMap.has(product.id)) {
        uniqueProductsMap.set(product.id, product);
      }
    });
    return Array.from(uniqueProductsMap.values());
  }, [productsRaw]);

  console.log('🎯 Current state:', {
    searchQuery,
    productsCount: products.length,
    isLoading: productsLoading,
    hasError: !!productsError
  });

  // Calculate paginated products
  const totalProducts = products.length;
  const totalProductPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, requiresPrescription]);

  // Search pharmacies
  const { data: pharmacies = [], isLoading: pharmaciesLoading } = useQuery(
    ['search', 'pharmacies', searchQuery],
    () => api.pharmacies.list({ skip: 0, limit: 10 }).then(res =>
      res.data.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
    {
      enabled: !!searchQuery,
      staleTime: 2 * 60 * 1000,
    }
  );

  const isLoading = productsLoading || pharmaciesLoading;
  const hasResults = products.length > 0 || pharmacies.length > 0;

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleAddToCart = async (product: any, pharmacyId: string) => {
    setAddingToCart(product.id);
    try {
      // Extract pharmacy data from product if available
      const pharmacyData = product.sponsored_pharmacy ? {
        id: product.sponsored_pharmacy.id,
        name: product.sponsored_pharmacy.name,
        city: null
      } : null;

      await addToCart(
        product.id,
        pharmacyId,
        1,
        product, // Pass complete product data
        pharmacyData, // Pass pharmacy data if available
        product.min_price // Pass the price from search results
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <>
      <Head>
        <title>Recherche : {searchQuery} - PharmaFinder</title>
        <meta name="description" content={`Résultats de recherche pour "${searchQuery}"`} />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Search Bar */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-full max-w-md">
              <UnifiedSearchBar
                initialQuery={searchQuery}
                variant="compact"
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Résultats pour "{searchQuery}"
                </h1>
                {searchType !== 'mixed' && (
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <span className="mr-1">{getSearchTypeIcon()}</span>
                    <span>{getSearchTypeLabel()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline btn-sm flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
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

                  {/* Distance Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance max (km)
                    </label>
                    <select
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setRequiresPrescription(null);
                      setMaxDistance(10);
                    }}
                    className="btn-outline btn-sm mr-2"
                  >
                    Réinitialiser
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Recherche en cours...</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h2>
              <p className="text-gray-600 mb-6">
                Aucun produit ou pharmacie ne correspond à votre recherche "{searchQuery}".
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Conseils pour améliorer votre recherche :</p>
                <ul className="text-left inline-block space-y-1">
                  <li>• Vérifiez l'orthographe de vos mots-clés</li>
                  <li>• Utilisez des mots plus généraux</li>
                  <li>• Essayez le nom générique du médicament</li>
                  <li>• Cherchez par principe actif</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/products" className="btn-primary">
                  Explorer tous les produits
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-lg text-gray-600">
                  <span className="font-semibold text-primary-600">
                    {products.length + pharmacies.length}
                  </span>{' '}
                  résultat{products.length + pharmacies.length > 1 ? 's' : ''} trouvé{products.length + pharmacies.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Products Results */}
              {products.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Médicaments ({totalProducts})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="card card-hover"
                      >
                        <div className="card-body">
                          {/* Header with sponsored badge */}
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                    {product.name}
                                  </h3>
                                  {product.requires_prescription && (
                                    <div className="flex items-center ml-2">
                                      <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
                                    </div>
                                  )}
                                </div>
                                {(product as any).is_sponsored && (product as any).sponsored_pharmacy && (
                                  <button
                                    onClick={() => router.push(`/search?q=${encodeURIComponent((product as any).sponsored_pharmacy.name)}&type=pharmacy`)}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1 hover:bg-blue-200 transition-colors"
                                  >
                                    Vendu par {(product as any).sponsored_pharmacy.name}
                                  </button>
                                )}
                              </div>
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
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Ordonnance obligatoire
                              </span>
                            </div>
                          )}

                          {/* Price and Category */}
                          <div className="mb-4 flex items-center justify-between">
                            {product.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {product.category.name}
                              </span>
                            )}
                            {(product as any).min_price && (
                              <span className="text-sm font-medium text-green-600">
                                À partir de {(product as any).min_price} FCFA
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            {(product as any).sponsored_pharmacy ? (
                              <AddToCartButton
                                product={{
                                  id: product.id,
                                  name: product.name,
                                  requires_prescription: product.requires_prescription
                                }}
                                pharmacy={{
                                  id: (product as any).sponsored_pharmacy.id,
                                  name: (product as any).sponsored_pharmacy.name
                                }}
                                quantity={1}
                                disabled={addingToCart === product.id}
                                className="btn-primary btn-sm w-full"
                              />
                            ) : (
                              <button
                                onClick={() => openProductModal(product)}
                                className="btn-primary btn-sm w-full"
                              >
                                <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                                Voir les pharmacies
                              </button>
                            )}
                            <button
                              onClick={() => openProductModal(product)}
                              className="btn-outline btn-sm w-full"
                            >
                              <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                              Fiche produit
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination for Products */}
                  {totalProductPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalProducts)} sur {totalProducts} produits
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
                          {Array.from({ length: Math.min(5, totalProductPages) }, (_, index) => {
                            let pageNumber;
                            if (totalProductPages <= 5) {
                              pageNumber = index + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = index + 1;
                            } else if (currentPage >= totalProductPages - 2) {
                              pageNumber = totalProductPages - 4 + index;
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
                          onClick={() => setCurrentPage(Math.min(totalProductPages, currentPage + 1))}
                          disabled={currentPage === totalProductPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pharmacies Results */}
              {pharmacies.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Pharmacies ({pharmacies.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pharmacies.map((pharmacy, index) => (
                      <motion.div
                        key={pharmacy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (products.length + index) * 0.05 }}
                        className="card card-hover"
                      >
                        <div className="card-body">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {pharmacy.name}
                              </h3>
                              {pharmacy.is_verified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                  Vérifiée
                                </span>
                              )}
                            </div>
                            <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
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
                              <span>Ouvert • Ferme à 19h00</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                console.log('🔵 BOUTON CLIQUÉ - Navigation vers:', `/pharmacies/${pharmacy.id}`);
                                router.push(`/pharmacies/${pharmacy.id}`);
                              }}
                              className="btn-primary btn-sm w-full"
                            >
                              Voir les produits
                            </button>
                            <a
                              href={`tel:${pharmacy.phone}`}
                              className="btn-outline btn-sm w-full text-center"
                            >
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              Appeler
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-12 text-center">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Vous ne trouvez pas ce que vous cherchez ?
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/products" className="btn-outline">
                      Explorer tous les produits
                    </Link>
                    <Link href="/pharmacies" className="btn-outline">
                      Toutes les pharmacies
                    </Link>
                    <Link href="/contact" className="btn-primary">
                      Contacter le support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Info Modal */}
        {selectedProduct && (
          <ProductInfoModal
            isOpen={isModalOpen}
            onClose={closeProductModal}
            product={selectedProduct}
          />
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { q, type } = context.query;

  return {
    props: {
      initialQuery: (q as string) || '',
      initialType: (type as string) || 'mixed',
    },
  };
};

export default SearchPage;