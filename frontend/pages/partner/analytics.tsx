import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PartnerLayout from '../../components/PartnerLayout';

const PartnerAnalytics: NextPage = () => {
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

  // Simulated analytics data
  const statsData = {
    monthly_revenue: {
      value: '2,450,000 FCFA',
      change: '+12.5%'
    },
    monthly_orders: {
      value: '186',
      change: '+8.3%'
    },
    unique_customers: {
      value: '124',
      change: '+15.2%'
    },
    products_sold: {
      value: '542',
      change: '+9.8%'
    },
    has_pharmacy: true
  };

  const topProducts = [
    {
      name: 'Paracétamol 500mg',
      sales: 89,
      revenue: '445,000 FCFA'
    },
    {
      name: 'Amoxicilline 250mg',
      sales: 67,
      revenue: '804,000 FCFA'
    },
    {
      name: 'Vitamine C 1000mg',
      sales: 54,
      revenue: '405,000 FCFA'
    },
    {
      name: 'Doliprane 1000mg',
      sales: 43,
      revenue: '258,000 FCFA'
    },
    {
      name: 'Aspirine 100mg',
      sales: 38,
      revenue: '190,000 FCFA'
    }
  ];

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Statistiques - PharmaFinder Partenaire</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <PartnerLayout>
      <Head>
        <title>Statistiques - PharmaFinder Partenaire</title>
        <meta name="description" content="Consultez vos statistiques de ventes et performances" />
      </Head>
      
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h1>
          
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Chiffre d'affaires mensuel</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsData?.monthly_revenue?.value || '0 FCFA'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {statsData?.monthly_revenue?.change || '0%'} vs mois dernier
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Commandes ce mois</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsData?.monthly_orders?.value || '0'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {statsData?.monthly_orders?.change || '0%'} vs mois dernier
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Clients uniques</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsData?.unique_customers?.value || '0'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {statsData?.unique_customers?.change || '0%'} vs mois dernier
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Produits vendus</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsData?.products_sold?.value || '0'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {statsData?.products_sold?.change || '0%'} vs mois dernier
              </p>
            </div>
          </div>

          {/* Produits les plus vendus */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Produits les plus vendus</h3>
            <div className="space-y-4">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} unités vendues</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {product.revenue}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    {statsData && !statsData.has_pharmacy 
                      ? "Configurez votre pharmacie pour voir vos produits les plus vendus"
                      : "Aucun produit vendu ce mois-ci"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerAnalytics;