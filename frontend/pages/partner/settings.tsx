import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

import PartnerLayout from '../../components/PartnerLayout';

const PartnerSettings: NextPage = () => {
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

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    orderUpdates: true,
    stockAlerts: true,
    paymentAlerts: true,
  });


  if (authLoading) {
    return (
      <>
        <Head>
          <title>Paramètres - PharmaFinder Partenaire</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <PartnerLayout>
      <Head>
        <title>Paramètres - PharmaFinder Partenaire</title>
        <meta name="description" content="Gérez vos paramètres et préférences" />
      </Head>

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gérez vos préférences et paramètres de compte
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu latéral */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                <a href="#profile" className="bg-green-50 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <UserIcon className="text-green-500 mr-3 h-5 w-5" />
                  Profil
                </a>
                <a href="#notifications" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <BellIcon className="text-gray-400 group-hover:text-gray-500 mr-3 h-5 w-5" />
                  Notifications
                </a>
                <a href="#security" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <ShieldCheckIcon className="text-gray-400 group-hover:text-gray-500 mr-3 h-5 w-5" />
                  Sécurité
                </a>
                <a href="#devices" className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <DevicePhoneMobileIcon className="text-gray-400 group-hover:text-gray-500 mr-3 h-5 w-5" />
                  Appareils
                </a>
              </nav>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section Profil */}
              <div id="profile" className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Informations du profil</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Mettez à jour vos informations personnelles
                  </p>
                </div>
                <div className="px-6 py-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.first_name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.last_name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue={user?.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Notifications */}
              <div id="notifications" className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Préférences de notification</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Choisissez comment vous souhaitez être notifié
                  </p>
                </div>
                <div className="px-6 py-4 space-y-6">
                  {/* Types de notifications */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Canaux de notification</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-900">Notifications par email</span>
                          <p className="text-xs text-gray-500">Recevez des emails pour les mises à jour importantes</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('email', !notifications.email)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.email ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.email ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-900">Notifications SMS</span>
                          <p className="text-xs text-gray-500">Recevez des SMS pour les urgences</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('sms', !notifications.sms)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.sms ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.sms ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Types d'alertes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Types d'alertes</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">Nouvelles commandes</span>
                        <button
                          onClick={() => handleNotificationChange('orderUpdates', !notifications.orderUpdates)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.orderUpdates ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">Alertes de stock</span>
                        <button
                          onClick={() => handleNotificationChange('stockAlerts', !notifications.stockAlerts)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.stockAlerts ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.stockAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">Confirmations de paiement</span>
                        <button
                          onClick={() => handleNotificationChange('paymentAlerts', !notifications.paymentAlerts)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.paymentAlerts ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.paymentAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Sécurité */}
              <div id="security" className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Gérez votre mot de passe et vos options de sécurité
                  </p>
                </div>
                <div className="px-6 py-4 space-y-6">
                  <div>
                    <button className="flex items-center text-sm text-green-600 hover:text-green-700">
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Changer le mot de passe
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-900">Authentification à deux facteurs</span>
                        <p className="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                      </div>
                      <button className="text-sm text-green-600 hover:text-green-700">
                        Configurer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerSettings;