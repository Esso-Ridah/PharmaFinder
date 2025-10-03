import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BuildingStorefrontIcon,
  ChartBarIcon,
  CubeIcon,
  TicketIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const PartnerHeader: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications data
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Nouvelle commande reçue',
      message: 'Commande #CMD-2025-001 - 3 produits',
      time: 'Il y a 2 minutes',
      unread: true,
      priority: 'high'
    },
    {
      id: 2,
      type: 'stock',
      title: 'Stock faible - Paracétamol',
      message: 'Il ne reste que 8 unités en stock',
      time: 'Il y a 1 heure',
      unread: true,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Paiement confirmé',
      message: 'Commande #CMD-2025-000 payée (45,000 FCFA)',
      time: 'Il y a 3 heures',
      unread: false,
      priority: 'low'
    },
    {
      id: 4,
      type: 'system',
      title: 'Mise à jour du catalogue',
      message: 'Nouveaux prix reçus du fournisseur',
      time: 'Il y a 5 heures',
      unread: false,
      priority: 'low'
    },
    {
      id: 5,
      type: 'stock',
      title: 'Produit expiré bientôt',
      message: 'Vitamine C expire dans 10 jours',
      time: 'Il y a 1 jour',
      unread: false,
      priority: 'medium'
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
    }
  }, []);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/partner/dashboard',
      icon: BuildingStorefrontIcon,
      current: router.pathname === '/partner/dashboard',
    },
    {
      name: 'Mes Infos',
      href: '/partner/profile',
      icon: UserCircleIcon,
      current: router.pathname === '/partner/profile',
      description: 'Informations de ma pharmacie',
    },
    {
      name: 'Statistiques',
      href: '/partner/analytics',
      icon: ChartBarIcon,
      current: router.pathname === '/partner/analytics',
      description: 'Ventes, revenus, performances',
    },
    {
      name: 'Stocks',
      href: '/partner/inventory',
      icon: CubeIcon,
      current: router.pathname === '/partner/inventory',
      description: 'Gestion des stocks et produits',
    },
    {
      name: 'Tickets',
      href: '/partner/tickets',
      icon: TicketIcon,
      current: router.pathname.startsWith('/partner/tickets'),
      description: 'Conflits, réclamations, annulations',
    },
    {
      name: 'Aide',
      href: '/partner/support',
      icon: QuestionMarkCircleIcon,
      current: router.pathname === '/partner/support',
      description: 'Support et assistance admin',
    },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Barre de notifications (optionnelle) */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center text-green-700">
              <BellIcon className="h-4 w-4 mr-2" />
              Bienvenue dans votre espace partenaire PharmaFinder
            </div>
            <div className="text-green-600">
              Status: {user?.role === 'pharmacist' ? 'Pharmacien Vérifié' : 'En attente'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <Link href="/partner/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-gray-900">PharmaFinder</span>
                <div className="text-xs text-gray-500">Espace Partenaire</div>
              </div>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </div>
                  
                  {/* Tooltip */}
                  {item.description && (
                    <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-2 px-3 bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions utilisateur Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      Notifications ({unreadCount} non lues)
                    </h3>
                    {unreadCount > 0 && (
                      <button className="text-xs text-green-600 hover:text-green-700">
                        Marquer toutes comme lues
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => {
                      const getNotificationIcon = (type: string) => {
                        switch (type) {
                          case 'order': return '🛒';
                          case 'stock': return '📦';
                          case 'payment': return '💳';
                          case 'system': return '⚙️';
                          default: return '🔔';
                        }
                      };

                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'high': return 'border-l-red-500';
                          case 'medium': return 'border-l-yellow-500';
                          case 'low': return 'border-l-green-500';
                          default: return 'border-l-gray-300';
                        }
                      };

                      return (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${getPriorityColor(notification.priority)} ${
                            notification.unread ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  notification.unread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <button className="text-sm text-green-600 hover:text-green-700">
                      Voir toutes les notifications
                    </button>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      Paramètres
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu utilisateur */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => {
                  setShowNotifications(false);
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Pharmacien</p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <Link
                    href="/partner/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Mon Profil
                  </Link>
                  <Link
                    href="/partner/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Clear localStorage and redirect to home
                      localStorage.removeItem('access_token');
                      localStorage.removeItem('user_data');
                      router.push('/');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Menu mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    item.current
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div>
                    <div>{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Actions utilisateur mobile */}
          <div className="border-t border-gray-200 pt-4 pb-3">
            <div className="flex items-center px-4">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={() => {
                  // Clear localStorage and redirect to home
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_data');
                  router.push('/');
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-500 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PartnerHeader;