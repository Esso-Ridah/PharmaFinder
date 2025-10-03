import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import PartnerLayout from '../../components/PartnerLayout';

const PartnerInventory: NextPage = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'pharmacist') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      router.push('/auth/login');
      return;
    }
    
    setAuthLoading(false);
  }, [router]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous les produits' },
    { id: 'medications', name: 'Médicaments' },
    { id: 'vitamins', name: 'Vitamines' },
    { id: 'antibiotics', name: 'Antibiotiques' },
    { id: 'parapharma', name: 'Parapharmacie' },
  ];

  const products = [
    {
      id: 1,
      name: 'Paracétamol 500mg',
      category: 'medications',
      price: '500 FCFA',
      stock: 45,
      minStock: 20,
      status: 'available',
      lastUpdate: '2025-01-15',
      barcode: '3401056734061',
      expiry: '2026-08-15',
      batch: 'LOT2025A'
    },
    {
      id: 2,
      name: 'Vitamine C 1000mg',
      category: 'vitamins',
      price: '750 FCFA',
      stock: 8,
      minStock: 15,
      status: 'low',
      lastUpdate: '2025-01-14',
      barcode: '3401056734062',
      expiry: '2025-12-30',
      batch: 'LOT2024B'
    },
    {
      id: 3,
      name: 'Amoxicilline 250mg',
      category: 'antibiotics',
      price: '1200 FCFA',
      stock: 0,
      minStock: 10,
      status: 'out',
      lastUpdate: '2025-01-10',
      barcode: '3401056734063',
      expiry: '2025-06-20',
      batch: 'LOT2024C'
    },
    {
      id: 4,
      name: 'Doliprane 1000mg',
      category: 'medications',
      price: '600 FCFA',
      stock: 32,
      minStock: 25,
      status: 'available',
      lastUpdate: '2025-01-16',
      barcode: '3401056734064',
      expiry: '2026-03-10',
      batch: 'LOT2025D'
    },
    {
      id: 5,
      name: 'Crème hydratante',
      category: 'parapharma',
      price: '2500 FCFA',
      stock: 12,
      minStock: 10,
      status: 'available',
      lastUpdate: '2025-01-15',
      barcode: '3401056734065',
      expiry: '2025-09-25',
      batch: 'LOT2024E'
    },
    {
      id: 6,
      name: 'Aspirine 100mg',
      category: 'medications',
      price: '350 FCFA',
      stock: 67,
      minStock: 30,
      status: 'available',
      lastUpdate: '2025-01-16',
      barcode: '3401056734066',
      expiry: '2026-11-15',
      batch: 'LOT2025F'
    },
    {
      id: 7,
      name: 'Sérum physiologique',
      category: 'medications',
      price: '200 FCFA',
      stock: 5,
      minStock: 20,
      status: 'low',
      lastUpdate: '2025-01-13',
      barcode: '3401056734067',
      expiry: '2025-10-30',
      batch: 'LOT2024G'
    },
    {
      id: 8,
      name: 'Bandages élastiques',
      category: 'parapharma',
      price: '800 FCFA',
      stock: 28,
      minStock: 15,
      status: 'available',
      lastUpdate: '2025-01-14',
      barcode: '3401056734068',
      expiry: '2027-01-20',
      batch: 'LOT2025H'
    }
  ];

  const getStatusBadge = (status: string, stock: number) => {
    if (status === 'out' || stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Rupture
        </span>
      );
    }
    if (status === 'low') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Stock faible
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Disponible
      </span>
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  if (authLoading) {
    return (
      <>
        <Head>
          <title>Gestion des Stocks - PharmaFinder Partenaire</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  const stats = [
    {
      name: 'Total produits',
      value: products.length.toString(),
      description: 'Produits en catalogue',
    },
    {
      name: 'En stock',
      value: products.filter(p => p.stock > 0).length.toString(),
      description: 'Produits disponibles',
    },
    {
      name: 'Stock faible',
      value: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length.toString(),
      description: 'Besoin de réappro',
    },
    {
      name: 'Ruptures',
      value: products.filter(p => p.stock === 0).length.toString(),
      description: 'Produits épuisés',
    },
  ];

  return (
    <PartnerLayout>
      <Head>
        <title>Gestion des Stocks - PharmaFinder Partenaire</title>
        <meta name="description" content="Gérez votre inventaire et vos stocks de produits" />
      </Head>

      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Gérez votre inventaire et suivez vos stocks
                    </p>
                  </div>
                </div>
                <button className="btn-primary flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.name}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors">
              <PlusIcon className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">Ajouter produit</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">📊 Rapport stock</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">⚠️ Alertes stock</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-900">📦 Import CSV</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Produits ({filteredProducts.length})
              </h3>
              <div className="flex items-center space-x-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="all">Tous les statuts</option>
                  <option value="available">Disponible</option>
                  <option value="low">Stock faible</option>
                  <option value="out">Rupture</option>
                </select>
                <button className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                  Exporter
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière MAJ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {categories.find(c => c.id === product.category)?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock} unités</div>
                        <div className="text-xs text-gray-500">Min: {product.minStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status, product.stock)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.lastUpdate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded" 
                            title="Ajuster stock"
                          >
                            📦
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900 p-1 rounded" 
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded" 
                            title="Historique"
                          >
                            📊
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 p-1 rounded" 
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerInventory;