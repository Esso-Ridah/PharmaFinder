import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useNotifications } from '../hooks/useNotifications';
import CartDropdown from './CartDropdown';
import NotificationDropdown from './NotificationDropdown';

const navigation = [
  { name: 'Accueil', href: '/', current: false },
  { name: 'Pharmacies', href: '/pharmacies', current: false },
  { name: 'Vue sur carte', href: '/carte', current: false },
  { name: 'À propos', href: '/about', current: false },
  { name: 'Contact', href: '/contact', current: false },
];

const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update navigation current state based on current path
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: router.pathname === item.href || 
             (item.href !== '/' && router.pathname.startsWith(item.href))
  }));

  const userNavigation = [
    { name: 'Mon Profil', href: '/profile' },
    { name: 'Mes Commandes', href: '/orders' },
    { name: 'Mes Adresses', href: '/addresses' },
    ...(user?.role === 'pharmacist' || user?.role === 'admin' 
      ? [{ name: 'Dashboard Pharmacie', href: '/pharmacy/dashboard' }] 
      : []),
    ...(user?.role === 'admin' 
      ? [{ name: 'Administration', href: '/admin' }] 
      : []),
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="ml-2 text-xl font-display font-bold text-gray-900">
                  PharmaFinder
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:space-x-8">
            {updatedNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  item.current
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>


          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart - Available for all users */}
            <CartDropdown />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

                {/* Favorites */}
                <Link
                  href="/favorites"
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <span className="sr-only">Favoris</span>
                  <HeartIcon className="h-6 w-6" aria-hidden="true" />
                </Link>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      {user?.first_name ? (
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.first_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={clsx(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'block w-full text-left px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Se déconnecter
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary btn-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menu principal</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <Transition
        show={mobileMenuOpen}
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {updatedNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  item.current
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800',
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Cart link for mobile */}
            <Link
              href="/cart"
              className="flex items-center justify-between pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Mon Panier</span>
              {totalItems > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full min-w-[20px]">
                  {totalItems}
                </span>
              )}
            </Link>

            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  {user?.first_name ? (
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {user.first_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </Transition>

    </header>
  );
};

export default Header;