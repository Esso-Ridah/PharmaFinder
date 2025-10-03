import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { api, Product, Category } from '../lib/api';
import { 
  SparklesIcon, 
  BeakerIcon, 
  HeartIcon, 
  SunIcon, 
  ShoppingBagIcon, 
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ParapharmaciePage: NextPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParapharmacyData();
  }, []);

  const loadParapharmacyData = async () => {
    try {
      setLoading(true);
      
      // Charger les catégories
      const categoriesResponse = await api.categories.list();
      const parapharmacyCategories = categoriesResponse.data.filter(cat => 
        ['cosmetiques-naturels', 'beurres-karite', 'savons-traditionnels', 'huiles-essentielles', 'hygiene-naturels'].includes(cat.slug)
      );
      setCategories(parapharmacyCategories);

      // Charger les produits des catégories parapharmacie
      const productsResponse = await api.products.search({
        requires_prescription: false,
        limit: 50
      });
      
      // Filtrer les produits par catégories parapharmacie
      const parapharmacyProductIds = parapharmacyCategories.map(cat => cat.id);
      const filteredProducts = productsResponse.data.filter(product => 
        parapharmacyProductIds.includes(product.category_id || '')
      );
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des données parapharmacie:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const parapharmacyCategories = [
    {
      name: 'Cosmétiques Naturels',
      description: 'Produits de beauté à base d\'ingrédients naturels',
      icon: SparklesIcon,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      name: 'Beurres de Karité',
      description: 'Beurre de karité pur et produits dérivés',
      icon: BeakerIcon,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Savons Traditionnels',
      description: 'Savons artisanaux et traditionnels africains',
      icon: SunIcon,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      name: 'Huiles Essentielles',
      description: 'Huiles essentielles et extraits de plantes',
      icon: HeartIcon,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Compléments Alimentaires',
      description: 'Vitamines, minéraux et suppléments naturels',
      icon: ShoppingBagIcon,
      color: 'bg-blue-100 text-blue-600',
    },
  ];

  return (
    <>
      <Head>
        <title>Parapharmacie - Produits Naturels Africains | PharmaFinder</title>
        <meta name="description" content="Découvrez notre sélection de produits parapharmacie : beurre de karité, savons traditionnels, huiles essentielles et cosmétiques naturels africains" />
      </Head>


      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Parapharmacie Africaine
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Découvrez les trésors de la pharmacopée africaine : 
                beurre de karité, savons traditionnels, huiles essentielles
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  🌿 Produits naturels
                </span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  🤝 Commerce équitable
                </span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  🏺 Tradition africaine
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des produits naturels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos Catégories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {parapharmacyCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border hover:border-green-200 cursor-pointer"
                  >
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Products Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Produits Disponibles ({filteredProducts.length})
              </h2>
              <Link href="#" className="flex items-center text-green-600 hover:text-green-700 font-medium">
                <PlusIcon className="h-4 w-4 mr-1" />
                Vendre un produit
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des produits...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-100 to-blue-100">
                        <BeakerIcon className="h-16 w-16 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {product.manufacturer}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          Prix sur demande
                        </span>
                        <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun produit trouvé</p>
                <p className="text-sm text-gray-500 mt-2">
                  Essayez de modifier votre recherche
                </p>
              </div>
            )}
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Vous êtes producteur ou artisan ?</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Rejoignez notre marketplace et vendez vos produits traditionnels africains 
              à une clientèle qui valorise l'authenticité et la qualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Devenir vendeur
              </Link>
              <Link href="#" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Guide du vendeur
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ParapharmaciePage;