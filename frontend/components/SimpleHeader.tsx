import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Pharmacies', href: '/pharmacies' },
  { name: 'Vue sur carte', href: '/carte' },
  { name: 'À propos', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const SimpleHeader: React.FC = () => {
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">PharmaFinder</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex lg:space-x-8">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Se connecter
            </Link>
            <Link href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;