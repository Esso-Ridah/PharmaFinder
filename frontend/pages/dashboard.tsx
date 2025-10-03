import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { MagnifyingGlassIcon, UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - PharmaFinder</title>
        <meta name="description" content="Votre tableau de bord PharmaFinder" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour, {user?.first_name || 'Client'} !
                </h1>
                <p className="text-gray-600">
                  Trouvez et commandez vos médicaments en quelques clics
                </p>
              </div>
              {/*<div className="flex items-center space-x-4">
                <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary-600">
                  <ShoppingCartIcon className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="p-2 text-gray-600 hover:text-primary-600">
                  <UserCircleIcon className="h-6 w-6" />
                </Link>
              </div>*/}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Rechercher un médicament
            </h2>
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un médicament..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-4 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/search" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rechercher</h3>
                <p className="text-gray-600">Trouvez vos médicaments et pharmacies</p>
              </div>
            </Link>

            <Link href="/cart" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <ShoppingCartIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mon Panier</h3>
                <p className="text-gray-600">
                  {totalItems > 0 ? `${totalItems} article${totalItems > 1 ? 's' : ''}` : 'Panier vide'}
                </p>
              </div>
            </Link>

            <Link href="/orders" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <UserCircleIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mes Commandes</h3>
                <p className="text-gray-600">Suivez vos commandes en cours</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;