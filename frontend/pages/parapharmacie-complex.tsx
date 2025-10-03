import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { api, Product, Category } from '../lib/api';
import { 
  SparklesIconIcon, 
  BeakerIcon, 
  HeartIconIcon, 
  SunIconIcon, 
  ShoppingBagIconIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIconIcon,
  MapPinIconIcon,
  PlusIconIcon
} from '@heroicons/react/24/outline';

interface ParapharmacyCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  product_count?: number;
}

const parapharmacyCategories: ParapharmacyCategory[] = [
  {
    id: 'cosmetiques-naturels',
    name: 'Cosmétiques Naturels',
    slug: 'cosmetiques-naturels',
    description: 'Produits de beauté à base d\'ingrédients naturels',
    icon: SparklesIcon,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'beurres-karite',
    name: 'Beurres de Karité',
    slug: 'beurres-karite',
    description: 'Beurre de karité pur et produits dérivés',
    icon: BeakerIcon,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'savons-traditionnels',
    name: 'Savons Traditionnels',
    slug: 'savons-traditionnels',
    description: 'Savons artisanaux et traditionnels africains',
    icon: SunIcon,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'huiles-essentielles',
    name: 'Huiles Essentielles',
    slug: 'huiles-essentielles',
    description: 'Huiles essentielles et extraits de plantes',
    icon: HeartIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'complements-alimentaires',
    name: 'Compléments Alimentaires',
    slug: 'complements-alimentaires',
    description: 'Vitamines, minéraux et suppléments naturels',
    icon: ShoppingBagIcon,
    color: 'bg-blue-100 text-blue-600',
  },
];

const ParapharmaciePage: NextPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setMagnifyingGlassIconQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFunnelIcons, setShowFunnelIcons] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    loadParapharmacyData();
  }, []);

  const loadParapharmacyData = async () => {
    try {
      setLoading(true);
      
      // Charger les catégories parapharmacie
      const categoriesResponse = await api.categories.list();
      const parapharmacyCategories = categoriesResponse.data.filter(cat => 
        ['vitamins-supplements', 'cosmetiques', 'hygiene'].includes(cat.slug)
      );
      setCategories(parapharmacyCategories);

      // Charger les produits parapharmacie (sans ordonnance)
      const productsResponse = await api.products.search({
        requires_prescription: false,
        limit: 50
      });
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données parapharmacie:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesMagnifyingGlassIcon = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    
    return matchesMagnifyingGlassIcon && matchesCategory;
  });

  const featuredProducts = [
    {
      id: 'beurre-karite-pur',
      name: 'Beurre de Karité Pur Bio',
      price: 15000,
      image: '/images/karite.jpg',
      vendor: 'Coopérative Féminine de Kara',
      rating: 4.8,
      reviews: 156,
      description: 'Beurre de karité 100% pur, non raffiné, commerce équitable',
      category: 'Cosmétiques Naturels'
    },
    {
      id: 'savon-noir-traditionnel',
      name: 'Savon Noir Africain Authentique',
      price: 3500,
      image: '/images/savon-noir.jpg',
      vendor: 'Artisans du Sahel',
      rating: 4.6,
      reviews: 89,
      description: 'Savon noir traditionnel à base d\'huile de palme et cendres',
      category: 'Savons Traditionnels'
    },
    {
      id: 'huile-baobab',
      name: 'Huile de Baobab Pressée à Froid',
      price: 12000,
      image: '/images/huile-baobab.jpg',
      vendor: 'Bio Togo',
      rating: 4.9,
      reviews: 67,
      description: 'Huile de baobab pure, riche en vitamines et antioxydants',
      category: 'Huiles Essentielles'
    }
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

        {/* MagnifyingGlassIcon and FunnelIcons */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* MagnifyingGlassIcon Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des produits naturels..."
                    value={searchQuery}
                    onChange={(e) => setMagnifyingGlassIconQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category FunnelIcon */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFunnelIcons(!showFunnelIcons)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filtres
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos Catégories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {parapharmacyCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border hover:border-green-200"
                  >
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured Products */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Produits Vedettes</h2>
              <Link href="/vendeur/nouveau-produit" className="flex items-center text-green-600 hover:text-green-700 font-medium">
                <PlusIcon className="h-4 w-4 mr-1" />
                Vendre un produit
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-100 to-blue-100">
                      <BeakerIcon className="h-16 w-16 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-600">{product.category}</span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {product.vendor}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {product.price.toLocaleString()} CFA
                      </span>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action for Vendors */}
          <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Vous êtes producteur ou artisan ?</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Rejoignez notre marketplace et vendez vos produits traditionnels africains 
              à une clientèle qui valorise l'authenticité et la qualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vendeur/inscription" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Devenir vendeur
              </Link>
              <Link href="/vendeur/guide" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
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