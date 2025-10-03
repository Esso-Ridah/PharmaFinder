import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  UserCircleIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

import PartnerLayout from '../../components/PartnerLayout';

const PartnerProfile: NextPage = () => {
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

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Mes Informations - PharmaFinder Partenaire</title>
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
        <title>Mes Informations - PharmaFinder Partenaire</title>
        <meta name="description" content="Gérez vos informations personnelles et de pharmacie" />
      </Head>

      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes Informations</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Gérez vos informations personnelles et de pharmacie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations personnelles */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations Personnelles</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.phone || 'Non renseigné'}</p>
                </div>
                <button className="btn-primary">Modifier mes informations</button>
              </div>
            </div>

            {/* Informations pharmacie */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations Pharmacie</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de la pharmacie</label>
                  <input
                    type="text"
                    defaultValue="Pharmacie Centrale de Lomé"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro de licence</label>
                  <input
                    type="text"
                    defaultValue="PH-LOM-2024-001"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse complète</label>
                  <textarea
                    rows={3}
                    defaultValue="123 Avenue de la Libération, Quartier Administratif, Lomé, Togo"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone pharmacie</label>
                    <input
                      type="tel"
                      defaultValue="+228 22 25 45 67"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email pharmacie</label>
                    <input
                      type="email"
                      defaultValue="contact@pharmaciecentrale-lome.tg"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horaires d'ouverture</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm text-gray-600">Lun-Ven:</span>
                      <input type="time" defaultValue="08:00" className="border border-gray-300 rounded px-2 py-1" />
                      <span className="text-sm text-gray-600">à</span>
                      <input type="time" defaultValue="19:00" className="border border-gray-300 rounded px-2 py-1" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm text-gray-600">Samedi:</span>
                      <input type="time" defaultValue="08:00" className="border border-gray-300 rounded px-2 py-1" />
                      <span className="text-sm text-gray-600">à</span>
                      <input type="time" defaultValue="15:00" className="border border-gray-300 rounded px-2 py-1" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm text-gray-600">Dimanche:</span>
                      <select className="border border-gray-300 rounded px-2 py-1">
                        <option value="closed" selected>Fermé</option>
                        <option value="open">Ouvert</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button className="btn-primary">Sauvegarder les modifications</button>
                </div>
              </div>
            </div>
            </div>

            {/* Services et équipements */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Services et Équipements</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Services disponibles</h3>
                    <div className="space-y-2">
                      {[
                        'Conseil pharmaceutique',
                        'Mesure tension artérielle',
                        'Test de glycémie',
                        'Livraison à domicile',
                        'Commande téléphonique',
                        'Garde de nuit'
                      ].map((service) => (
                        <label key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={['Conseil pharmaceutique', 'Livraison à domicile', 'Commande téléphonique'].includes(service)}
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Équipements</h3>
                    <div className="space-y-2">
                      {[
                        'Réfrigérateur médical',
                        'Terminal de paiement',
                        'Balance de précision',
                        'Tensiomètre',
                        'Glucomètre',
                        'Climatisation'
                      ].map((equipement) => (
                        <label key={equipement} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={['Réfrigérateur médical', 'Terminal de paiement', 'Climatisation'].includes(equipement)}
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{equipement}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Spécialités</h3>
                    <div className="space-y-2">
                      {[
                        'Médicaments génériques',
                        'Phytothérapie',
                        'Homéopathie',
                        'Nutrition sportive',
                        'Cosmétiques médicaux',
                        'Matériel médical'
                      ].map((specialite) => (
                        <label key={specialite} className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={['Médicaments génériques', 'Cosmétiques médicaux', 'Matériel médical'].includes(specialite)}
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{specialite}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description de la pharmacie
                    </label>
                    <textarea
                      rows={4}
                      defaultValue="Pharmacie moderne située au cœur de Lomé, spécialisée dans la dispensation de médicaments de qualité et le conseil pharmaceutique personnalisé. Équipe de pharmaciens expérimentés à votre service."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Décrivez votre pharmacie, vos spécialités, votre équipe..."
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button className="btn-primary">Sauvegarder les services</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
};

export default PartnerProfile;